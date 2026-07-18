import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WebinarRegisterForm } from "@/components/WebinarRegisterForm";

export const metadata = {
  title: 'הרשמה לוובינר "קלוד קוד לרבנים" | על אוטומט',
  description: "הרשמה לוובינר הפתוח והחינמי - שלישי 21.7, 21:00",
};

export default async function WebinarPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-2xl text-white font-bold mb-2">שלום לך הרב!</p>
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            וובינר חינם: איך בינה מלאכותית בונה לך את הקהילה
          </h1>
          <div className="inline-block p-5 rounded-2xl bg-brand-card border border-brand-accent/20 text-right mb-10">
            <p className="font-semibold text-white mb-2">📅 שלישי 21.7, 21:00 שעון ישראל</p>
            <ul className="space-y-1 text-slate-300">
              <li>🇬🇧 אנגליה — 19:00</li>
              <li>🇪🇸🇫🇷 ספרד/צרפת — 20:00</li>
              <li>🇦🇷 ארגנטינה — 15:00</li>
              <li>🇺🇸🇻🇪 ארה&quot;ב (מזרח)/ונצואלה — 14:00</li>
              <li>🇲🇽 מקסיקו — 12:00</li>
            </ul>
          </div>
        </div>
        <WebinarRegisterForm referralCode={c} />
      </main>
      <Footer />
    </>
  );
}
