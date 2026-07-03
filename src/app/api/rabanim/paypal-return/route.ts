import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { captureOrder } from "@/lib/paypal";
import { finalizeRegistrationPayment } from "@/lib/finalizeRegistrationPayment";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("token");
  const origin = req.nextUrl.origin;

  if (!orderId) {
    return NextResponse.redirect(`${origin}/sednah-rabanim`);
  }

  try {
    const { customId, status } = await captureOrder(orderId);
    if (status !== "COMPLETED" || !customId) {
      console.error("PayPal return: capture not completed", orderId, status);
      return NextResponse.redirect(`${origin}/sednah-rabanim`);
    }

    const supabase = getRabanimSupabase();
    const { data: registration, error } = await supabase
      .from("rabanim_registrations")
      .select("*")
      .eq("id", customId)
      .single();

    if (error || !registration) {
      console.error("PayPal return: registration not found", customId, error);
      return NextResponse.redirect(`${origin}/sednah-rabanim`);
    }

    if (registration.payment_status !== "paid") {
      await finalizeRegistrationPayment(registration);
    }

    return NextResponse.redirect(`${origin}/todah`);
  } catch (err) {
    console.error("PayPal return: capture failed", err);
    return NextResponse.redirect(`${origin}/sednah-rabanim`);
  }
}
