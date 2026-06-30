import { NextRequest, NextResponse } from "next/server";

const GI_API = "https://api.greeninvoice.co.il/api/v1";
const PLUGIN_ID = "0ad1d480-e293-4f9c-a658-164505eda558";

async function getToken(): Promise<string> {
  const res = await fetch(`${GI_API}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: process.env.GREEN_INVOICE_API_KEY,
      secret: process.env.GREEN_INVOICE_API_SECRET,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`token failed: ${JSON.stringify(data)}`);
  return data.token;
}

async function createClient(
  token: string,
  name: string,
  email: string,
  phone: string
): Promise<string> {
  const res = await fetch(`${GI_API}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, emails: [email], phone }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`client failed: ${JSON.stringify(data)}`);
  return data.id;
}

async function createPaymentLink(
  token: string,
  clientId: string
): Promise<string> {
  const res = await fetch(`${GI_API}/payments/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      price: 950,
      currency: "ILS",
      description: "סדנת Claude Code לרבנים",
      documentType: 320,
      clientId,
      customRedirectUrl: "https://www.al-automat.co.il/todah",
      plugins: [{ id: PLUGIN_ID, type: 12010, maxPayments: 1, group: 110 }],
    }),
  });
  const data = await res.json();
  const url = data.shortUrl ?? data.url;
  if (!url) throw new Error(`payment link failed: ${JSON.stringify(data)}`);
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone } = await req.json();
    const name = `${firstName} ${lastName}`.trim();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const token = await getToken();
    const clientId = await createClient(token, name, email, phone);
    const paymentUrl = await createPaymentLink(token, clientId);

    return NextResponse.json({ url: paymentUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
