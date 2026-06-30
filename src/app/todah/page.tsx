import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "תודה על ההרשמה | סדנת הרבנים",
  robots: { index: false },
};

export default function TodahPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4">
            ברוך הבא לסדנה!
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            ההרשמה התקבלה בהצלחה. נחזור אליך בקרוב עם כל הפרטים.
          </p>
          {/* פרטים נוספים יתווספו כאן */}
        </div>
      </main>
      <Footer />
    </>
  );
}
