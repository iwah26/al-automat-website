import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getZoomAccessToken } from "@/lib/zoom";
import { createBunnyVideo, fetchBunnyVideoFromUrl } from "@/lib/bunny";

// Recurring workshop meeting — recording date maps to the session shown on /course
const SESSION_DATES: Record<string, string> = {
  "2026-07-12": "1",
  "2026-07-19": "2",
};

function verifyZoomSignature(rawBody: string, timestamp: string | null, signature: string | null) {
  if (!timestamp || !signature) return false;
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto
    .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN!)
    .update(message)
    .digest("hex");
  return signature === `v0=${hash}`;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const body = JSON.parse(rawBody);

  // One-time URL validation challenge Zoom sends when you save the Event Subscription
  if (body.event === "endpoint.url_validation") {
    const hash = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN!)
      .update(body.payload.plainToken)
      .digest("hex");
    return NextResponse.json({
      plainToken: body.payload.plainToken,
      encryptedToken: hash,
    });
  }

  const timestamp = req.headers.get("x-zm-request-timestamp");
  const signature = req.headers.get("x-zm-signature");
  if (!verifyZoomSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (body.event !== "recording.completed") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const meeting = body.payload.object;
  const startDate = String(meeting.start_time || "").slice(0, 10);
  const sessionId = SESSION_DATES[startDate];
  if (!sessionId) {
    return NextResponse.json(
      { error: `Unknown session date: ${startDate}` },
      { status: 400 }
    );
  }

  const files = meeting.recording_files || [];
  const file =
    files.find((f: { recording_type?: string }) => f.recording_type === "shared_screen_with_speaker_view") ??
    files.find((f: { file_type?: string }) => f.file_type === "MP4");

  if (!file) {
    return NextResponse.json({ error: "No MP4 recording file found" }, { status: 400 });
  }

  const accessToken = await getZoomAccessToken();
  const downloadUrl = `${file.download_url}?access_token=${accessToken}`;

  const videoId = await createBunnyVideo(sessionId);
  await fetchBunnyVideoFromUrl(videoId, downloadUrl);

  console.log(`✅ Session ${sessionId} recording sent to Bunny: ${videoId}`);
  return NextResponse.json({ ok: true, sessionId, videoId });
}
