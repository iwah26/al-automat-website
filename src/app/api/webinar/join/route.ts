import { NextResponse } from "next/server";

const ZOOM_JOIN_URL = "https://us02web.zoom.us/j/88563676021";

// חמישי 20.8, 21:00 שעון ישראל (18:00 UTC) + 90 דקות = עד סוף הוובינר
const CUTOFF = new Date("2026-08-20T19:30:00Z");

export async function GET() {
  const now = new Date();
  if (now <= CUTOFF) {
    return NextResponse.redirect(ZOOM_JOIN_URL);
  }
  return NextResponse.redirect("https://www.al-automat.co.il/webinar-missed");
}
