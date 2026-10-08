import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { finalizeRegistrationPayment } from "@/lib/finalizeRegistrationPayment";
import { verifyRegistrationSignature } from "@/lib/morning";

// מורנינג קורא לכתובת הזו אחרי תשלום מוצלח בטופס שנוצר ב-createPaymentForm.
// הזיהוי לפי rid+sig שאנחנו בנינו — לא לפי תוכן הבקשה, שאין לנו דרך לאמת.
async function handle(req: NextRequest) {
  const rid = req.nextUrl.searchParams.get("rid") ?? "";
  const sig = req.nextUrl.searchParams.get("sig") ?? "";
  if (!rid || !sig || !verifyRegistrationSignature(rid, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const raw = await req.text().catch(() => "");
  console.log("morning-notify: rid", rid, "payload", raw.slice(0, 2000));

  const supabase = getRabanimSupabase();
  const { data: registration, error } = await supabase
    .from("rabanim_registrations")
    .select("*")
    .eq("id", rid)
    .maybeSingle();

  if (error || !registration) {
    console.error("morning-notify: registration not found", rid, error);
    return NextResponse.json({ ok: true });
  }
  // מורנינג עלול לקרוא יותר מפעם אחת — לא שולחים אישור/סיסמה פעמיים
  if (registration.payment_status === "paid") {
    return NextResponse.json({ ok: true, already: true });
  }

  await finalizeRegistrationPayment(registration);
  return NextResponse.json({ ok: true });
}

export const POST = handle;
export const GET = handle;
