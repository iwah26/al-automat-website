import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

function looksLikeStatusReply(payload: unknown): boolean {
  return JSON.stringify(payload).includes("status@broadcast");
}

/**
 * Debug-only shape: structural fields, never message text/images/captions —
 * used to figure out how a status reply/reaction actually looks in a Green
 * API webhook, without storing the private content of unrelated 1:1 chats.
 */
function debugShape(payload: any) {
  const isGroup = typeof payload?.senderData?.chatId === "string" && payload.senderData.chatId.endsWith("@g.us");
  if (isGroup) return null; // group traffic is never a status reply — skip entirely

  const messageData = payload?.messageData ?? {};
  return {
    typeWebhook: payload?.typeWebhook ?? null,
    chatId: payload?.senderData?.chatId ?? null,
    typeMessage: messageData?.typeMessage ?? null,
    hasQuotedMessage: Boolean(messageData?.quotedMessage),
    quotedParticipant: messageData?.quotedMessage?.participant ?? null,
    quotedStanzaId: messageData?.quotedMessage?.stanzaId ?? null,
  };
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.GREEN_API_WEBHOOK_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  if (looksLikeStatusReply(payload)) {
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

  // Temporary: log a content-free structural shape for non-group 1:1 events
  // so we can identify what a real status reply looks like, without storing
  // private message text/images. Remove once the real shape is known.
  const shape = debugShape(payload);
  if (shape) {
    try {
      await getRabanimSupabase().from("rabanim_status_webhook_events").insert({
        type_webhook: shape.typeWebhook,
        sender: shape.chatId,
        payload: shape,
        matched_status_reply: false,
      });
    } catch (err) {
      console.error("status-webhook: failed to log debug shape", err);
    }
  }

  return NextResponse.json({ ok: true });
}
