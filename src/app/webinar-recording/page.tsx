import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "הקלטת הוובינר: קלוד קוד לחרדים | על אוטומט",
  description: "הקלטת הוובינר — איך בונים מערכות ואפליקציות לעבודה, בלי לדעת קוד. ופרטי הסדנה: שישי 9.10 + 16.10.",
};

// וובינר 8.10.26 — הועלה מהקלטת הענן של זום לספריית באני (695009)
const BUNNY_LIBRARY_ID = "695009";
const BUNNY_VIDEO_ID = "4f424fec-5e2c-4883-a06d-20734801cd5e";

async function logClickIfPresent(code: string | undefined) {
  if (!code) return;
  try {
    const ua = (await headers()).get("user-agent") ?? undefined;
    await getRabanimSupabase().from("rabanim_link_clicks").insert({ code, user_agent: ua });
  } catch {
    // מעקב בלבד
  }
}

export default async function WebinarRecordingPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);
  const sadnaHref = `/sadna${c ? `?c=${encodeURIComponent(c)}` : "?c=recording"}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-slate-300 mb-2">הקלטת הוובינר</p>
          <h1 className="text-4xl font-black text-white leading-snug mb-3">
            אם לא תדע AI כמו מקצוען — <span className="text-brand-accent">תישאר מאחור.</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            קלוד קוד לחרדים: איך בונים מערכות ואפליקציות לעבודה — בלי לדעת קוד.
          </p>

          <div
            className="rounded-2xl overflow-hidden border border-brand-accent/20 mb-10"
            style={{ position: "relative", paddingTop: "56.25%" }}
          >
            <iframe
              src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${BUNNY_VIDEO_ID}?autoplay=false&responsive=true`}
              loading="lazy"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          </div>

          <div className="p-6 rounded-2xl bg-brand-card border border-brand-accent/20 text-right">
            <p className="text-white font-bold text-xl mb-2">הסדנה המעשית — בונים, לא רק מסתכלים</p>
            <p className="text-slate-300 leading-relaxed mb-1">📅 שישי 9.10 + שישי 16.10 · 9:30–12:30 בבוקר · בזום</p>
            <p className="text-slate-300 leading-relaxed mb-5">💰 800₪ · אשראי (אפשר ב-2 תשלומים) או ביט</p>
            <Link
              href={sadnaHref}
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity"
            >
              לפרטים והרשמה ←
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
