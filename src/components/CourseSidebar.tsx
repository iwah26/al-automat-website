"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@/data/sessions";

export function CourseSidebar({ sessions }: { sessions: Session[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 border-l border-white/10 bg-brand-card/30 min-h-screen">
      <div className="sticky top-16">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1">הקורס</p>
          <h2 className="text-white font-black text-lg leading-tight">כל השיעורים</h2>
        </div>
        <nav className="p-3 space-y-1">
          {sessions.map((session) => {
            const isActive = pathname === `/course/${session.id}`;
            const hasVideo = !!(session.bunnyLibraryId && session.bunnyVideoId);
            return (
              <Link
                key={session.id}
                href={`/course/${session.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-accent/20 border border-brand-accent/40"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    isActive
                      ? "bg-brand-accent text-white"
                      : hasVideo
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {session.number}
                </span>
                <div className="text-right flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                    {session.title}
                  </p>
                  <p className="text-slate-500 text-xs truncate">{session.subtitle}</p>
                </div>
                {!hasVideo && (
                  <span className="text-xs text-slate-600 flex-shrink-0">בקרוב</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
