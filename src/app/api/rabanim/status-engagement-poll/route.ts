import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp } from "@/lib/greenApi";

const OWN_PARTICIPANT = "972526266419@c.us";
const STATUS_REPLY_TYPES = new Set(["reactionMessage", "textMessage", "extendedTextMessage"]);
const REG_LINK = "https://www.al-automat.co.il/api/webinar/join";

// One-off: Isaac wants this only active for the 24h after posting a status
// on 2026-07-19 09:53 UTC (to invite reactors to the 21.7 webinar), not for
// every status he posts going forward. Hard expiry so it self-disarms even
// if nobody remembers to `gh workflow disable` it.
const EXPIRES_AT = new Date("2026-07-20T09:53:49Z");

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

  if (Date.now() > EXPIRES_AT.getTime()) {
    return NextResponse.json({ skipped: "expired", expiresAt: EXPIRES_AT.toISOString() });
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
  const supabase = getRabanimSupabase();

  const { data: tracked } = await supabase.from("rabanim_tracked_statuses").select("id_message");
  const trackedIds = new Set((tracked ?? []).map((t) => t.id_message));

  // Only auto-reply to reactions/replies on statuses Isaac explicitly opted
  // in (via rabanim_tracked_statuses) — not every status he ever posts.
  // Exception: when the allowlist is empty, fall back to matching any status
  // engagement. Needed because a status posted while the Green API instance
  // was disconnected never gets an id via getOutgoingStatuses, so it can't
  // be added to the allowlist at all — this is safe only because Isaac
  // confirmed no other status is live right now (2026-07-12).
  const engagements = entries.filter(
    (entry) =>
      isStatusEngagement(entry) &&
      (trackedIds.size === 0 || trackedIds.has(entry.quotedMessage?.stanzaId))
  );

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
        `היי! 👋
שמתי לב שהגבת לסטטוס שלי 😊

ביום שלישי הקרוב (21.7) בשעה 21:00 אני מעביר וובינר פתוח וחינמי על AI ואוטומציה — הסבר פרקטי, לא תיאוריה.

קישור להצטרפות:
${REG_LINK}

מוזמן/ת! נשמח לראותך 🙌`
      );
      await supabase.from("rabanim_status_engagements").update({ link_sent: true }).eq("id_message", entry.idMessage);
      sent++;
    } catch (err) {
      console.error("status-engagement-poll: send failed", err);
    }
  }

  return NextResponse.json({ scanned: entries.length, matched: engagements.length, sent, skipped });
}
