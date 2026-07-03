"use client";

import { useEffect, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  avreich: "אברך",
  "rav-kehila": "רב קהילה",
  "rav-rashi": "הרב הראשי",
  menahel: "מנהל מוסד",
  other: "",
};

const LINKS = {
  claudeUpgrade: "https://claude.ai/upgrade",
  claudeAPI: "https://console.anthropic.com",
  vscodeWin: "https://update.code.visualstudio.com/latest/win32-x64-user/stable",
  vscodeMac: "https://update.code.visualstudio.com/latest/darwin-universal/stable",
  claudeDesktopWin: "https://claude.ai/api/desktop/win32/x64/setup/latest/redirect",
  claudeDesktopMac: "https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect",
};

function CheckItem({
  label,
  children,
  done,
  onToggle,
}: {
  label: string;
  children?: React.ReactNode;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-brand-card border border-brand-accent/20">
      <button
        onClick={onToggle}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
          done
            ? "bg-brand-accent border-brand-accent"
            : "border-brand-accent/50 hover:border-brand-accent"
        }`}
      >
        {done && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 text-right">
        <p className={`font-semibold ${done ? "line-through text-slate-500" : "text-white"}`}>{label}</p>
        {!done && children && <div className="mt-2 space-y-1">{children}</div>}
      </div>
    </div>
  );
}

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
    >
      ↙ {label}
    </a>
  );
}

export function TodahContent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [needsClaude, setNeedsClaude] = useState(true);
  const [needsAPI, setNeedsAPI] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFirstName(localStorage.getItem("rabanim_firstName") ?? "");
    setLastName(localStorage.getItem("rabanim_lastName") ?? "");
    setRole(localStorage.getItem("rabanim_role") ?? "");
    setNeedsClaude(localStorage.getItem("rabanim_paysForClaude") === "לא, רק גרסה חינמית");
    setNeedsAPI(localStorage.getItem("rabanim_usesClaudeAPI") === "לא");
    ["claude", "vscode", "claudeDesktop", "api", "whatsapp", "recordings"].forEach((k) =>
      localStorage.removeItem(`rabanim_${k}`)
    );
    ["rabanim_firstName", "rabanim_lastName", "rabanim_role", "rabanim_paysForClaude", "rabanim_usesClaudeAPI"].forEach(
      (k) => localStorage.removeItem(k)
    );
  }, []);

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const fullName = `${firstName} ${lastName}`.trim();
  const roleLabel = ROLE_LABELS[role] ?? "";

  return (
    <div className="max-w-lg mx-auto px-4 text-right">
      {/* כותרת */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-black text-white leading-snug">
          ברוך הבא{fullName && ", הרב "}
          {fullName && <span className="text-brand-accent">{fullName}</span>}
          {fullName && " שליט״א"}
        </h1>
        {roleLabel && <p className="text-brand-accent/80 font-semibold text-lg mt-1">{roleLabel}</p>}
        <p className="text-xl text-white font-bold mt-3">לסדנת Claude Code לרבנים</p>
        <p className="text-slate-400 mt-2">
          כדי לנצל את הזמן בצורה המירבית — אנא ודא שיש לך את כל הדברים הבאים לפני תחילת הסדנה
        </p>
      </div>

      {/* צ'קליסט */}
      <div className="space-y-3">
        <CheckItem
          label="חשבון Claude Pro פעיל"
          done={!needsClaude || !!checked["claude"]}
          onToggle={() => toggle("claude")}
        >
          <p className="text-slate-400 text-sm mb-1">דרוש לשימוש מלא בסדנה</p>
          <DownloadLink href={LINKS.claudeUpgrade} label="שדרג כאן" />
        </CheckItem>

        <CheckItem
          label="Claude Desktop מותקן"
          done={!!checked["claudeDesktop"]}
          onToggle={() => toggle("claudeDesktop")}
        >
          <div className="flex gap-4">
            <DownloadLink href={LINKS.claudeDesktopWin} label="Windows" />
            <DownloadLink href={LINKS.claudeDesktopMac} label="Mac" />
          </div>
        </CheckItem>

        <CheckItem
          label="VS Code מותקן"
          done={!!checked["vscode"]}
          onToggle={() => toggle("vscode")}
        >
          <div className="flex gap-4">
            <DownloadLink href={LINKS.vscodeWin} label="Windows" />
            <DownloadLink href={LINKS.vscodeMac} label="Mac" />
          </div>
        </CheckItem>

        <CheckItem
          label="גישה ל-Claude API"
          done={!needsAPI || !!checked["api"]}
          onToggle={() => toggle("api")}
        >
          <p className="text-slate-400 text-sm mb-1">נדרש לחלק המתקדם בסדנה</p>
          <DownloadLink href={LINKS.claudeAPI} label="פתח גישה כאן" />
        </CheckItem>

        <CheckItem
          label="הצטרפות לקבוצת WhatsApp"
          done={!!checked["whatsapp"]}
          onToggle={() => toggle("whatsapp")}
        >
          <p className="text-slate-400 text-sm mb-1">
            הצטרף לקבוצת <span className="text-white">"הרבטומטים🕵🏻 - הקבוצה הפתוחה"</span> —
            קבוצה לחידושי AI לרבנים
          </p>
          <DownloadLink
            href="https://chat.whatsapp.com/IDbCTp4SuIeA9aOB3i9eWF?s=cl&p=a&ilr=2"
            label="הצטרפות לקבוצה"
          />
        </CheckItem>

        <CheckItem
          label="גישה לאתר ההקלטות"
          done={!!checked["recordings"]}
          onToggle={() => toggle("recordings")}
        >
          <p className="text-slate-400 text-sm mb-1">
            אחרי כל מפגש תעלה הקלטה לעמוד קורס ייעודי. הגישה מוגנת בסיסמה
            אישית שקיבלת/תקבל בוואטסאפ — עד 2 מכשירים.
          </p>
          <DownloadLink href="/course" label="מעבר לעמוד הקורס" />
        </CheckItem>
      </div>

      {/* פרטי הסדנה */}
      <div className="mt-12 space-y-6">
        <section className="p-5 rounded-2xl bg-brand-card border border-brand-accent/20">
          <h2 className="text-xl font-bold text-white mb-3">📅 פרטי הסדנה</h2>
          <ul className="text-slate-300 space-y-1">
            <li>מפגש ראשון: 12.7 (כ״ז תמוז)</li>
            <li>מפגש שני: 19.7 (ה׳ אב)</li>
            <li>שעה: 18:00–21:00 שעון ישראל</li>
            <li>
              לינק זום (לשני המפגשים):{" "}
              <a
                href="https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1"
                className="text-brand-accent underline"
              >
                לחץ כאן להצטרפות
              </a>
            </li>
          </ul>
        </section>

        <section className="p-5 rounded-2xl bg-brand-card border border-brand-accent/20">
          <h2 className="text-xl font-bold text-white mb-3">💻 מחשב</h2>
          <ul className="text-slate-300 space-y-1 list-disc pr-5">
            <li>מחשב נייד / נייח עם Windows או Mac</li>
            <li>חיבור אינטרנט יציב</li>
            <li>מסך שניתן לשתף בזום</li>
          </ul>
        </section>
      </div>

      <p className="text-center text-slate-400 mt-12">
        שאלות? פשוט תכתוב לנו בוואטסאפ — נתראה בזום! 😊
      </p>
    </div>
  );
}
