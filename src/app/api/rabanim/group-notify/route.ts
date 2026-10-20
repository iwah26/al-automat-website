import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { finalizeRegistrationPayment } from "@/lib/finalizeRegistrationPayment";
import { verifyRegistrationSignature } from "@/lib/morning";
import { sendWhatsApp } from "@/lib/greenApi";

// מורנינג קורא לכאן אחרי תשלום קבוצתי. rid = מזהה ההזמנה; כל הלומדים מסומנים grp-<rid>.
async function handle(req: NextRequest) {
  const rid = req.nextUrl.searchParams.get("rid") ?? "";
  const sig = req.nextUrl.searchParams.get("sig") ?? "";
  if (!rid || !sig || !verifyRegistrationSignature(rid, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  const raw = await req.text().catch(() => "");
  console.log("group-notify: order", rid, "payload", raw.slice(0, 2000));

  const { data: learners, error } = await getRabanimSupabase()
    .from("rabanim_registrations")
    .select("*")
    .eq("referral_code", `grp-${rid}`);
  if (error || !learners?.length) {
    console.error("group-notify: order not found", rid, error);
    return NextResponse.json({ ok: true });
  }

  const pending = learners.filter((l) => l.payment_status !== "paid");
  // כל לומד מקבל את האישור הרגיל: זום, סיסמה לאתר ההקלטות, קבוצה, מייל
  for (const l of pending) await finalizeRegistrationPayment(l);

  const ownerPhone = process.env.OWNER_NOTIFY_PHONE;
  if (ownerPhone && pending.length) {
    try {
      await sendWhatsApp(
        ownerPhone,
        `💼 תשלום קבוצתי התקבל — ${learners.length} לומדים\nמשלם: ${learners[0].community_name ?? ""}\n\n` +
          learners.map((l, i) => `${i + 1}. ${l.first_name} ${l.last_name} · ${l.phone} · ${l.email}`).join("\n")
      );
    } catch (err) {
      console.error("group-notify: owner summary failed", err);
    }
  }
  return NextResponse.json({ ok: true, finalized: pending.length });
}

export const POST = handle;
export const GET = handle;
