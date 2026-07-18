import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrationWizard } from "@/components/RegistrationWizard";

export const metadata = {
  title: "הרשמה לסדנת הרבנים - מחזור ב' | על אוטומט",
  description: "הרשמה לסדנת AI לרבנים — מחזור ב', טופס רישום",
};

export default async function SednahRabanimRound2FormPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <RegistrationWizard referralCode={c} cohort="round2" />
      </main>
      <Footer />
    </>
  );
}
