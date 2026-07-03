import { NextRequest, NextResponse } from "next/server";
import { setSessionVideo } from "@/lib/videoStore";

// Bunny.net status codes
const STATUS_READY = 4;

export async function POST(req: NextRequest) {
  // אימות secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.BUNNY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { VideoGuid, VideoLibraryId, Status, VideoTitle } = body;

  // מקבל רק סרטונים מוכנים
  if (Status !== STATUS_READY) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // VideoTitle צריך להיות "1" או "2" (מספר השיעור)
  const sessionId = String(VideoTitle || "").trim();
  if (!["1", "2"].includes(sessionId)) {
    return NextResponse.json(
      { error: `Unknown session title: "${sessionId}". Expected "1" or "2".` },
      { status: 400 }
    );
  }

  await setSessionVideo(sessionId, {
    libraryId: String(VideoLibraryId),
    videoId: String(VideoGuid),
    title: VideoTitle,
    uploadedAt: new Date().toISOString(),
  });

  console.log(`✅ Session ${sessionId} video saved: ${VideoGuid}`);
  return NextResponse.json({ ok: true, sessionId });
}
