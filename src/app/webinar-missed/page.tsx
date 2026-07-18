import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "פספסת את הוובינר | על אוטומט",
  description: "פספסת את הוובינר? עדיין אפשר להירשם לסדנה",
};

export default function WebinarMissedPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center text-right mb-16">
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            טוב, חבל, פספסת את הזום 🙏
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-10">
            אבל ממש לא נורא — אתה עדיין יכול להירשם ישירות לסדנה עצמה,
            &quot;קלוד קוד לרבנים&quot;, ולקבל את כל התוכן במפגשים חיים.
          </p>
          <Link
            href="/sednah-rabanim-round2"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            להרשמה לסדנה ←
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
