import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsAppToChatId, YO_ANI_GROUP_ID } from "@/lib/greenApi";

const FIELDS = [
  "full_name",
  "phone",
  "email",
  "city",
  "business_name",
  "business_field",
  "years_active",
  "website",
  "q_strengths",
  "q_contribution",
  "q_gaps",
  "q_needs",
  "q_notes",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const row: Record<string, string> = {};
    for (const f of FIELDS) {
      const v = body[f];
      if (typeof v === "string" && v.trim()) row[f] = v.trim();
    }

    if (!row.full_name || !row.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getRabanimSupabase();
    const { error } = await supabase.from("networking_applications").insert([row]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    try {
      await sendWhatsAppToChatId(
        YO_ANI_GROUP_ID,
        `בקשה חדשה לקבוצת הנטוורקינג 🤝\n${row.full_name}${
          row.business_name ? ` — ${row.business_name}` : ""
        }${row.business_field ? ` (${row.business_field})` : ""}\n${row.phone}`
      );
    } catch (notifyErr) {
      console.error("WhatsApp notify failed:", notifyErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
