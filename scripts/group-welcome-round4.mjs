// הודעת "היום מתחילים" לקבוצת סדנת Claude Code לחרדים + שליחה אישית למי שמצטרף אחר כך.
// node scripts/group-welcome-round4.mjs send   — שולח לקבוצה ושומר את רשימת החברים (baseline)
// node scripts/group-welcome-round4.mjs watch  — שולח בפרטי לכל מי שהצטרף מאז (רץ מ-launchd כל 3 דק׳)
// עוצר לבד ב-20.10.26 16:00 (תחילת המפגש — אחרי זה הנוסח "היום ב-16:00" כבר לא נכון). לא בשבת.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, "סדנת-רבנים/.private/round4/group-welcome-state.json");
const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  .filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const GROUP = "120363428961078088@g.us";
const OWN = "972526266419@c.us";
const END = Date.parse("2026-10-20T13:00:00Z"); // 16:00 שעון ישראל
const G = `${env.GREEN_API_URL}/waInstance${env.GREEN_API_INSTANCE}`;
const api = async (m, body) => {
  for (let a = 0; a < 3; a++) {
    try {
      const t = await (await fetch(`${G}/${m}/${env.GREEN_API_TOKEN}`, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})).text();
      if (t) return JSON.parse(t);
    } catch {}
    await new Promise((r) => setTimeout(r, 3000));
  }
  return {};
};

export const MESSAGE = `🎉 *היום זה קורה!*
- היום, *בשעה 16:00 בדיוק*, מתחילים את מפגש א׳ של סדנת Claude Code לחרדים. אני ממש מתרגש, ומחכה לבנות איתכם 💪

*כדי שנספיק הכל, הנה כמה דברים להכין מראש:*
- 💻 *מחשב, לא טלפון.* בסדנה בונים, ובטלפון זה פשוט לא יעבוד.
- 🌐 *אינטרנט טוב ויציב.*
- 🤫 *מקום שקט* שאפשר להתרכז בו.
- ☕ *מים, קפה וכל מה שצריך* לידכם, ואת שאר העיסוקים לשים בצד לשלוש שעות.
- 🖥️🖥️ *יש לכם 2 מסכים ואתם יודעים לעבוד איתם? מצוין.* זה הרבה יותר יעיל.
- 🎥 *תוכנת Zoom מותקנת על המחשב.* (גם היא בדף הקישורים למטה)
- 🛠️ *כל התוכנות מההרשמה מותקנות על המחשב שתעבדו איתו בסדנה.* הרשימה עם קישורי ההורדה כאן:
https://www.al-automat.co.il/sadna/prep

🔗 *קישור הזום (לשני המפגשים):*
- https://us02web.zoom.us/j/86198091857

❓ *שאלות?*
- כתבו כאן בקבוצה. יש בקבוצה עוזר AI אוטומטי 🤖 שעונה מיד, ואם הוא לא יסתדר, אני כאן.

נתראה ב-16:00!
יצחק`;

const members = async () => ((await api("getGroupData", { groupId: GROUP })).participants || []).map((p) => p.id);
const mode = process.argv[2];
const stamp = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

if (mode === "send") {
  const r = await api("sendMessage", { chatId: GROUP, message: MESSAGE });
  const base = await members();
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify({ sentAt: new Date().toISOString(), groupMsg: r.idMessage || null, known: base, welcomed: [] }, null, 1));
  console.log(`[${stamp}] group message:`, r.idMessage ? "✓" : JSON.stringify(r).slice(0, 100), "| members baseline:", base.length);
} else if (mode === "watch") {
  if (Date.now() > END) {
    console.log(`[${stamp}] אחרי 16:00 — עוצר ומסיר את המשימה מ-launchd`);
    const { execSync } = await import("node:child_process");
    try { execSync(`launchctl bootout gui/${process.getuid()}/com.yitzhak.group-welcome-round4`); } catch {}
    process.exit(0);
  }
  const il = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  if (il.getDay() === 6 || (il.getDay() === 5 && il.getHours() >= 16)) process.exit(0); // לא בשבת
  const s = JSON.parse(fs.readFileSync(STATE, "utf8"));
  const now = await members();
  if (!now.length) { console.log(`[${stamp}] getGroupData ריק — מדלג`); process.exit(0); }
  const fresh = now.filter((id) => !s.known.includes(id) && id !== OWN && id.endsWith("@c.us"));
  for (const id of fresh) {
    if ((await api("getStateInstance")).stateInstance !== "authorized") { console.log("STOP — not authorized"); break; }
    const r = await api("sendMessage", { chatId: id, message: MESSAGE });
    console.log(`[${stamp}] new member …${id.slice(-8, -5)} →`, r.idMessage ? "✓" : JSON.stringify(r).slice(0, 80));
    if (r.idMessage) s.welcomed.push(id);
    s.known.push(id);
    await new Promise((res) => setTimeout(res, 8000));
  }
  fs.writeFileSync(STATE, JSON.stringify(s, null, 1));
}
