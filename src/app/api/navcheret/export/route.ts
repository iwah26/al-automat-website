import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVCard(c: any): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`N:${esc(c.last_name)};${esc(c.first_name)};;;`);
  lines.push(`FN:${esc(c.first_name)} ${esc(c.last_name)}`);
  lines.push(`TEL;TYPE=CELL,PREF:${c.phone1_prefix}${c.phone1_number}`);

  if (c.phone2_number) {
    lines.push(`TEL;TYPE=CELL:${c.phone2_prefix}${c.phone2_number}`);
  }

  if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${c.email}`);
  if (c.business_name) lines.push(`ORG:${esc(c.business_name)}`);
  if (c.website) lines.push(`URL:${c.website}`);

  const cats = [c.business_category, c.business_subcategory]
    .filter(Boolean)
    .map(esc)
    .join(",");
  if (cats) lines.push(`CATEGORIES:${cats}`);

  lines.push(`NOTE:${esc('מתוך קבוצת "נבחרת היועצים" של איתמר שולם')}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.NAVCHERET_EXPORT_KEY || key !== process.env.NAVCHERET_EXPORT_KEY) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("navcheret_contacts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error);
    return new NextResponse("DB error", { status: 500 });
  }

  const vcf = (data ?? []).map(toVCard).join("\r\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard;charset=utf-8",
      "Content-Disposition": 'attachment; filename="navcheret.vcf"',
    },
  });
}
