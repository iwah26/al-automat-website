// מייל המשך אחרי הוובינר 8.10 — לכל מי שנרשם (הגיע או לא): פרטי הסדנה + לינק לתשלום.
// הרצה: node scripts/webinar-followup-8-10.mjs [--preview] [--dry]
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
const PREVIEW = process.argv.includes("--preview");
const DRY = process.argv.includes("--dry");
const PAY = "https://www.al-automat.co.il/sadna/form?c=followup";
const btn = "display:inline-block; padding:15px 36px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold; font-size:19px;";
const li = (t) => `<li style="margin-bottom:6px;">${t}</li>`;

const html = (first) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 580px;">
    <h2 style="margin:0 0 6px; color:#412a62;">סדנת Claude Code לחרדים</h2>
    <p>${first ? `שלום ${first},` : "שלום,"}</p>
    <p>תודה שנרשמת לוובינר של הערב. כמו שאמרתי — <strong>אם לא תדע AI כמו מקצוען, תישאר מאחור.</strong>
    בסדנה לא מסתכלים, בונים: כל משתתף יוצא עם מערכת או אפליקציה אמיתית לעבודה שלו — בלי לדעת קוד.</p>

    <p style="background:#f4f0fa; border-radius:10px; padding:14px 18px; margin:18px 0;">
      📅 <strong>שישי 9.10 + שישי 16.10</strong><br />
      🕘 9:30–12:30 בבוקר · בזום<br />
      💰 <strong>800₪</strong> · אשראי (אפשר ב-2 תשלומים) או ביט
    </p>

    <p><strong>מה מקבלים:</strong></p>
    <ul style="padding-right:20px; margin-top:0;">
      ${li("שני מפגשים חיים של 3 שעות — בונים יחד, צעד אחר צעד")}
      ${li("קבוצת תמיכה בוואטסאפ, כולל בוט AI שעונה מיד")}
      ${li("אתר הסדנה: הקלטות + תמלול מלא + פרומפטים מוכנים")}
      ${li("חצי שנה חינם בקבוצת ה-AI הסגורה")}
      ${li("ההקלטות פתוחות לצפייה לכל החיים")}
    </ul>

    <p style="color:#9a6b12; font-weight:bold;">⏳ החבילה המלאה במחיר הזה — רק עד 23:32 הלילה.</p>

    <p><a href="${PAY}" style="${btn}">להרשמה ותשלום</a></p>
    <p style="color:#666; font-size:14px;">ממלאים שם, טלפון ומייל ועוברים ישר לתשלום. אחרי התשלום מגיעים במייל ובוואטסאפ: קישור הזום, הסיסמה לאתר ההקלטות והקישור לקבוצה.</p>

    <p>שאלות? פשוט תענה למייל הזה.</p>
    <p>יצחק ווחנון · על אוטומט</p>
  </div>`;

async function recipients() {
  if (PREVIEW) return [{ full_name: "יצחק", email: "isaacwah@gmail.com" }];
  const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
  const rows = await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/webinar_leads?created_at=gte.2026-10-07T12:00:00Z&select=full_name,email`, { headers: h })).json();
  if (!Array.isArray(rows)) throw new Error("webinar_leads fetch failed");
  const uniq = new Map();
  for (const r of rows) {
    const e = String(r.email || "").trim().toLowerCase();
    if (!e || e.endsWith("@example.com") || e.includes("isaacwah")) continue;
    uniq.set(e, { full_name: (r.full_name || "").trim(), email: e });
  }
  return [...uniq.values()];
}

const logFile = path.join(DIR, `sent-followup${PREVIEW ? "-preview" : ""}.json`);
const sent = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};
const list = (await recipients()).filter((r) => PREVIEW || !sent[r.email]);
console.log(`${list.length} נמענים${DRY ? " (dry)" : ""}`);
if (DRY) process.exit(0);

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: Number(env.SMTP_PORT), secure: true,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});
let ok = 0, fail = 0;
for (const r of list) {
  const first = r.full_name.split(/\s+/)[0] || "";
  let lastErr = null;
  for (let a = 1; a <= 3; a++) {
    try {
      await transport.sendMail({
        from: `"על אוטומט" <${env.SMTP_USER}>`,
        to: r.email,
        subject: `${first ? `${first}, ` : ""}פרטי סדנת Claude Code לחרדים — שישי 9.10`,
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
