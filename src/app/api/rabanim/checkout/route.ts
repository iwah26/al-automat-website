import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { createOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, role, communityName, location } = body;

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
      })
      .select()
      .single();

    if (error || !registration) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const origin = req.nextUrl.origin;
    const { orderId, approveUrl } = await createOrder({
      registrationId: registration.id,
      firstName,
      lastName,
      email,
      returnUrl: `${origin}/api/rabanim/paypal-return`,
      cancelUrl: `${origin}/sednah-rabanim`,
    });

    await supabase
      .from("rabanim_registrations")
      .update({ paypal_order_id: orderId })
      .eq("id", registration.id);

    return NextResponse.json({ url: approveUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
