import { NextRequest, NextResponse } from "next/server";

const ZOOM_JOIN_URL = "https://us02web.zoom.us/j/88563676021";

// חמישי 20.8, 21:00 שעון ישראל (18:00 UTC) + 90 דקות = עד סוף הוובינר
const CUTOFF = new Date("2026-08-20T19:30:00Z");

/**
 * מזהה את הנכנס בדוח המשתתפים של זום.
 *
 * במחזור הקודם 3 מתוך 8 המשתתפים הופיעו בדוח בשם ברירת המחדל של המכשיר
 * ("Samsung SM-S948B"), ורק לאחד מתוך 15 רשומות הכניסה היה מייל — כי זום
 * מוסר מייל רק על מי שמחובר עם חשבון. התוצאה: אי אפשר היה לדעת מי מהנרשמים
 * בפועל הגיע.
 *
 * uname/email בכתובת ההצטרפות ממלאים את הפרטים מראש, כך שהדוח מחזיר שם ומייל
 * אמיתיים. נבחר על פני registration של זום, שהיה מכריח כל נרשם למלא טופס שני
 * אחרי שכבר נרשם באתר.
 */
function buildJoinUrl(name: string | null, email: string | null): string {
  const params = new URLSearchParams();
  if (name) params.set("uname", name);
  if (email) params.set("email", email);
  const qs = params.toString();
  return qs ? `${ZOOM_JOIN_URL}?${qs}` : ZOOM_JOIN_URL;
}

export async function GET(req: NextRequest) {
  const now = new Date();
  if (now > CUTOFF) {
    return NextResponse.redirect("https://www.al-automat.co.il/webinar-missed");
  }

  // u/e מגיעים מהלינק האישי שבמייל האישור. מי שנכנס בלי them — נכנס כרגיל.
  const name = req.nextUrl.searchParams.get("u");
  const email = req.nextUrl.searchParams.get("e");
  return NextResponse.redirect(buildJoinUrl(name, email));
}
