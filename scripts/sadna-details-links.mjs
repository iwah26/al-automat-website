// קישורי שאלון (/sadna/details) לכל משתתף ששילם במחזור ד׳. הרצה: node scripts/sadna-details-links.mjs
import fs from "node:fs";
import { createHmac } from "node:crypto";
const SECRET = fs.readFileSync("src/lib/manualVoucher.ts", "utf8").match(/const SECRET = "([0-9a-f]+)"/)[1];
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => /^RABANIM_SUPABASE_/.test(l))
  .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
const regs = await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/rabanim_registrations?cohort=eq.round4&payment_status=eq.paid&select=id,first_name,last_name,phone,email`, { headers: h })).json();
for (const r of regs) {
  const sig = createHmac("sha256", SECRET).update(`details:${r.id}`).digest("hex").slice(0, 24);
  console.log(JSON.stringify({ name: `${r.first_name} ${r.last_name}`, phone: r.phone, email: r.email, link: `https://www.al-automat.co.il/sadna/details?rid=${r.id}&sig=${sig}` }));
}
