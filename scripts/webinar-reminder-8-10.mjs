// תזכורות מייל לוובינר "קלוד קוד לחרדים" — חמישי 8.10.26, 21:00.
// הרצה: node scripts/webinar-reminder-8-10.mjs <1|2> [--preview] [--dry]
//   1 = 20:30 ("עוד חצי שעה"), 2 = 20:55 ("מתחילים עכשיו")
//   --preview = רק ל-isaacwah@gmail.com, בלי בדיקת שעה · --dry = רק סופר נמענים
// מופעל מ-launchd (com.yitzhak.webinar-reminder-8-10-*). שולף נרשמים בזמן השליחה — כולל מי שנרשם ברגע האחרון.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG_DIR = path.join(ROOT, "סדנת-רבנים/.private/webinar-8-10");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);

const slot = process.argv[2];
const PREVIEW = process.argv.includes("--preview");
const DRY = process.argv.includes("--dry");
if (!["1", "2"].includes(slot)) { console.error("usage: <1|2> [--preview] [--dry]"); process.exit(1); }

// שמירה מפני ריצה מאוחרת (למשל אם המק התעורר אחרי הוובינר)
const il = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
const minutes = il.getHours() * 60 + il.getMinutes();
const sameDay = il.getFullYear() === 2026 && il.getMonth() === 9 && il.getDate() === 8;
const windowOk = slot === "1" ? minutes >= 20 * 60 + 20 && minutes <= 20 * 60 + 52 : minutes >= 20 * 60 + 50 && minutes <= 21 * 60 + 20;
if (!PREVIEW && !DRY && !(sameDay && windowOk)) {
  console.log(`[${il.toISOString()}] slot ${slot}: מחוץ לחלון השליחה — מדלג`);
  process.exit(0);
}

const JOIN = "https://www.al-automat.co.il/api/webinar/join";
const joinUrl = (name, email) => {
  const p = new URLSearchParams();
  if (name) p.set("u", name);
  if (email) p.set("e", email);
  return `${JOIN}?${p}`;
};
const btn = "display:inline-block; padding:14px 32px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold; font-size:18px;";

const CONTENT = {
  "1": {
    subject: "עוד חצי שעה: קלוד קוד לחרדים — מתחילים ב-21:00",
    html: (name, url) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 560px;">
        <h2 style="margin:0 0 8px; color:#412a62;">קלוד קוד לחרדים</h2>
        <p>${name ? `שלום ${name} 🙏` : "שלום 🙏"}</p>
        <p><strong>בעוד חצי שעה, ב-21:00, מתחילים.</strong></p>
        <p>הערב תראה איך בונים מערכות ואפליקציות לעבודה — בלי לדעת קוד. ולמה לשאול את ChatGPT זה עוד לא לדעת AI.</p>
        <p><a href="${url}" style="${btn}">כניסה לוובינר</a></p>
        <p style="color:#555;">💡 כדאי להתחבר כמה דקות לפני, מהמחשב — יש דוגמאות על המסך שכדאי לראות בגדול.</p>
        <p>נתראה בזום!<br />יצחק ווחנון · על אוטומט</p>
      </div>`,
  },
  "2": {
    subject: "🔴 מתחילים עכשיו — קלוד קוד לחרדים",
    html: (name, url) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 560px;">
        <p>${name ? `${name}, ` : ""}אנחנו עולים לאוויר <strong>בעוד 5 דקות</strong>.</p>
        <p><a href="${url}" style="${btn}">לחץ כאן להצטרפות</a></p>
        <p style="color:#555;">החדר כבר פתוח — אפשר להיכנס עכשיו.</p>
        <p>יצחק</p>
      </div>`,
  },
};

async function recipients() {
  if (PREVIEW) return [{ full_name: "יצחק", email: "isaacwah@gmail.com" }];
  const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
  const res = await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/webinar_leads?created_at=gte.2026-10-07T12:00:00Z&select=full_name,email&order=created_at.asc`, { headers: h });
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("webinar_leads fetch failed");
  const uniq = new Map();
  for (const r of rows) {
    const e = String(r.email || "").trim().toLowerCase();
    if (!e || e.endsWith("@example.com")) continue;
    uniq.set(e, { full_name: (r.full_name || "").trim(), email: e });
  }
  return [...uniq.values()];
}

const logFile = path.join(LOG_DIR, `sent-slot${slot}${PREVIEW ? "-preview" : ""}.json`);
const sent = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};
const list = (await recipients()).filter((r) => PREVIEW || !sent[r.email]);
console.log(`[${il.toISOString()}] slot ${slot}: ${list.length} נמענים${DRY ? " (dry)" : ""}`);
if (DRY) process.exit(0);

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: Number(env.SMTP_PORT), secure: true,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});
let ok = 0, fail = 0;
for (const r of list) {
  const first = r.full_name.split(/\s+/)[0] || "";
  // שרת המייל מחזיר לפעמים 535 זמני — עד 3 ניסיונות
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await transport.sendMail({
        from: `"על אוטומט" <${env.SMTP_USER}>`,
        to: r.email,
        subject: CONTENT[slot].subject,
        html: CONTENT[slot].html(first, joinUrl(r.full_name, r.email)),
      });
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      await new Promise((res) => setTimeout(res, 4000 * attempt));
    }
  }
  if (lastErr) {
    fail++;
    console.error("send failed:", r.email.replace(/^(.).*@/, "$1***@"), lastErr.message);
  } else {
    sent[r.email] = new Date().toISOString();
    ok++;
  }
  await new Promise((res) => setTimeout(res, 800));
}
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.writeFileSync(logFile, JSON.stringify(sent, null, 1));
console.log(`slot ${slot}: נשלחו ${ok}, נכשלו ${fail}`);
