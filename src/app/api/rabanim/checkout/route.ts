import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { createOrder } from "@/lib/paypal";
import { getPriceILS, COHORT_FORM_PATH } from "@/lib/rabanimPricing";
import { createPaymentForm, type PaymentMethod } from "@/lib/morning";

// מחזורים שמשלמים דרך מורנינג (אשראי/ביט) במקום PayPal
const MORNING_COHORTS = new Set(["round4"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, role, communityName, location, referralCode, cohort, paymentMethod } = body;

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getRabanimSupabase();
    const { data: registration, error } = await supabase
      .from("rabanim_registrations")
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        role,
        community_name: communityName,
        location,
        referral_code: referralCode || null,
        cohort: cohort || "round1",
      })
      .select()
      .single();

    if (error || !registration) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const origin = req.nextUrl.origin;

    if (MORNING_COHORTS.has(cohort)) {
      const method: PaymentMethod = paymentMethod === "bit" ? "bit" : "credit";
      // ביט שולח SMS למספר הזה — פורמט מקומי 05X
      const localPhone = String(phone).replace(/^\+?972/, "0");
      const url = await createPaymentForm({
        registrationId: registration.id,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: localPhone,
        amount: getPriceILS(cohort),
        description: "סדנת Claude Code לחרדים — 9.10 + 16.10",
        method,
        origin,
        failurePath: COHORT_FORM_PATH[cohort] ?? COHORT_FORM_PATH.round1,
      });
      return NextResponse.json({ url });
    }

    const { approveUrl } = await createOrder({
      registrationId: registration.id,
      firstName,
      lastName,
      email,
      returnUrl: `${origin}/api/rabanim/paypal-return`,
      cancelUrl: `${origin}${COHORT_FORM_PATH[cohort] ?? COHORT_FORM_PATH.round1}`,
      priceILS: getPriceILS(cohort || "round1"),
    });

    return NextResponse.json({ url: approveUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
