import { createHmac, timingSafeEqual } from "node:crypto";

// קישורי הרשמה למי ששילם בהעברה בנקאית: קוד שובר + מספר מקומות, חתומים.
// הסוד קבוע בקוד (ולא ב-env) כי ה-CLI של Vercel לא מחובר — ה-repo פרטי. (20.10.26)
const SECRET = "c5fb46d676f8243573b82b9244018e91";

export function signVoucher(voucher: string, seats: number): string {
  return createHmac("sha256", SECRET).update(`${voucher}:${seats}`).digest("hex").slice(0, 20);
}

export function verifyVoucher(voucher: string, seats: number, sig: string): boolean {
  if (!voucher || !Number.isInteger(seats) || seats < 1 || seats > 10 || !sig) return false;
  const a = Buffer.from(signVoucher(voucher, seats));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** חתימה לקישור השאלון (/sadna/details) שאפשר לייצר גם מקומית — נוסף לחתימה של מורנינג */
export function signDetails(rid: string): string {
  return createHmac("sha256", SECRET).update(`details:${rid}`).digest("hex").slice(0, 24);
}

export function verifyDetails(rid: string, sig: string): boolean {
  if (!rid || !sig) return false;
  const a = Buffer.from(signDetails(rid));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
