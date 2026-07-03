import { put, list } from "@vercel/blob";

export interface VideoData {
  libraryId: string;
  videoId: string;
  title: string;
  uploadedAt: string;
}

const CONFIG_FILENAME = "course-videos.json";

async function readConfig(): Promise<Record<string, VideoData>> {
  try {
    const { blobs } = await list({ prefix: "course-videos" });
    if (blobs.length === 0) return {};
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function writeConfig(data: Record<string, VideoData>) {
  await put(CONFIG_FILENAME, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
  });
}

export async function setSessionVideo(sessionId: string, data: VideoData) {
  const config = await readConfig();
  config[sessionId] = data;
  await writeConfig(config);
}

export async function getSessionVideo(sessionId: string): Promise<VideoData | null> {
  const config = await readConfig();
  return config[sessionId] ?? null;
}
