import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "תשלום | סדנת הרבנים",
};

export default function TashlumPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-black text-white mb-4">
            תודה! הפרטים התקבלו
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            עוד רגע נעביר אותך לדף התשלום...
          </p>
          {/* כאן תחובר סליקה */}
          <div className="px-6 py-8 rounded-2xl bg-brand-card border border-brand-accent/30 text-slate-400">
            דף סליקה — יחובר בקרוב
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
