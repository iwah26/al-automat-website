import { NextRequest, NextResponse } from "next/server";
import { getPollResults } from "@/lib/zoomPolls";

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get("meetingId");
  if (!meetingId) {
    return NextResponse.json(
      { error: "missing meetingId" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const results = await getPollResults(meetingId);
    return NextResponse.json({ ok: true, results }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}
