import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

const PAYMENT_URL = "https://mrng.to/XRkRG6PGRI";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, role, communityName, location } = body;

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getRabanimSupabase();
    const { error } = await supabase.from("rabanim_registrations").insert({
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      role,
      community_name: communityName,
      location,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Payment happens on a static PayPal link (no per-registrant reference).
    // Confirmation is matched back to this registration by email via the
    // PayPal IPN webhook — see /api/rabanim/paypal-webhook.
    return NextResponse.json({ url: PAYMENT_URL });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
