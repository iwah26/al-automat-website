import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrationWizard } from "@/components/RegistrationWizard";

export const metadata = {
  title: "הרשמה לסדנת AI כמו מקצוען | על אוטומט",
  description: "הרשמה לסדנה — שישי 9.10 + 16.10, טופס רישום",
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
        <RegistrationWizard referralCode={c} cohort="round4" />
      </main>
      <Footer />
    </>
  );
}
