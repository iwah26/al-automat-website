import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { verifyRegistrationSignature } from "@/lib/morning";
import { verifyDetails } from "@/lib/manualVoucher";
import { put } from "@vercel/blob";

// השלמת פרטים אחרי תשלום (מחזור ד׳) — מעדכן רק תפקיד / מקום עבודה / מיקום
export async function POST(req: NextRequest) {
  const { rid, sig, role, communityName, location, answers } = await req.json();
  if (!rid || !sig || !(verifyRegistrationSignature(rid, sig) || verifyDetails(rid, sig))) {
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
  // כל תשובות השאלון — קובץ לכל משתתף ב-Vercel Blob (לקריאה: scripts/sadna-answers.mjs)
  try {
    await put(`registration-answers/${rid}.json`, JSON.stringify({ rid, role, communityName, location, answers, at: new Date().toISOString() }), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch (err) {
    console.error("rabanim/details: answers blob failed", err);
  }
  return NextResponse.json({ ok: true });
}
