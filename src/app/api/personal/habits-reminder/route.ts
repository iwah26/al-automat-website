import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/greenApi";

// One-off reminder: Isaac asked (22.7.26) to be nudged in a week about the new
// "Atomic Habits" project (projects/אימון-אישי/ATOMIC-HABITS.md) so it doesn't
// get left aside. Fires only on the target date, self-disarms after — safe to
// leave the GitHub Actions cron enabled indefinitely.
const TARGET_DATE = "2026-07-29";

const MESSAGE =
  "🔔 תזכורת: פרויקט ההרגלים האטומיים (Atomic Habits)\n\n" +
  "עבר שבוע — זמן טוב לבדוק: כמה מהספר שמעת, ואילו תובנות לרשום?\n" +
  "קובץ המסגרת: ATOMIC-HABITS.md, תובנות: .private/atomic-habits-insights.md (בתיקיית אימון-אישי).\n\n" +
  "כשתהיה מוכן, בוא נבנה יחד את דשבורד ההרגלים.";

function isTargetDayInIsrael(): boolean {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
  return today === TARGET_DATE;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isTargetDayInIsrael()) {
    return NextResponse.json({ skipped: "not target date", targetDate: TARGET_DATE });
  }

  const phone = process.env.OWNER_NOTIFY_PHONE;
  if (!phone) {
    return NextResponse.json({ error: "OWNER_NOTIFY_PHONE missing" }, { status: 500 });
  }

  await sendWhatsApp(phone, MESSAGE);
  return NextResponse.json({ ok: true });
}
