const BUNNY_API_BASE = "https://video.bunnycdn.com/library";

function bunnyHeaders() {
  return {
    AccessKey: process.env.BUNNY_STREAM_API_KEY!,
    "Content-Type": "application/json",
  };
}

export async function createBunnyVideo(title: string): Promise<string> {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!;
  const res = await fetch(`${BUNNY_API_BASE}/${libraryId}/videos`, {
    method: "POST",
    headers: bunnyHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Bunny create video failed: ${res.status}`);
  }
  const data = await res.json();
  return data.guid as string;
}

// Tells Bunny to pull the video directly from `url` (no proxying through our server —
// avoids Vercel function timeout/size limits on a multi-hour recording).
export async function fetchBunnyVideoFromUrl(videoId: string, url: string) {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!;
  const res = await fetch(
    `${BUNNY_API_BASE}/${libraryId}/videos/${videoId}/fetch`,
    {
      method: "POST",
      headers: bunnyHeaders(),
      body: JSON.stringify({ url }),
    }
  );
  if (!res.ok) {
    throw new Error(`Bunny fetch-from-url failed: ${res.status}`);
  }
}
