import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp } from "@/lib/greenApi";

const SESSION_REMINDERS: Record<string, string> = {
  "1": `תזכורת: מחר (12.7, כ״ז תמוז) המפגש הראשון של סדנת *"קלוד קוד לרבנים"*, 18:00–21:00 שעון ישראל.

🔗 https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1

נתראה!`,
  "2": `תזכורת: מחר (19.7, ה׳ אב) המפגש השני והאחרון של סדנת *"קלוד קוד לרבנים"*, 18:00–21:00 שעון ישראל.

🔗 https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1

נתראה!`,
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const session = req.nextUrl.searchParams.get("session");
  const message = session ? SESSION_REMINDERS[session] : undefined;
  if (!message) {
    return NextResponse.json({ error: "unknown session" }, { status: 400 });
  }

  const supabase = getRabanimSupabase();
  const { data: registrations, error } = await supabase
    .from("rabanim_registrations")
    .select("phone")
    .eq("payment_status", "paid");

  if (error) {
    console.error("reminders: supabase error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (registrations ?? []).map((r) => sendWhatsApp(r.phone, message))
  );
  const failures = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent: results.length - failures, failed: failures });
}
