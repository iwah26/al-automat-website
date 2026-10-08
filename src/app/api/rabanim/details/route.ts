import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { verifyRegistrationSignature } from "@/lib/morning";

// השלמת פרטים אחרי תשלום (מחזור ד׳) — מעדכן רק תפקיד / מקום עבודה / מיקום
export async function POST(req: NextRequest) {
  const { rid, sig, role, communityName, location } = await req.json();
  if (!rid || !sig || !verifyRegistrationSignature(rid, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  const { error } = await getRabanimSupabase()
    .from("rabanim_registrations")
    .update({ role: role || null, community_name: communityName || null, location: location || null })
    .eq("id", rid);
  if (error) {
    console.error("rabanim/details: update failed", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
