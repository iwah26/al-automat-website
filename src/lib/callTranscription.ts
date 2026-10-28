import { google } from "googleapis";

export function getDriveClient() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
  const credentials = JSON.parse(json);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function uploadAudioToFireflies(url: string, title: string, clientReferenceId: string) {
  const key = process.env.FIREFLIES_API_KEY;
  if (!key) throw new Error("FIREFLIES_API_KEY missing");

  const res = await fetch("https://api.fireflies.ai/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation($input: AudioUploadInput!) { uploadAudio(input: $input) { success title message } }`,
      variables: {
        input: { url, title, client_reference_id: clientReferenceId },
      },
    }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Fireflies upload error: ${JSON.stringify(json.errors)}`);
  }
  return json.data.uploadAudio;
}

async function firefliesGraphQL(query: string, variables: Record<string, unknown>) {
  const key = process.env.FIREFLIES_API_KEY;
  if (!key) throw new Error("FIREFLIES_API_KEY missing");

  const res = await fetch("https://api.fireflies.ai/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Fireflies API error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

// uploadAudio is async on Fireflies' side, so the transcript doesn't exist yet
// at upload time — find it afterwards by exact title match to lock it down.
// Title -> id for the most recent transcripts, in one or two calls, so the
// privacy queue can match many rows at once instead of searching row by row.
export async function listRecentTranscriptIds(pages = 2): Promise<Map<string, string>> {
  const byTitle = new Map<string, string>();
  for (let page = 0; page < pages; page++) {
    const data = await firefliesGraphQL(
      `query($skip: Int) { transcripts(limit: 50, skip: $skip) { id title } }`,
      { skip: page * 50 }
    );
    const batch: { id: string; title: string }[] = data.transcripts ?? [];
    for (const t of batch) if (!byTitle.has(t.title)) byTitle.set(t.title, t.id);
    if (batch.length < 50) break;
  }
  return byTitle;
}

export async function findTranscriptIdByTitle(title: string): Promise<string | null> {
  const data = await firefliesGraphQL(
    `query($title: String!) { transcripts(title: $title, limit: 1) { id title } }`,
    { title }
  );
  const match = data.transcripts?.find((t: { title: string }) => t.title === title);
  return match?.id ?? null;
}

export async function lockTranscriptPrivacy(transcriptId: string) {
  await firefliesGraphQL(
    `mutation($input: UpdateMeetingPrivacyInput!) { updateMeetingPrivacy(input: $input) { id privacy } }`,
    { input: { id: transcriptId, privacy: "owner" } }
  );
}

export interface TranscriptDetails {
  id: string;
  title: string;
  date: number;
  duration: number;
  transcriptText: string;
  summary: string | null;
  keywords: string[];
  actionItems: string | null;
}

export async function fetchTranscriptDetails(transcriptId: string): Promise<TranscriptDetails> {
  const data = await firefliesGraphQL(
    `query($id: String!) {
      transcript(id: $id) {
        id
        title
        date
        duration
        sentences { speaker_name text }
        summary { overview keywords action_items }
      }
    }`,
    { id: transcriptId }
  );
  const t = data.transcript;
  const transcriptText = (t.sentences ?? [])
    .map((s: { speaker_name: string; text: string }) => `${s.speaker_name}: ${s.text}`)
    .join("\n");

  return {
    id: t.id,
    title: t.title,
    date: t.date,
    duration: t.duration,
    transcriptText,
    summary: t.summary?.overview ?? null,
    keywords: t.summary?.keywords ?? [],
    actionItems: t.summary?.action_items ?? null,
  };
}

export async function deleteTranscript(transcriptId: string) {
  await firefliesGraphQL(`mutation($id: String!) { deleteTranscript(id: $id) { id } }`, { id: transcriptId });
}

// Parses "Grabación de llamadas <contact>_<YYMMDD>_<HHMMSS>" style titles
export function parseContactNameFromTitle(title: string): string | null {
  const match = title.match(/^(?:Grabaci[oó]n de llamadas|Llamada)\s+(.+?)_\d{6}_\d{6}$/);
  return match ? match[1].replace(/[‎‏‪-‮]/g, "").trim() : null;
}

// When the phone saved no contact, the "name" is the number itself
export function parseContactPhoneFromTitle(title: string): string | null {
  const name = parseContactNameFromTitle(title);
  const digits = name?.replace(/[\s-]/g, "") ?? "";
  if (!/^0\d{8,9}$/.test(digits)) return null;
  return `+972${digits.slice(1)}`;
}

// The call's own start time from the title (local Israel time), as an ISO string
export function parseStartedAtFromTitle(title: string): string | null {
  const m = title.match(/_(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
  const asUtc = Date.UTC(2000 + y, mo - 1, d, h, mi, s);
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", timeZoneName: "longOffset" })
    .formatToParts(new Date(asUtc))
    .find((p) => p.type === "timeZoneName")?.value.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMs = offset ? (offset[1] === "-" ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3])) * 60000 : 0;
  return new Date(asUtc - offsetMs).toISOString();
}

// One call_transcripts row from Fireflies details (duration arrives in minutes)
export function transcriptRow(details: TranscriptDetails, driveFileId: string) {
  return {
    fireflies_id: details.id,
    drive_file_id: driveFileId,
    title: details.title,
    contact_name: parseContactNameFromTitle(details.title),
    contact_phone: parseContactPhoneFromTitle(details.title),
    kind: "phone_call",
    source: "phone",
    started_at: parseStartedAtFromTitle(details.title),
    call_date: new Date(details.date).toISOString(),
    duration_seconds: Math.round(details.duration * 60),
    summary: details.summary,
    keywords: details.keywords,
    action_items: details.actionItems,
    transcript_text: details.transcriptText,
    n_words: details.transcriptText ? details.transcriptText.split(/\s+/).length : 0,
    synced_at: new Date().toISOString(),
  };
}
