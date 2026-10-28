import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import {
  getDriveClient,
  uploadAudioToFireflies,
  listRecentTranscriptIds,
  lockTranscriptPrivacy,
  fetchTranscriptDetails,
  deleteTranscript,
  transcriptRow,
} from "@/lib/callTranscription";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILES_PER_RUN = 6;
const MAX_PRIVACY_SYNC_PER_RUN = 15;
const BLOB_CLEANUP_DELAY_MS = 10 * 60 * 1000;
const BLOB_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PRIVACY_SYNC_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_FINALIZE_PER_RUN = 10;
const FINALIZE_AFTER_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CALLS_CRON_SECRET || auth !== `Bearer ${process.env.CALLS_CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getRabanimSupabase();
  const folderId = process.env.DRIVE_CALLS_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "DRIVE_CALLS_FOLDER_ID missing" }, { status: 500 });
  }

  // Clean up blobs only once Fireflies has the transcript (privacy_locked) or
  // the file was skipped. Under a backlog Fireflies can take well over an hour
  // to fetch the URL, and a blob deleted before that is silently dropped.
  const { data: pendingCleanup } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id, blob_pathname, created_at, privacy_locked, fireflies_title")
    .eq("blob_deleted", false);

  let cleaned = 0;
  for (const row of pendingCleanup ?? []) {
    if (!row.blob_pathname) continue;
    const age = Date.now() - new Date(row.created_at).getTime();
    const fetched = row.privacy_locked || row.fireflies_title === null;
    if (fetched ? age < BLOB_CLEANUP_DELAY_MS : age < BLOB_MAX_AGE_MS) continue;
    try {
      await del(row.blob_pathname, { token: process.env.CALLS_BLOB_TOKEN });
    } catch (err) {
      console.error("Blob delete error:", err);
    }
    await supabase
      .from("call_recordings_processed")
      .update({ blob_deleted: true })
      .eq("drive_file_id", row.drive_file_id);
    cleaned++;
  }

  // Lock down privacy on transcripts from earlier runs, once Fireflies has
  // finished processing them (uploadAudio doesn't return a transcript id,
  // so this has to be matched up afterwards by exact title). Once matched,
  // also pull the full transcript into our own searchable table.
  // Only recent rows: transcripts get archived and deleted from Fireflies, so
  // an old unmatched row would never match. Rows are matched against one list
  // of recent transcripts, so rows that never show up can't block the rest.
  const { data: pendingPrivacy } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id, fireflies_title")
    .eq("privacy_locked", false)
    .not("fireflies_title", "is", null)
    .gte("created_at", new Date(Date.now() - PRIVACY_SYNC_WINDOW_MS).toISOString())
    .order("created_at", { ascending: false });

  const recentIds = pendingPrivacy?.length ? await listRecentTranscriptIds() : new Map<string, string>();
  const matched = (pendingPrivacy ?? [])
    .filter((row) => recentIds.has(row.fireflies_title))
    .slice(0, MAX_PRIVACY_SYNC_PER_RUN);

  let locked = 0;
  for (const row of matched) {
    try {
      const transcriptId = recentIds.get(row.fireflies_title)!;
      await lockTranscriptPrivacy(transcriptId);

      const details = await fetchTranscriptDetails(transcriptId);
      const { error: saveErr } = await supabase
        .from("call_transcripts")
        .upsert(transcriptRow(details, row.drive_file_id));
      if (saveErr) throw new Error(`save: ${saveErr.message}`);

      await supabase
        .from("call_recordings_processed")
        .update({ privacy_locked: true })
        .eq("drive_file_id", row.drive_file_id);
      locked++;
    } catch (err) {
      console.error("Privacy lock error:", row.fireflies_title, err);
    }
  }

  // Supabase is the permanent home; Fireflies is only a transit point. A day
  // after a call is saved (by then Fireflies' summary is final), refresh the
  // row once more and delete the transcript from Fireflies.
  const { data: toFinalize } = await supabase
    .from("call_transcripts")
    .select("fireflies_id, drive_file_id")
    .eq("kind", "phone_call")
    .is("fireflies_deleted_at", null)
    .lt("synced_at", new Date(Date.now() - FINALIZE_AFTER_MS).toISOString())
    .order("synced_at", { ascending: true })
    .limit(MAX_FINALIZE_PER_RUN);

  let finalized = 0;
  for (const row of toFinalize ?? []) {
    try {
      let details;
      try {
        details = await fetchTranscriptDetails(row.fireflies_id);
      } catch (err) {
        if (!/not found/i.test(String(err))) throw err;
      }
      if (details) {
        const { error: saveErr } = await supabase
          .from("call_transcripts")
          .upsert(transcriptRow(details, row.drive_file_id));
        if (saveErr) throw new Error(`save: ${saveErr.message}`);
        await deleteTranscript(row.fireflies_id);
      }
      await supabase
        .from("call_transcripts")
        .update({ fireflies_deleted_at: new Date().toISOString() })
        .eq("fireflies_id", row.fireflies_id);
      finalized++;
    } catch (err) {
      console.error("Finalize error:", row.fireflies_id, err);
    }
  }

  const drive = getDriveClient();
  const sinceClause = process.env.PIPELINE_START_DATE
    ? ` and createdTime > '${process.env.PIPELINE_START_DATE}'`
    : "";
  const listRes = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false${sinceClause}`,
    fields: "files(id, name, mimeType)",
    orderBy: "createdTime desc",
    pageSize: 50,
  });
  const files = (listRes.data.files ?? []).filter(
    (f) => f.id && f.mimeType && !f.mimeType.startsWith("application/vnd.google-apps")
  );

  // Look up only the listed files: a full-table select is silently capped at
  // 1000 rows, which made already-processed files look new again.
  const { data: processedRows, error: processedErr } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id")
    .in("drive_file_id", files.map((f) => f.id!));
  if (processedErr) {
    return NextResponse.json({ error: `processed lookup: ${processedErr.message}` }, { status: 500 });
  }
  const processedIds = new Set((processedRows ?? []).map((r) => r.drive_file_id));

  const newFiles = files.filter((f) => !processedIds.has(f.id!)).slice(0, MAX_FILES_PER_RUN);

  const results: { file: string; ok: boolean; skipped?: boolean; error?: string }[] = [];

  for (const file of newFiles) {
    try {
      const dl = await drive.files.get(
        { fileId: file.id!, alt: "media" },
        { responseType: "arraybuffer" }
      );
      const buffer = Buffer.from(dl.data as ArrayBuffer);

      const blob = await put(`call-recordings/${file.id}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: file.mimeType ?? undefined,
        token: process.env.CALLS_BLOB_TOKEN,
      });

      const title = (file.name ?? file.id!).replace(/\.[^/.]+$/, "");

      // Claim the file before uploading, so a failed state write can never
      // lead to the same recording being sent to Fireflies again.
      const { error: claimErr } = await supabase.from("call_recordings_processed").insert({
        drive_file_id: file.id,
        file_name: file.name,
        blob_pathname: blob.pathname,
        fireflies_title: title,
      });
      if (claimErr) throw new Error(`claim: ${claimErr.message}`);

      let skipped = false;
      try {
        await uploadAudioToFireflies(blob.url, title, file.id!);
      } catch (uploadErr) {
        if (String(uploadErr).includes("payload_too_small")) {
          skipped = true;
          await supabase
            .from("call_recordings_processed")
            .update({ fireflies_title: null })
            .eq("drive_file_id", file.id!);
        } else {
          await supabase.from("call_recordings_processed").delete().eq("drive_file_id", file.id!);
          throw uploadErr;
        }
      }

      results.push({ file: file.name!, ok: true, skipped });
    } catch (err) {
      console.error("Processing error:", file.name, err);
      results.push({ file: file.name ?? file.id!, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({ cleaned, locked, finalized, processed: results.length, results });
}
