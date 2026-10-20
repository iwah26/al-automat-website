import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { createPaymentForm, groupPayCode, type PaymentMethod } from "@/lib/morning";

// תשלום קבוצתי: משלם אחד (עסק) על כמה לומדים. כל לומד נרשם למחזור ד׳ כשורה נפרדת,
// וכולם מקושרים בקוד הזמנה משותף (referral_code = grp-<orderId>).
const UNIT_PRICE = 800;
// בקבלה: שורה אחת בלבד עם הסכום הכולל (בקשת יצחק 20.10)
const PRODUCT = "שיעור מקוואות";

interface Learner { firstName: string; lastName: string; phone: string; email: string }

export async function POST(req: NextRequest) {
  try {
    const { k, businessName, taxId, contactName, email, phone, learners, paymentMethod } = await req.json();
    if (k !== groupPayCode()) return NextResponse.json({ error: "invalid link" }, { status: 401 });
    const list: Learner[] = (Array.isArray(learners) ? learners : []).filter(
      (l: Learner) => l?.firstName?.trim() && l?.lastName?.trim()
    );
    if (!businessName?.trim() || !email?.trim() || !phone?.trim() || list.length === 0 || list.length > 10) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const orderId = randomUUID();
    const code = `grp-${orderId}`;
    const payer = `${businessName.trim()}${taxId ? ` (ח.פ ${String(taxId).trim()})` : ""} · ${contactName || ""} ${phone}`.trim();
    const { error } = await getRabanimSupabase().from("rabanim_registrations").insert(
      list.map((l) => ({
        first_name: l.firstName.trim(),
        last_name: l.lastName.trim(),
        phone: String(l.phone || phone).trim(),
        email: String(l.email || email).trim(),
        role: "group",
        community_name: payer,
        referral_code: code,
        cohort: "round4",
      }))
    );
    if (error) {
      console.error("group-checkout: insert failed", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const method: PaymentMethod = paymentMethod === "bit" || paymentMethod === "credit2" ? paymentMethod : "credit";
    const url = await createPaymentForm({
      registrationId: orderId,
      name: businessName.trim(),
      email: email.trim(),
      phone: String(phone).replace(/^\+?972/, "0"),
      clientTaxId: taxId ? String(taxId).trim() : undefined,
      amount: UNIT_PRICE * list.length,
      quantity: 1,
      unitPrice: UNIT_PRICE * list.length,
      description: PRODUCT,
      method,
      origin: req.nextUrl.origin,
      failurePath: `/pay/group?k=${k}`,
      successPath: () => "/pay/group/thanks",
      notifyPath: "/api/rabanim/group-notify",
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("group-checkout", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
