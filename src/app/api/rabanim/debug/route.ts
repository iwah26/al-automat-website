import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GREEN_INVOICE_API_KEY ?? "MISSING";
  const secret = process.env.GREEN_INVOICE_API_SECRET ?? "MISSING";
  return NextResponse.json({
    keyPrefix: key.slice(0, 8),
    keyLength: key.length,
    secretLength: secret.length,
    secretPrefix: secret.slice(0, 4),
  });
}
