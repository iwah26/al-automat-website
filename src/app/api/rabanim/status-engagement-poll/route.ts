import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp } from "@/lib/greenApi";

const OWN_PARTICIPANT = "972526266419@c.us";
const STATUS_REPLY_TYPES = new Set(["reactionMessage", "textMessage", "extendedTextMessage"]);
const REG_LINK = "https://www.al-automat.co.il/sednah-rabanim?c=status-engagement";

/**
 * Green API never fires a webhook for WhatsApp Status replies/reactions —
 * confirmed empirically (2026-07-09). The only place they show up is the
 * polling endpoint getIncomingStatuses, mixed in with all other incoming
 * traffic. A status reply/reaction has quotedMessage.participant equal to
 * Isaac's own number with an empty quotedMessage.typeMessage — that shape
 * is unique to status interactions (a reply to a regular message always
 * carries a real typeMessage on the quote).
 */
function isStatusEngagement(entry: any): boolean {
  if (!STATUS_REPLY_TYPES.has(entry?.typeMessage)) return false;
  const quoted = entry?.quotedMessage;
  return quoted?.participant === OWN_PARTICIPANT && quoted?.typeMessage === "";
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const minutes = Number(req.nextUrl.searchParams.get("minutes") ?? "15");

  const url = process.env.GREEN_API_URL;
  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;
  const res = await fetch(`${url}/waInstance${instance}/getIncomingStatuses/${token}?minutes=${minutes}`);
  if (!res.ok) {
    return NextResponse.json({ error: "getIncomingStatuses failed" }, { status: 502 });
  }
  const entries: any[] = await res.json();
  const engagements = entries.filter(isStatusEngagement);

  const supabase = getRabanimSupabase();
  let sent = 0;
  let skipped = 0;

  for (const entry of engagements) {
    const phone = String(entry.senderId ?? entry.chatId ?? "").replace(/\D/g, "");
    if (!phone) continue;

    const { error: insertError } = await supabase
      .from("rabanim_status_engagements")
      .insert({ id_message: entry.idMessage, phone, message_type: entry.typeMessage });

    if (insertError) {
      skipped++; // already processed in a previous run (unique constraint on id_message)
      continue;
    }

    try {
      await sendWhatsApp(
        phone,
        `תודה שהגבת לסטטוס 🙏 הנה קישור לסדנה שדיברתי עליה:\n${REG_LINK}`
      );
      await supabase.from("rabanim_status_engagements").update({ link_sent: true }).eq("id_message", entry.idMessage);
      sent++;
    } catch (err) {
      console.error("status-engagement-poll: send failed", err);
    }
  }

  return NextResponse.json({ scanned: entries.length, matched: engagements.length, sent, skipped });
}
