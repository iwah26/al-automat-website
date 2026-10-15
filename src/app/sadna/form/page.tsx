import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SadnaQuickForm } from "@/components/SadnaQuickForm";
import { getPriceILS } from "@/lib/rabanimPricing";

export const metadata = {
  title: "הרשמה לסדנת Claude Code לחרדים | על אוטומט",
  description: "הרשמה לסדנה — שלישי 20.10 + 27.10, 16:00–19:00, בזום",
};

export default async function SadnaFormPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; t?: string }>;
}) {
  const { c, t } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <SadnaQuickForm referralCode={c} price={getPriceILS("round4")} testCode={t} />
      </main>
      <Footer />
    </>
  );
}
