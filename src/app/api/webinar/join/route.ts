import { NextResponse } from "next/server";

const ZOOM_JOIN_URL =
  "https://us02web.zoom.us/j/86183821803?pwd=WxGDuKyu2aXIyDw42RRrxlKC5X5AnU.1";

// שלישי 21.7, 21:00 שעון ישראל + 30 דקות חסד = 18:30 UTC
const CUTOFF = new Date("2026-07-21T18:30:00Z");

export async function GET() {
  const now = new Date();
  if (now <= CUTOFF) {
    return NextResponse.redirect(ZOOM_JOIN_URL);
  }
  return NextResponse.redirect("https://www.al-automat.co.il/webinar-missed");
}
