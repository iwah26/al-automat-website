import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = { title: "התשלום התקבל | על אוטומט", robots: { index: false } };

export default function GroupPayThanksPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-white mb-4">התשלום התקבל, תודה!</h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            הקבלה על שם העסק נשלחת למייל שלך.
            <br />
            כל אחד מהלומדים יקבל עכשיו בוואטסאפ ובמייל את כל הפרטים: קישור הזום, סיסמה לאתר ההקלטות וקישור לקבוצה.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
