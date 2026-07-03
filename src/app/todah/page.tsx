import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TodahContent } from "@/components/TodahContent";

export const metadata = {
  title: "תודה על ההרשמה | סדנת הרבנים",
  robots: { index: false },
};

export default function TodahPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <TodahContent />
      </main>
      <Footer />
    </>
  );
}
