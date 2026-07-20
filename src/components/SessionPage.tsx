"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import type { Session } from "@/data/sessions";

interface PlayerJsPlayer {
  setCurrentTime: (seconds: number) => void;
  on: (event: string, cb: () => void) => void;
}

declare global {
  interface Window {
    playerjs?: { Player: new (iframe: HTMLIFrameElement) => PlayerJsPlayer };
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  למידה: "bg-blue-50 text-blue-700 border-blue-200",
  אבחון: "bg-yellow-50 text-yellow-700 border-yellow-200",
  יישום: "bg-emerald-50 text-emerald-700 border-emerald-200",
  כלי: "bg-purple-50 text-purple-700 border-purple-200",
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
  const playerRef = useRef<PlayerJsPlayer | null>(null);
  const playerReadyRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);

  function initPlayer() {
    if (!iframeRef.current || !window.playerjs || playerRef.current) return;
    const player = new window.playerjs.Player(iframeRef.current);
    playerRef.current = player;
    player.on("ready", () => {
      playerReadyRef.current = true;
      if (pendingSeekRef.current !== null) {
        player.setCurrentTime(pendingSeekRef.current);
        pendingSeekRef.current = null;
      }
    });
  }

  function seekTo(seconds: number) {
    initPlayer();
    if (playerReadyRef.current && playerRef.current) {
      playerRef.current.setCurrentTime(seconds);
    } else {
      pendingSeekRef.current = seconds;
    }
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
        <p className="text-course-accent font-semibold text-sm mb-1">שיעור {session.number}</p>
        <h1 className="text-3xl font-black text-course-text">{session.subtitle || session.title}</h1>
      </div>

      {/* וידאו */}
      <div className="aspect-video rounded-2xl overflow-hidden bg-course-card border border-course-border">
        {hasVideo ? (
          <>
            <Script
              src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js"
              strategy="afterInteractive"
              onLoad={initPlayer}
            />
            <iframe
              ref={iframeRef}
              src={`https://iframe.mediadelivery.net/embed/${session.bunnyLibraryId}/${session.bunnyVideoId}?autoplay=false&responsive=true&captions=false`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={initPlayer}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="text-5xl">🎬</div>
            <p className="text-course-muted font-semibold">הסרטון יעלה בקרוב</p>
          </div>
        )}
      </div>

      {/* פרקים */}
      {session.chapters.length > 0 && (
        <section className="bg-course-card rounded-2xl p-6 border border-course-border">
          <h2 className="text-lg font-black text-course-text mb-4 flex items-center gap-2">
            <span>⏱</span> פרקים
          </h2>
          <div className="space-y-1">
            {session.chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => seekTo(ch.seconds)}
                className="w-full flex items-center gap-4 text-right hover:bg-course-bg rounded-xl px-3 py-2.5 transition-colors group"
              >
                <span className="text-course-accent font-mono text-sm flex-shrink-0 w-10 text-left group-hover:underline">
                  {formatTime(ch.seconds)}
                </span>
                <span className="text-course-muted group-hover:text-course-text transition-colors">
                  {ch.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* מצגת */}
      {session.slidesUrl && (
        <section className="bg-course-card rounded-2xl p-6 border border-course-border">
          <h2 className="text-lg font-black text-course-text mb-4 flex items-center gap-2">
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
        <section className="bg-course-card rounded-2xl p-6 border border-course-border">
          <h2 className="text-lg font-black text-course-text mb-4 flex items-center gap-2">
            <span>📝</span> על מה דובר בסשן
          </h2>
          <p className="text-course-muted leading-relaxed whitespace-pre-line text-right">
            {session.summary}
          </p>
        </section>
      )}

      {/* תמלול */}
      {session.transcript && (
        <section className="bg-course-card rounded-2xl p-6 border border-course-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => copyText(session.transcript, "transcript")}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                copied === "transcript"
                  ? "bg-emerald-500/20 text-emerald-700"
                  : "bg-course-bg text-course-muted hover:text-course-text hover:bg-course-border"
              }`}
            >
              {copied === "transcript" ? "✓ הועתק" : "העתק"}
            </button>
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="flex items-center gap-2 text-lg font-black text-course-text hover:text-course-accent transition-colors"
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
            <div className="mt-4 pt-4 border-t border-course-border">
              <p className="text-course-muted text-sm leading-loose whitespace-pre-line text-right">
                {session.transcript}
              </p>
            </div>
          )}
        </section>
      )}

      {/* פרומפטים */}
      {session.prompts.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-course-text mb-4 flex items-center gap-2">
            <span>🥇</span> פרומפטים מוכנים לשימוש
          </h2>
          <div className="space-y-4">
            {session.prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-course-card rounded-2xl p-6 border border-course-border"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      CATEGORY_COLORS[prompt.category] || "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {prompt.category}
                  </span>
                  <h3 className="text-course-text font-bold text-right flex-1 text-lg leading-snug">
                    {prompt.title}
                  </h3>
                </div>

                {prompt.description && (
                  <p className="text-course-muted text-sm mb-4 text-right">
                    {prompt.description}
                  </p>
                )}

                <div className="bg-course-bg rounded-xl p-4 mb-4 border border-course-border">
                  <pre className="text-course-text text-sm whitespace-pre-wrap text-right font-heebo leading-relaxed overflow-x-auto">
                    {prompt.content}
                  </pre>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => copyText(prompt.content, prompt.id)}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors font-semibold ${
                      copied === prompt.id
                        ? "bg-emerald-500/20 text-emerald-700"
                        : "bg-course-accent/10 text-course-accent hover:bg-course-accent/20"
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
