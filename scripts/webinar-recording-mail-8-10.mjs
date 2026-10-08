// מייל "הקלטת הוובינר" — 8.10.26. שתי קבוצות:
//   reg  = נרשמי הוובינר (מ-webinar_leads, מ-7.10)
//   past = 24 המתעניינים מהעבר (.private/webinar-8-10/past-interested-relevant.json)
// הרצה: node scripts/webinar-recording-mail-8-10.mjs <reg|past> [--preview] [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "סדנת-רבנים/.private/webinar-8-10");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);
const group = process.argv[2];
const PREVIEW = process.argv.includes("--preview");
const DRY = process.argv.includes("--dry");
if (!["reg", "past"].includes(group)) { console.error("usage: <reg|past> [--preview] [--dry]"); process.exit(1); }

const REC = `https://www.al-automat.co.il/webinar-recording?c=rec-${group}`;
const PAY = `https://www.al-automat.co.il/sadna/form?c=rec-${group}`;
const btn = "display:inline-block; padding:15px 34px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold; font-size:18px;";
const btn2 = "display:inline-block; padding:12px 26px; border:2px solid #412a62; color:#412a62; border-radius:8px; text-decoration:none; font-weight:bold;";

const opening = group === "reg"
  ? "ההקלטה של הוובינר מהערב עלתה — גם אם היית איתנו וגם אם לא הספקת."
  : "לפני כמה חודשים התעניינת בסדנת Claude Code שלנו. הערב העברתי וובינר חדש — וההקלטה כבר עלתה.";

const html = (first) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 580px;">
    <h2 style="margin:0 0 6px; color:#412a62;">הקלטת הוובינר: קלוד קוד לחרדים</h2>
    <p>${first ? `שלום ${first},` : "שלום,"}</p>
    <p>${opening}</p>
    <p><strong>אם לא תדע AI כמו מקצוען — תישאר מאחור.</strong><br />
    בוובינר תראה איך בונים מערכות ואפליקציות לעבודה, בלי לדעת קוד — ודוגמאות אמיתיות שנבנו ככה.</p>
    <p><a href="${REC}" style="${btn}">▶ לצפייה בהקלטה</a></p>

    <p style="background:#f4f0fa; border-radius:10px; padding:14px 18px; margin:22px 0 14px;">
      <strong>הסדנה המעשית מתחילה מחר בבוקר:</strong><br />
      📅 שישי 9.10 + שישי 16.10 · 🕘 9:30–12:30 · בזום<br />
      💰 800₪ · אשראי (אפשר ב-2 תשלומים) או ביט
    </p>
    <p><a href="${PAY}" style="${btn2}">להרשמה לסדנה</a></p>

    <p>יצחק ווחנון · על אוטומט</p>
  </div>`;

async function recipients() {
  if (PREVIEW) return [{ name: "יצחק", email: "isaacwah@gmail.com" }];
  if (group === "past") return JSON.parse(fs.readFileSync(path.join(DIR, "past-interested-relevant.json"), "utf8")).map((r) => ({ name: r.name, email: r.email }));
  const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
  const rows = await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/webinar_leads?created_at=gte.2026-10-07T12:00:00Z&select=full_name,email`, { headers: h })).json();
  const uniq = new Map();
  for (const r of rows) {
    const e = String(r.email || "").trim().toLowerCase();
    if (!e || e.endsWith("@example.com") || e.includes("isaacwah")) continue;
    uniq.set(e, { name: (r.full_name || "").trim(), email: e });
  }
  return [...uniq.values()];
}

// מי שכבר שילם על הסדנה — לא מקבל קריאה להירשם
async function paidEmails() {
  const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
  const rows = await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/rabanim_registrations?cohort=eq.round4&payment_status=eq.paid&select=email`, { headers: h })).json();
  return new Set((Array.isArray(rows) ? rows : []).map((r) => String(r.email || "").toLowerCase()));
}

const logFile = path.join(DIR, `sent-recording-${group}${PREVIEW ? "-preview" : ""}.json`);
const sent = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};
const paid = PREVIEW ? new Set() : await paidEmails();
const list = (await recipients()).filter((r) => PREVIEW || (!sent[r.email] && !paid.has(r.email)));
console.log(`${group}: ${list.length} נמענים (כבר שילמו והוחרגו: ${paid.size})${DRY ? " (dry)" : ""}`);
if (DRY) process.exit(0);

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: Number(env.SMTP_PORT), secure: true,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});
let ok = 0, fail = 0;
for (const r of list) {
  const first = String(r.name || "").split(/\s+/)[0] || "";
  let lastErr = null;
  for (let a = 1; a <= 3; a++) {
    try {
      await transport.sendMail({
        from: `"על אוטומט" <${env.SMTP_USER}>`,
        to: r.email,
        subject: `${first ? `${first}, ` : ""}ההקלטה עלתה — קלוד קוד לחרדים`,
        html: html(first),
      });
      lastErr = null; break;
    } catch (err) { lastErr = err; await new Promise((res) => setTimeout(res, 4000 * a)); }
  }
  if (lastErr) { fail++; console.error("send failed:", r.email.replace(/^(.).*@/, "$1***@"), lastErr.message); }
  else { sent[r.email] = new Date().toISOString(); ok++; }
  await new Promise((res) => setTimeout(res, 800));
}
fs.writeFileSync(logFile, JSON.stringify(sent, null, 1));
console.log(`נשלחו ${ok}, נכשלו ${fail}`);
