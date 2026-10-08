// הזמנה חד-פעמית לוובינר 8.10 למי שהתעניין בעבר ולא קנה (24 נמענים, רשימה מסוננת ב-.private).
// הרצה: node scripts/webinar-invite-past-8-10.mjs [--preview]
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
const LINK = "https://www.al-automat.co.il/webinar?c=past";
const btn = "display:inline-block; padding:14px 32px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold; font-size:18px;";

const list = PREVIEW
  ? [{ name: "יצחק", email: "isaacwah@gmail.com" }]
  : JSON.parse(fs.readFileSync(path.join(DIR, "past-interested-relevant.json"), "utf8"));
const logFile = path.join(DIR, `sent-past${PREVIEW ? "-preview" : ""}.json`);
const sent = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: Number(env.SMTP_PORT), secure: true,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

let ok = 0, fail = 0, skip = 0;
for (const r of list) {
  if (!PREVIEW && sent[r.email]) { skip++; continue; }
  const first = String(r.name || "").trim().split(/\s+/)[0] || "";
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 560px;">
      <p>${first ? `שלום ${first},` : "שלום,"}</p>
      <p>לפני כמה חודשים התעניינת בסדנת Claude Code שלנו.</p>
      <p>הערב אני פותח מחזור חדש, ומתחיל בוובינר חינם בזום — <strong>הערב, חמישי 8.10, ב-21:00</strong>.</p>
      <p style="font-size:18px;"><strong>אם לא תדע AI כמו מקצוען — תישאר מאחור.</strong></p>
      <p>בוובינר תראה איך בונים מערכות ואפליקציות לעבודה — בלי לדעת קוד.</p>
      <p><a href="${LINK}" style="${btn}">להרשמה לוובינר</a></p>
      <p>יצחק ווחנון · על אוטומט</p>
    </div>`;
  try {
    await transport.sendMail({
      from: `"על אוטומט" <${env.SMTP_USER}>`,
      to: r.email,
      subject: `${first ? `${first}, ` : ""}הערב ב-21:00 — קלוד קוד לחרדים`,
      html,
    });
    sent[r.email] = new Date().toISOString();
    ok++;
  } catch (err) {
    fail++;
    console.error("send failed:", r.email.replace(/^(.).*@/, "$1***@"), err.message);
  }
  await new Promise((res) => setTimeout(res, 1500));
}
fs.writeFileSync(logFile, JSON.stringify(sent, null, 1));
console.log(`נשלחו ${ok}, נכשלו ${fail}, דולגו ${skip} (כבר נשלח)`);
