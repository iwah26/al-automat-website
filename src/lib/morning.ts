import { createHmac, timingSafeEqual } from "crypto";

// Morning (חשבונית ירוקה) — טופס תשלום דינמי דרך מסוף הסליקה של מורנינג (Grow/משולם).
// אשראי וביט הם שני דפים נפרדים: group 100 = אשראי, group 120 = ביט (נבדק מול ה-API, 8.10.26).
const API = "https://api.greeninvoice.co.il/api/v1";
const CLEARING_PLUGIN_TYPE = 12200;

// credit2 = אשראי עד 2 תשלומים. דף Grow בוחר תמיד את המקסימום כברירת מחדל ואין שדה API
// שמשנה את זה (נבדק 8.10), לכן הבחירה בין 1 ל-2 נעשית אצלנו בכפתור נפרד.
export type PaymentMethod = "credit" | "credit2" | "bit";
const METHOD_GROUP: Record<PaymentMethod, number> = { credit: 100, credit2: 100, bit: 120 };

async function morningFetch(path: string, init: RequestInit & { token?: string } = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Morning ${path} failed: ${res.status} ${data?.errorCode ?? ""} ${data?.errorMessage ?? ""}`);
  return data;
}

// מורנינג העבירו את קבלת הטוקן ל-OAuth 2.0 (יוני 2026): /account/token הישן מחזיר 404.
// הטוקן מגיע מ-api.morning.co, ושאר הקריאות נשארות ב-api.greeninvoice.co.il (נבדק 20.10.26).
const TOKEN_URL = "https://api.morning.co/idp/v1/oauth/token";

async function getToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.MORNING_API_ID,
      client_secret: process.env.MORNING_API_SECRET,
    }),
  });
  const data = await res.json().catch(() => ({}));
  const token = data.accessToken ?? data.access_token;
  if (!res.ok || !token) throw new Error(`Morning token failed: ${res.status}`);
  return token as string;
}

async function getClearingPluginId(token: string): Promise<string> {
  const plugins: { id: string; type: number }[] = await morningFetch("/plugins", { token });
  const plugin = plugins.find((p) => p.type === CLEARING_PLUGIN_TYPE);
  if (!plugin) throw new Error("Morning: no clearing plugin connected");
  return plugin.id;
}

/** חתימה על מזהה ההרשמה — רק מי שמחזיק את הסוד יכול לבנות notifyUrl תקף */
export function signRegistrationId(registrationId: string): string {
  return createHmac("sha256", process.env.MORNING_API_SECRET ?? "").update(registrationId).digest("hex").slice(0, 32);
}

/** קוד לקישור בדיקה (₪1) — נגזר מהסוד, אז אי אפשר לנחש אותו */
export function priceTestCode(): string {
  return createHmac("sha256", process.env.MORNING_API_SECRET ?? "").update("price-test").digest("hex").slice(0, 12);
}

/** קוד לקישור התשלום הקבוצתי (כמה לומדים, קבלה על שם עסק).
 *  קבוע ולא נגזר מהמפתח של מורנינג — המפתח ב-Vercel וב-.env.local לא תמיד זהים (20.10.26). */
export function groupPayCode(): string {
  return "82cb5f878790";
}

export function verifyRegistrationSignature(registrationId: string, sig: string): boolean {
  const expected = Buffer.from(signRegistrationId(registrationId));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function createPaymentForm(params: {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  description: string;
  method: PaymentMethod;
  origin: string;
  failurePath: string;
  /** לאן לחזור אחרי תשלום מוצלח. ברירת מחדל: /todah. מקבל rid+sig חתומים */
  successPath?: (rid: string, sig: string) => string;
  /** ברירת מחדל: morning-notify (הרשמה בודדת). group-notify = הזמנה קבוצתית */
  notifyPath?: string;
  /** ח.פ / ע.מ של הלקוח — הקבלה יוצאת על שם העסק שלו */
  clientTaxId?: string;
  /** שורת מוצר: כמות × מחיר ליחידה (ברירת מחדל: 1 × amount) */
  quantity?: number;
  unitPrice?: number;
}): Promise<string> {
  const token = await getToken();
  const pluginId = await getClearingPluginId(token);
  const rid = params.registrationId;
  const notifyUrl = `${params.origin}${params.notifyPath ?? "/api/rabanim/morning-notify"}?rid=${encodeURIComponent(rid)}&sig=${signRegistrationId(rid)}`;

  const data = await morningFetch("/payments/form", {
    method: "POST",
    token,
    body: JSON.stringify({
      description: params.description,
      type: 320,
      date: new Date().toISOString().slice(0, 10),
      lang: "he",
      currency: "ILS",
      vatType: 0,
      amount: params.amount,
      maxPayments: params.method === "credit2" ? 2 : 1,
      pluginId,
      group: METHOD_GROUP[params.method],
      client: {
        name: params.name,
        emails: [params.email],
        phone: params.phone,
        ...(params.clientTaxId ? { taxId: params.clientTaxId } : {}),
        add: true,
      },
      income: [{
        description: params.description,
        quantity: params.quantity ?? 1,
        price: params.unitPrice ?? params.amount,
        currency: "ILS",
        vatType: 1,
      }],
      successUrl: `${params.origin}${params.successPath ? params.successPath(rid, signRegistrationId(rid)) : "/todah"}`,
      failureUrl: `${params.origin}${params.failurePath}`,
      notifyUrl,
      custom: rid,
    }),
  });
  return data.url as string;
}
