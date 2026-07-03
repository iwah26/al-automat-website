import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp } from "@/lib/greenApi";

const PAYPAL_VERIFY_URL = "https://ipnpb.paypal.com/cgi-bin/webscr";

function generateCoursePassword(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function verifyWithPaypal(rawBody: string): Promise<boolean> {
  const res = await fetch(PAYPAL_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `cmd=_notify-validate&${rawBody}`,
  });
  const text = await res.text();
  return text === "VERIFIED";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = await verifyWithPaypal(rawBody);
  if (!isValid) {
    console.error("PayPal IPN: signature verification failed");
    return NextResponse.json({ error: "invalid IPN" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const paymentStatus = params.get("payment_status");
  const payerEmail = params.get("payer_email");

  if (paymentStatus !== "Completed" || !payerEmail) {
    return NextResponse.json({ ok: true }); // ignore non-completed / non-payment IPNs
  }

  const supabase = getRabanimSupabase();
  const { data: registration, error: fetchError } = await supabase
    .from("rabanim_registrations")
    .select("*")
    .eq("email", payerEmail)
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !registration) {
    console.error("PayPal IPN: no matching pending registration for", payerEmail, fetchError);
    return NextResponse.json({ ok: true }); // ack anyway — nothing more we can do
  }

  await supabase
    .from("rabanim_registrations")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", registration.id);

  const password = generateCoursePassword();
  await supabase.from("rabanim_course_access").insert({
    registration_id: registration.id,
    password,
  });

  const message = `שלום כבוד הרב ${registration.first_name} ${registration.last_name} 🙏

ההרשמה שלך לסדנת *"קלוד קוד לרבנים"* התקבלה בהצלחה!

📅 שני מפגשים: 12.7 (כ״ז תמוז) + 19.7 (ה׳ אב)
🕕 18:00–21:00 שעון ישראל
🔗 לינק זום (לשני המפגשים):
https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1

✅ גישה להקלטות: https://www.al-automat.co.il/course
🔑 סיסמת הכניסה שלך: ${password}
(הסיסמה אישית — עד 2 מכשירים)

לפני המפגש הראשון נשלח לך רשימת הכנה קצרה.
שאלות? תכתוב כאן.

נתראה בזום!`;

  try {
    await sendWhatsApp(registration.phone, message);
  } catch (err) {
    console.error("PayPal IPN: WhatsApp send failed", err);
  }

  return NextResponse.json({ ok: true });
}
