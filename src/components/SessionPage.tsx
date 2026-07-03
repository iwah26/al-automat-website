"use client";

import { useState, useRef } from "react";
import type { Session } from "@/data/sessions";

const CATEGORY_COLORS: Record<string, string> = {
  למידה: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  אבחון: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  יישום: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  כלי: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SessionPage({ session }: { session: Session }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function seekTo(seconds: number) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ key: "seek", seconds }),
      "*"
    );
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const hasVideo = session.bunnyLibraryId && session.bunnyVideoId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* כותרת */}
      <div className="text-right">
        <p className="text-brand-accent font-semibold text-sm mb-1">שיעור {session.number}</p>
        <h1 className="text-3xl font-black text-white">{session.subtitle || session.title}</h1>
      </div>

      {/* וידאו */}
      <div className="aspect-video rounded-2xl overflow-hidden bg-brand-card border border-white/10">
        {hasVideo ? (
          <iframe
            ref={iframeRef}
            src={`https://iframe.mediadelivery.net/embed/${session.bunnyLibraryId}/${session.bunnyVideoId}?autoplay=false&responsive=true&captions=false`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="text-5xl">🎬</div>
            <p className="text-slate-400 font-semibold">הסרטון יעלה בקרוב</p>
          </div>
        )}
      </div>

      {/* פרקים */}
      {session.chapters.length > 0 && (
        <section className="bg-brand-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span>⏱</span> פרקים
          </h2>
          <div className="space-y-1">
            {session.chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => seekTo(ch.seconds)}
                className="w-full flex items-center gap-4 text-right hover:bg-white/5 rounded-xl px-3 py-2.5 transition-colors group"
              >
                <span className="text-brand-accent font-mono text-sm flex-shrink-0 w-10 text-left group-hover:underline">
                  {formatTime(ch.seconds)}
                </span>
                <span className="text-slate-200 group-hover:text-white transition-colors">
                  {ch.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* מצגת */}
      {session.slidesUrl && (
        <section className="bg-brand-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span>🖼</span> מצגת הסשן
          </h2>
          <div className="aspect-[16/9] rounded-xl overflow-hidden">
            <iframe
              src={session.slidesUrl}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* סיכום */}
      {session.summary && (
        <section className="bg-brand-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span>📝</span> על מה דובר בסשן
          </h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line text-right">
            {session.summary}
          </p>
        </section>
      )}

      {/* תמלול */}
      {session.transcript && (
        <section className="bg-brand-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => copyText(session.transcript, "transcript")}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                copied === "transcript"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {copied === "transcript" ? "✓ הועתק" : "העתק"}
            </button>
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="flex items-center gap-2 text-lg font-black text-white hover:text-brand-accent transition-colors"
            >
              📄 תמלול מלא
              <span
                className={`text-sm transition-transform duration-200 ${
                  transcriptOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
          </div>
          {transcriptOpen && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-slate-300 text-sm leading-loose whitespace-pre-line text-right">
                {session.transcript}
              </p>
            </div>
          )}
        </section>
      )}

      {/* פרומפטים */}
      {session.prompts.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span>🥇</span> פרומפטים מוכנים לשימוש
          </h2>
          <div className="space-y-4">
            {session.prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-brand-card rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      CATEGORY_COLORS[prompt.category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }`}
                  >
                    {prompt.category}
                  </span>
                  <h3 className="text-white font-bold text-right flex-1 text-lg leading-snug">
                    {prompt.title}
                  </h3>
                </div>

                {prompt.description && (
                  <p className="text-slate-400 text-sm mb-4 text-right">
                    {prompt.description}
                  </p>
                )}

                <div className="bg-[#1e1230] rounded-xl p-4 mb-4 border border-white/5">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap text-right font-heebo leading-relaxed overflow-x-auto">
                    {prompt.content}
                  </pre>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => copyText(prompt.content, prompt.id)}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors font-semibold ${
                      copied === prompt.id
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30"
                    }`}
                  >
                    {copied === prompt.id ? "✓ הועתק" : "העתק פרומפט"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
