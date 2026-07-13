import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import {
  getDriveClient,
  uploadAudioToFireflies,
  findTranscriptIdByTitle,
  lockTranscriptPrivacy,
  fetchTranscriptDetails,
  parseContactNameFromTitle,
} from "@/lib/callTranscription";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILES_PER_RUN = 3;
const MAX_PRIVACY_SYNC_PER_RUN = 5;
const BLOB_CLEANUP_DELAY_MS = 10 * 60 * 1000;

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

  // Clean up blobs from previous runs once Fireflies has had time to fetch them
  const { data: pendingCleanup } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id, blob_pathname, created_at")
    .eq("blob_deleted", false);

  let cleaned = 0;
  for (const row of pendingCleanup ?? []) {
    if (!row.blob_pathname) continue;
    if (Date.now() - new Date(row.created_at).getTime() < BLOB_CLEANUP_DELAY_MS) continue;
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
  const { data: pendingPrivacy } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id, fireflies_title")
    .eq("privacy_locked", false)
    .not("fireflies_title", "is", null)
    .limit(MAX_PRIVACY_SYNC_PER_RUN);

  let locked = 0;
  for (const row of pendingPrivacy ?? []) {
    try {
      const transcriptId = await findTranscriptIdByTitle(row.fireflies_title);
      if (!transcriptId) continue;
      await lockTranscriptPrivacy(transcriptId);

      const details = await fetchTranscriptDetails(transcriptId);
      await supabase.from("call_transcripts").upsert({
        fireflies_id: details.id,
        drive_file_id: row.drive_file_id,
        title: details.title,
        contact_name: parseContactNameFromTitle(details.title),
        call_date: new Date(details.date).toISOString(),
        duration_seconds: details.duration,
        summary: details.summary,
        keywords: details.keywords,
        action_items: details.actionItems,
        transcript_text: details.transcriptText,
        source: "phone",
      });

      await supabase
        .from("call_recordings_processed")
        .update({ privacy_locked: true })
        .eq("drive_file_id", row.drive_file_id);
      locked++;
    } catch (err) {
      console.error("Privacy lock error:", row.fireflies_title, err);
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

  const { data: processedRows } = await supabase
    .from("call_recordings_processed")
    .select("drive_file_id");
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

      let skipped = false;
      try {
        await uploadAudioToFireflies(blob.url, title, file.id!);
      } catch (uploadErr) {
        if (String(uploadErr).includes("payload_too_small")) {
          skipped = true;
        } else {
          throw uploadErr;
        }
      }

      await supabase.from("call_recordings_processed").insert({
        drive_file_id: file.id,
        file_name: file.name,
        blob_pathname: blob.pathname,
        fireflies_title: skipped ? null : title,
      });

      results.push({ file: file.name!, ok: true, skipped });
    } catch (err) {
      console.error("Processing error:", file.name, err);
      results.push({ file: file.name ?? file.id!, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({ cleaned, locked, processed: results.length, results });
}
