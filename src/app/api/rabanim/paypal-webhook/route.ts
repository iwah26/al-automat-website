import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { finalizeRegistrationPayment } from "@/lib/finalizeRegistrationPayment";

const PAYPAL_VERIFY_URL = "https://ipnpb.paypal.com/cgi-bin/webscr";

async function verifyWithPaypal(rawBody: string): Promise<boolean> {
  const res = await fetch(PAYPAL_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `cmd=_notify-validate&${rawBody}`,
  });
  const text = await res.text();
  return text === "VERIFIED";
}

/**
 * Safety net only. The primary path is /api/rabanim/paypal-return, which
 * captures the order server-side right after the buyer approves and matches
 * by PayPal order custom_id (not email). This IPN listener still exists in
 * case a buyer's browser never makes it back to our return_url.
 */
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
    return NextResponse.json({ ok: true });
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
    // Expected in the common case — /paypal-return already marked it paid.
    return NextResponse.json({ ok: true });
  }

  await finalizeRegistrationPayment(registration);

  return NextResponse.json({ ok: true });
}
