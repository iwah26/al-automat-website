// טבלת תשובות השאלון של משתתפי הסדנה (נשמרות ב-Vercel Blob: registration-answers/<rid>.json)
// הרצה: node scripts/sadna-answers.mjs
import fs from "node:fs";
import { list, get } from "@vercel/blob";
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l))
  .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
const regs = await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/rabanim_registrations?cohort=eq.round4&payment_status=eq.paid&select=id,first_name,last_name`, { headers: h })).json();
const name = Object.fromEntries(regs.map((r) => [r.id, `${r.first_name} ${r.last_name}`]));
const { blobs } = await list({ prefix: "registration-answers/" });
const rows = [];
for (const b of blobs) {
  const r = await get(b.pathname, { access: "private" });
  const d = JSON.parse(await new Response(r.stream).text());
  rows.push({ name: name[d.rid] || d.rid, ...d });
}
console.log(JSON.stringify(rows, null, 1));
console.log(`\n${rows.length} מתוך ${regs.length} משלמים מילאו את השאלון`);
