import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendMail } from "@/lib/mailer";
import { sendWhatsAppToChatId } from "@/lib/greenApi";

const ZOOM_JOIN_URL =
  "https://us02web.zoom.us/j/86183821803?pwd=WxGDuKyu2aXIyDw42RRrxlKC5X5AnU.1";
const ZOOM_MEETING_ID = "861 8382 1803";
const ZOOM_PASSCODE = "314248";

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

async function fetchLeadForms(pageId: string, pageToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v25.0/${pageId}/leadgen_forms?access_token=${pageToken}`
  );
  if (!res.ok) throw new Error(`leadgen_forms fetch failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.data ?? []) as { id: string; name: string }[];
}

async function fetchLeadsForForm(formId: string, pageToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v25.0/${formId}/leads?access_token=${pageToken}&limit=100`
  );
  if (!res.ok) throw new Error(`leads fetch failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.data ?? []) as { id: string; field_data: { name: string; values: string[] }[] }[];
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !pageToken) {
    return NextResponse.json({ error: "FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN missing" }, { status: 500 });
  }

  const supabase = getRabanimSupabase();
  let processed = 0;

  const forms = await fetchLeadForms(pageId, pageToken);

  for (const form of forms) {
    const leads = await fetchLeadsForForm(form.id, pageToken);

    for (const lead of leads) {
      const { data: existing } = await supabase
        .from("webinar_leads")
        .select("id")
        .eq("fb_lead_id", lead.id)
        .maybeSingle();
      if (existing) continue;

      const fieldData = lead.field_data ?? [];
      const email = extractField(fieldData, ["email"]);
      const fullName = extractField(fieldData, ["full_name", "name"]);
      const phone = extractField(fieldData, ["phone_number", "phone"]);

      await supabase.from("webinar_leads").insert({
        fb_lead_id: lead.id,
        full_name: fullName,
        email,
        phone,
        form_id: form.id,
        raw_payload: lead,
      });

      if (email) {
        try {
          await sendMail(
            email,
            'פרטי הזום לוובינר "קלוד קוד לרבנים" — 21.7',
            buildConfirmationEmail(fullName)
          );
          await supabase.from("webinar_leads").update({ email_sent: true }).eq("fb_lead_id", lead.id);
        } catch (err) {
          console.error("poll-leads: failed to send confirmation email", err);
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
          console.error("poll-leads: owner notify failed", err);
        }
      }

      processed++;
    }
  }

  return NextResponse.json({ processed });
}
