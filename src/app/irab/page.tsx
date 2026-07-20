import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "iRab | הרב יצחק ווחנון - יועץ רב תחומי",
  description:
    "ייעוץ רב תחומי לתורה, טכנולוגיה, קהילות והתרמות. תמנף את עצמך. תמנף את התורה.",
};

const SERVICES = [
  {
    title: "ליווי קהילות וארגונים",
    desc: "בנייה, ניהול והתפתחות של קהילות ומוסדות — מהרעיון ועד להפעלה שוטפת.",
  },
  {
    title: "התרמות וגיוס משאבים",
    desc: "אסטרטגיה, ליווי וכלים לגיוס תרומות עבור מוסדות, עמותות ומיזמים.",
  },
  {
    title: "תורה וטכנולוגיה",
    desc: "שילוב כלי טכנולוגיה ואוטומציה בעבודת הקודש ובניהול הארגון היומיומי.",
  },
  {
    title: "הדרכה למקצועות קודש",
    desc: "שחיטה, שעטנז, ברית מילה, חברה קדישא, תפילין, סת״ם, תקיעת שופר וארבעת המינים.",
  },
  {
    title: "ייעוץ עסקי ואישי",
    desc: "ליווי אישי לבעלי תפקיד ומוסדות — קבלת החלטות, תכנון ויישום.",
  },
];

export default function IRabPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900">
      <header className="w-full border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <Image
            src="/irab/logo-irab.png"
            alt="iRab - יועץ רב תחומי"
            width={220}
            height={72}
            priority
            className="h-12 w-auto"
          />
          <a
            href="#contact"
            className="hidden sm:inline-block rounded-full bg-[#111111] px-5 py-2 text-sm font-medium text-white hover:bg-[#6ea62b] transition-colors"
          >
            צור קשר
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-neutral-50">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              יועץ רב תחומי
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-medium text-[#6ea62b]">
              תמנף את עצמך. תמנף את התורה.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              הרב יצחק ווחנון מלווה קהילות, מוסדות ובעלי תפקיד בעולם התורה —
              משילוב טכנולוגיה ואוטומציה, דרך גיוס משאבים והתרמות, ועד הדרכה
              מקצועית במקצועות הקודש.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <a
                href="#contact"
                className="rounded-full bg-[#8dc63f] px-8 py-3 text-base font-semibold text-[#111111] hover:bg-[#6ea62b] hover:text-white transition-colors"
              >
                לתיאום שיחת ייעוץ
              </a>
              <a
                href="#services"
                className="rounded-full border border-neutral-300 px-8 py-3 text-base font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
              >
                תחומי הייעוץ
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center text-[#111111]">
            תחומי ייעוץ
          </h2>
          <p className="mt-3 text-center text-neutral-600">
            עולם אחד שמחבר בין תורה, קהילה, טכנולוגיה ועשייה.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-neutral-200 p-6 hover:border-[#8dc63f] hover:shadow-sm transition-all"
              >
                <div className="mb-3 h-1.5 w-10 rounded-full bg-[#8dc63f]" />
                <h3 className="text-lg font-semibold text-[#111111]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-50">
          <div className="mx-auto max-w-5xl px-6 py-20 grid gap-10 sm:grid-cols-[auto_1fr] items-center">
            <Image
              src="/irab/logo-irab-square.png"
              alt="iRab"
              width={160}
              height={160}
              className="h-32 w-32 sm:h-40 sm:w-40 mx-auto"
            />
            <div className="text-center sm:text-right">
              <h2 className="text-2xl font-bold text-[#111111]">
                הרב יצחק ווחנון
              </h2>
              <p className="mt-3 text-neutral-600 leading-7">
                יועץ רב תחומי המלווה קהילות, מוסדות ובעלי תפקיד — ומחבר בין
                עולם התורה לכלים מודרניים של טכנולוגיה, ניהול וגיוס משאבים,
                לצד ידע מעשי במקצועות הקודש.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center text-[#111111]">
            צור קשר
          </h2>
          <p className="mt-3 text-center text-neutral-600">
            נשמח לשמוע ולתאם שיחת ייעוץ ראשונית.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <ContactForm />

            <div className="rounded-2xl bg-[#111111] text-white p-8 flex flex-col justify-center gap-4">
              <div>
                <p className="text-sm text-neutral-400">טלפון</p>
                <a
                  href="tel:+972526266419"
                  className="text-lg font-medium hover:text-[#8dc63f]"
                >
                  052-626-6419
                </a>
              </div>
              <div>
                <p className="text-sm text-neutral-400">אימייל</p>
                <a
                  href="mailto:director@irabadvice.com"
                  className="text-lg font-medium hover:text-[#8dc63f]"
                >
                  director@irabadvice.com
                </a>
              </div>
              <a
                href="https://wa.me/972526266419"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-[#8dc63f] px-6 py-3 text-center text-sm font-semibold text-[#111111] hover:bg-[#6ea62b] hover:text-white transition-colors"
              >
                וואטסאפ ישיר
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-8">
        <p className="text-center text-sm text-neutral-500">
          iRab — יועץ רב תחומי © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
