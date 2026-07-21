const API_BASE = "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials missing");

  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function createOrder(params: {
  registrationId: string;
  firstName: string;
  lastName: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
  priceILS: number;
}): Promise<{ orderId: string; approveUrl: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: params.registrationId,
          description: `הרשמה לסדנת קלוד קוד לרבנים — ${params.firstName} ${params.lastName}`,
          amount: {
            currency_code: "ILS",
            value: params.priceILS.toFixed(2),
          },
        },
      ],
      payer: {
        name: {
          given_name: params.firstName,
          surname: params.lastName,
        },
        email_address: params.email,
      },
      application_context: {
        brand_name: "על אוטומט",
        user_action: "PAY_NOW",
        landing_page: "BILLING",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal order creation failed: ${JSON.stringify(data)}`);
  }

  const approveLink = (data.links as { rel: string; href: string }[]).find(
    (l) => l.rel === "approve"
  );
  if (!approveLink) throw new Error("PayPal order missing approve link");

  return { orderId: data.id, approveUrl: approveLink.href };
}

export async function captureOrder(orderId: string): Promise<{
  customId: string | undefined;
  status: string;
}> {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);
  }

  const customId = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
  return { customId, status: data.status };
}
