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
