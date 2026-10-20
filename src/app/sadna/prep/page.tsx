import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TodahContent } from "@/components/TodahContent";

export const metadata = {
  title: "הכנה לסדנת Claude Code לחרדים — התוכנות להתקנה | על אוטומט",
  robots: { index: false },
};

// דף ההכנה הקבוע של מחזור ד׳ — אותו צ׳קליסט כמו אחרי התשלום, לשליחה בקבוצה
export default function SadnaPrepPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <TodahContent cohort="round4" />
      </main>
      <Footer />
    </>
  );
}
