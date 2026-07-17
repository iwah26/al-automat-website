import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MetaPixel } from "@/components/MetaPixel";

export const metadata = {
  title: "המקומות התמלאו | סדנת הרבנים | על אוטומט",
  description: "הסבב הנוכחי של סדנת הרבנים מלא — השאירו פרטים לסבב הבא",
};

export default function SednahRabanimRound2Page() {
  return (
    <>
      <MetaPixel />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center text-right mb-16">
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            כל המקומות בסבב הזה נתפסו 🙏
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            תודה על ההתעניינות בסדנת &quot;קלוד קוד לרבנים&quot;. הסבב הנוכחי
            מלא — אנחנו כבר עובדים על מועד נוסף.
          </p>
          <p className="text-lg text-slate-400 mt-4">
            עמוד ההרשמה לסבב הבא בבנייה — יעלה כאן בקרוב.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
