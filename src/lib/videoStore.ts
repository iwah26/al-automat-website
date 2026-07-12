import { put, get } from "@vercel/blob";

export interface VideoData {
  libraryId: string;
  videoId: string;
  title: string;
  uploadedAt: string;
}

const CONFIG_FILENAME = "course-videos.json";

async function readConfig(): Promise<Record<string, VideoData>> {
  try {
    const blob = await get(CONFIG_FILENAME, { access: "private" });
    if (!blob) return {};
    const text = await new Response(blob.stream).text();
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function writeConfig(data: Record<string, VideoData>) {
  await put(CONFIG_FILENAME, JSON.stringify(data), {
    access: "private",
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
