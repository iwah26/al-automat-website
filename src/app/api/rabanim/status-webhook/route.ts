import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

/**
 * Phase 1: log every Green API webhook event to Supabase so we can see a real
 * payload for a status reply/reaction before writing the matching logic.
 * Nothing gets auto-sent yet — see rabanim_status_webhook_events.matched_status_reply.
 */
function looksLikeStatusReply(payload: unknown): boolean {
  return JSON.stringify(payload).includes("status@broadcast");
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.GREEN_API_WEBHOOK_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  // Green API fires this webhook for every incoming message across all of
  // Isaac's WhatsApp chats/groups, not just status replies — only persist
  // events that look status-related, to avoid logging unrelated private
  // conversations into this table.
  if (!looksLikeStatusReply(payload)) {
    return NextResponse.json({ ok: true });
  }

  try {
    await getRabanimSupabase().from("rabanim_status_webhook_events").insert({
      type_webhook: payload?.typeWebhook ?? null,
      sender: payload?.senderData?.sender ?? payload?.senderData?.chatId ?? null,
      payload,
      matched_status_reply: true,
    });
  } catch (err) {
    console.error("status-webhook: failed to log event", err);
  }

  return NextResponse.json({ ok: true });
}
