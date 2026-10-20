import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { finalizeRegistrationPayment } from "@/lib/finalizeRegistrationPayment";
import { verifyVoucher } from "@/lib/manualVoucher";
import { sendWhatsApp } from "@/lib/greenApi";

// הרשמה בלי סליקה (שולם בהעברה). כל לומד → round4, מסומן כשילם, ומקבל את האישור הרגיל.
export async function POST(req: NextRequest) {
  const { v, n, s, payerName, learners } = await req.json();
  const seats = Number(n);
  if (!verifyVoucher(String(v || ""), seats, String(s || ""))) {
    return NextResponse.json({ error: "הקישור לא תקין" }, { status: 401 });
  }
  const list = (Array.isArray(learners) ? learners : []).filter(
    (l: { firstName?: string; lastName?: string; phone?: string; email?: string }) =>
      l?.firstName?.trim() && l?.lastName?.trim() && l?.phone?.trim() && l?.email?.trim()
  );
  const code = `manual-${v}`;
  const supabase = getRabanimSupabase();
  const { count } = await supabase
    .from("rabanim_registrations")
    .select("id", { count: "exact", head: true })
    .eq("referral_code", code);
  const left = seats - (count ?? 0);
  if (left <= 0) return NextResponse.json({ error: "כל המקומות בקישור הזה כבר נוצלו" }, { status: 409 });
  if (!list.length || list.length > left) {
    return NextResponse.json({ error: `אפשר לרשום עד ${left} לומדים בקישור הזה` }, { status: 400 });
  }

  const { data: rows, error } = await supabase
    .from("rabanim_registrations")
    .insert(
      list.map((l: { firstName: string; lastName: string; phone: string; email: string }) => ({
        first_name: l.firstName.trim(),
        last_name: l.lastName.trim(),
        phone: l.phone.trim(),
        email: l.email.trim(),
        role: "bank-transfer",
        community_name: payerName ? `שולם בהעברה ע"י ${String(payerName).trim()}` : "שולם בהעברה",
        referral_code: code,
        cohort: "round4",
      }))
    )
    .select();
  if (error || !rows) {
    console.error("manual-register: insert failed", error);
    return NextResponse.json({ error: "שגיאה בשמירה, נסה שוב" }, { status: 500 });
  }
  for (const r of rows) await finalizeRegistrationPayment(r);

  const owner = process.env.OWNER_NOTIFY_PHONE;
  if (owner) {
    try {
      await sendWhatsApp(owner, `🏦 הרשמה אחרי העברה בנקאית${payerName ? ` (${payerName})` : ""} — ${rows.length} לומדים:\n` +
        rows.map((r, i) => `${i + 1}. ${r.first_name} ${r.last_name} · ${r.phone} · ${r.email}`).join("\n"));
    } catch (err) {
      console.error("manual-register: owner notify failed", err);
    }
  }
  return NextResponse.json({ ok: true, registered: rows.length });
}
