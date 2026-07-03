import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "ההרשמה התקבלה | על אוטומט",
};

export default function SednahRabanimSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-black text-white mb-4">
            התשלום התקבל, ברוך הבא לסדנה! 🎉
          </h1>
          <p className="text-slate-300 text-lg">
            תוך כמה רגעים תקבל הודעת אישור בוואטסאפ עם כל הפרטים — כולל הגישה
            להקלטות ולינק הזום.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
