import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SadnaQuickForm } from "@/components/SadnaQuickForm";
import { getPriceILS } from "@/lib/rabanimPricing";

export const metadata = {
  title: "הרשמה לסדנת Claude Code לחרדים | על אוטומט",
  description: "הרשמה לסדנה — שישי 9.10 + 16.10, 9:30–12:30, בזום",
};

export default async function SadnaFormPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <SadnaQuickForm referralCode={c} price={getPriceILS("round4")} />
      </main>
      <Footer />
    </>
  );
}
