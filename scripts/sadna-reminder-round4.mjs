// תזכורת למשתתפי סדנת Claude Code לחרדים (מחזור ד׳) — מייל + וואטסאפ לכל מי ששילם.
// הרצה: node scripts/sadna-reminder-round4.mjs <s1-eve|s1-now|s2-eve|s2-now> [--preview] [--dry]
//   s1-eve = ערב לפני מפגש א׳ (19.10) · s1-now = חצי שעה לפני (20.10 15:30) · וכן s2 ל-26/27.10
// ⚠️ לא בשבת/חג. לא מתוזמן אוטומטית — יצחק מחליט.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "סדנת-רבנים/.private/round4");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);
const kind = process.argv[2];
const PREVIEW = process.argv.includes("--preview");
const DRY = process.argv.includes("--dry");
const ZOOM = "https://us02web.zoom.us/j/86198091857";
const COURSE = "https://www.al-automat.co.il/sadna/course";
const T = {
  "s1-eve": { subj: "מחר ב-16:00 — מפגש א׳ של סדנת Claude Code לחרדים", head: "מחר, יום שלישי 20.10, ב-16:00 מתחילים 🎉", tip: "כדאי להגיע עם מחשב (לא טלפון), עם Claude Pro פעיל ו-VS Code מותקן — רשימת ההכנה בדף התודה." },
  "s1-now": { subj: "🔴 עוד חצי שעה — מפגש א׳", head: "בעוד חצי שעה, ב-16:00, מתחילים את מפגש א׳.", tip: "מתחברים מהמחשב, ופותחים את VS Code." },
  "s2-eve": { subj: "מחר ב-16:00 — מפגש ב׳ (האחרון) של הסדנה", head: "מחר, יום שלישי 27.10, ב-16:00 — מפגש ב׳ והאחרון.", tip: "ההקלטה של מפגש א׳ באתר הסדנה, למי שרוצה לחזור על משהו." },
  "s2-now": { subj: "🔴 עוד חצי שעה — מפגש ב׳", head: "בעוד חצי שעה, ב-16:00, מתחילים את מפגש ב׳.", tip: "מתחברים מהמחשב, עם הפרויקט מהמפגש הקודם פתוח." },
}[kind];
if (!T) { console.error("usage: <s1-eve|s1-now|s2-eve|s2-now> [--preview] [--dry]"); process.exit(1); }

const h = { apikey: env.RABANIM_SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.RABANIM_SUPABASE_SERVICE_KEY}` };
const list = PREVIEW
  ? [{ first_name: "יצחק", email: "isaacwah@gmail.com", phone: null }]
  : await (await fetch(`${env.RABANIM_SUPABASE_URL}/rest/v1/rabanim_registrations?cohort=eq.round4&payment_status=eq.paid&select=first_name,email,phone`, { headers: h })).json();
const logFile = path.join(DIR, `sent-${kind}${PREVIEW ? "-preview" : ""}.json`);
const sent = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};
const todo = list.filter((r) => PREVIEW || !sent[r.email]);
console.log(`${kind}: ${todo.length} משתתפים${DRY ? " (dry)" : ""}`);
if (DRY) process.exit(0);

const btn = "display:inline-block; padding:14px 32px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold; font-size:18px;";
const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT), secure: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } });
const G = `${env.GREEN_API_URL}/waInstance${env.GREEN_API_INSTANCE}`;
const wa = async (m, body) => (await fetch(`${G}/${m}/${env.GREEN_API_TOKEN}`, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})).json();

for (const r of todo) {
  const first = r.first_name || "";
  try {
    await transport.sendMail({
      from: `"על אוטומט" <${env.SMTP_USER}>`, to: r.email, subject: T.subj,
      html: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 560px;">
        <p>${first ? `שלום ${first} 🙏` : "שלום 🙏"}</p><p><strong>${T.head}</strong></p>
        <p><a href="${ZOOM}" style="${btn}">כניסה לזום</a></p>
        <p>💡 ${T.tip}</p><p>אתר הסדנה וההקלטות: <a href="${COURSE}">${COURSE.replace("https://www.", "")}</a></p>
        <p>נתראה!<br />יצחק ווחנון · על אוטומט</p></div>`,
    });
  } catch (e) { console.error("mail failed:", e.message); }
  const phone = String(r.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  if (phone && (await wa("getStateInstance")).stateInstance === "authorized") {
    await wa("sendMessage", { chatId: `${phone}@c.us`, message: `${first ? first + ", " : ""}${T.head}\n🔗 ${ZOOM}\n💡 ${T.tip}` });
    await new Promise((res) => setTimeout(res, 15000 + Math.random() * 10000));
  }
  sent[r.email] = new Date().toISOString();
}
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(logFile, JSON.stringify(sent, null, 1));
console.log("done");
