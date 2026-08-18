import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendMail } from "@/lib/mailer";
import { sendWhatsAppToChatId, YO_ANI_GROUP_ID } from "@/lib/greenApi";
import { buildWebinarConfirmationEmail } from "@/lib/webinarEmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fullName, email, phone, referralCode } = body;

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = getRabanimSupabase();

  const { error } = await supabase.from("webinar_leads").insert({
    full_name: fullName || null,
    email,
    phone: phone || null,
    source: "direct",
    referral_code: referralCode || null,
  });

  if (error) {
    console.error("webinar/register: insert failed", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  try {
    await sendMail(
      email,
      'פרטי הזום לוובינר "אל תישאר מאחור" — 20.8',
      buildWebinarConfirmationEmail(fullName || null, email)
    );
  } catch (err) {
    console.error("webinar/register: failed to send confirmation email", err);
  }

  try {
    await sendWhatsAppToChatId(
      YO_ANI_GROUP_ID,
      `🔔 נרשם חדש לוובינר (קישור ישיר, קוד: ${referralCode || "ללא"}):\n${fullName || "ללא שם"}\n${email}\n${phone || ""}`
    );
  } catch (err) {
    console.error("webinar/register: owner notify failed", err);
  }

  return NextResponse.json({ ok: true });
}
