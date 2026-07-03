"use client";

import { useEffect, useState } from "react";

const LINKS = {
  claudeUpgrade: "https://claude.ai/upgrade",
  claudeAPI: "https://console.anthropic.com",
  vscodeWin: "https://update.code.visualstudio.com/latest/win32-x64-user/stable",
  vscodeMac: "https://update.code.visualstudio.com/latest/darwin-universal/stable",
  claudeDesktopWin: "https://claude.ai/api/desktop/win32/x64/setup/latest/redirect",
  claudeDesktopMac: "https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect",
};

function LinkCard({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-5 py-4 rounded-xl bg-brand-card border border-brand-accent/30 hover:border-brand-accent transition-colors group"
    >
      <span className="text-brand-accent text-sm group-hover:underline">{sub}</span>
      <span className="text-white font-semibold">{label}</span>
    </a>
  );
}

export function TodahExtras() {
  const [needsClaude, setNeedsClaude] = useState(false);
  const [needsAPI, setNeedsAPI] = useState(false);

  useEffect(() => {
    const paysForClaude = localStorage.getItem("rabanim_paysForClaude");
    const usesClaudeAPI = localStorage.getItem("rabanim_usesClaudeAPI");
    setNeedsClaude(paysForClaude === "לא, רק גרסה חינמית");
    setNeedsAPI(usesClaudeAPI === "לא");
    localStorage.removeItem("rabanim_paysForClaude");
    localStorage.removeItem("rabanim_usesClaudeAPI");
  }, []);

  if (!needsClaude && !needsAPI) return null;

  return (
    <div className="mt-12 max-w-lg mx-auto text-right">
      <h2 className="text-2xl font-black text-white mb-2">לפני הסדנה — כדאי להתכונן</h2>
      <p className="text-slate-400 mb-8">כמה דברים שכדאי לסדר לפני שנתחיל:</p>

      <div className="space-y-3">
        {needsClaude && (
          <>
            <p className="text-slate-300 font-semibold text-sm">שדרג ל-Claude Pro</p>
            <LinkCard href={LINKS.claudeUpgrade} label="שדרג ל-Claude Pro" sub="claude.ai/upgrade" />

            <p className="text-slate-300 font-semibold text-sm mt-5">VS Code — עורך קוד</p>
            <LinkCard href={LINKS.vscodeWin} label="הורדה לWindows" sub="code.visualstudio.com" />
            <LinkCard href={LINKS.vscodeMac} label="הורדה למק" sub="code.visualstudio.com" />

            <p className="text-slate-300 font-semibold text-sm mt-5">Claude Desktop</p>
            <LinkCard href={LINKS.claudeDesktopWin} label="הורדה לWindows" sub="claude.ai/download" />
            <LinkCard href={LINKS.claudeDesktopMac} label="הורדה למק" sub="claude.ai/download" />
          </>
        )}

        {needsAPI && (
          <>
            <p className={`text-slate-300 font-semibold text-sm ${needsClaude ? "mt-5" : ""}`}>Claude API</p>
            <LinkCard href={LINKS.claudeAPI} label="פתיחת גישה ל-API" sub="console.anthropic.com" />
          </>
        )}
      </div>
    </div>
  );
}
