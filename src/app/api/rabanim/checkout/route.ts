import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { createOrder } from "@/lib/paypal";
import { getPriceILS } from "@/lib/rabanimPricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, role, communityName, location, referralCode, cohort } = body;

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
    const { approveUrl } = await createOrder({
      registrationId: registration.id,
      firstName,
      lastName,
      email,
      returnUrl: `${origin}/api/rabanim/paypal-return`,
      cancelUrl: `${origin}${cohort === "round2" ? "/sednah-rabanim-round2/form" : "/sednah-rabanim/form"}`,
      priceILS: getPriceILS(cohort || "round1"),
    });

    return NextResponse.json({ url: approveUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
