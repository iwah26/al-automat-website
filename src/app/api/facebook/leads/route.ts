import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendMail } from "@/lib/mailer";
import { sendWhatsAppToChatId } from "@/lib/greenApi";

const ZOOM_JOIN_URL =
  "https://us02web.zoom.us/j/86183821803?pwd=WxGDuKyu2aXIyDw42RRrxlKC5X5AnU.1";
const ZOOM_MEETING_ID = "861 8382 1803";
const ZOOM_PASSCODE = "314248";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.FB_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

async function fetchLeadDetails(leadgenId: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`
  );
  if (!res.ok) {
    throw new Error(`Graph API lead fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function extractField(fieldData: { name: string; values: string[] }[], names: string[]) {
  for (const name of names) {
    const field = fieldData.find((f) => f.name.toLowerCase() === name);
    if (field?.values?.[0]) return field.values[0];
  }
  return null;
}

function buildConfirmationEmail(fullName: string | null) {
  const greeting = fullName ? `שלום ${fullName} 🙏` : "שלום 🙏";
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>${greeting}</p>
      <p>תודה שנרשמת לוובינר הפתוח <strong>"קלוד קוד לרבנים"</strong>!</p>
      <p><strong>יום שלישי, 21.7</strong></p>
      <ul>
        <li>🇮🇱 ישראל — 21:00</li>
        <li>🇬🇧 אנגליה — 19:00</li>
        <li>🇪🇸🇫🇷 ספרד/צרפת — 20:00</li>
        <li>🇦🇷 ארגנטינה — 15:00</li>
        <li>🇺🇸🇻🇪 ארה"ב (מזרח)/ונצואלה — 14:00</li>
        <li>🇲🇽 מקסיקו — 12:00</li>
      </ul>
      <p><strong>פרטי הזום:</strong></p>
      <p>
        קישור: <a href="${ZOOM_JOIN_URL}">${ZOOM_JOIN_URL}</a><br />
        Meeting ID: ${ZOOM_MEETING_ID}<br />
        Passcode: ${ZOOM_PASSCODE}
      </p>
      <p>נתראה!</p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const supabase = getRabanimSupabase();

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const { leadgen_id, form_id, ad_id, campaign_id } = change.value ?? {};
      if (!leadgen_id) continue;

      const { data: existing } = await supabase
        .from("webinar_leads")
        .select("id")
        .eq("fb_lead_id", leadgen_id)
        .maybeSingle();
      if (existing) continue;

      let leadData;
      try {
        leadData = await fetchLeadDetails(leadgen_id);
      } catch (err) {
        console.error("facebook/leads: failed to fetch lead details", err);
        continue;
      }

      const fieldData = leadData.field_data ?? [];
      const email = extractField(fieldData, ["email"]);
      const fullName = extractField(fieldData, ["full_name", "name"]);
      const phone = extractField(fieldData, ["phone_number", "phone"]);

      await supabase.from("webinar_leads").insert({
        fb_lead_id: leadgen_id,
        full_name: fullName,
        email,
        phone,
        ad_id,
        campaign_id,
        form_id,
        raw_payload: leadData,
      });

      if (email) {
        try {
          await sendMail(
            email,
            "פרטי הזום לוובינר \"קלוד קוד לרבנים\" — 21.7",
            buildConfirmationEmail(fullName)
          );
          await supabase
            .from("webinar_leads")
            .update({ email_sent: true })
            .eq("fb_lead_id", leadgen_id);
        } catch (err) {
          console.error("facebook/leads: failed to send confirmation email", err);
        }
      }

      const ownerPhone = process.env.OWNER_NOTIFY_PHONE;
      if (ownerPhone) {
        try {
          await sendWhatsAppToChatId(
            `${ownerPhone.replace(/\D/g, "")}@c.us`,
            `🔔 נרשם חדש לוובינר "קלוד קוד לרבנים":\n${fullName ?? "ללא שם"}\n${email ?? "ללא מייל"}\n${phone ?? ""}`
          );
        } catch (err) {
          console.error("facebook/leads: owner notify failed", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
