import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrationWizard } from "@/components/RegistrationWizard";
import { SednahRabanimIntro } from "@/components/SednahRabanimIntro";

export const metadata = {
  title: "הרשמה לסדנת הרבנים | על אוטומט",
  description: "הרשמה לסדנת AI לרבנים — טופס רישום",
};

export default function SednahRabanimPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <SednahRabanimIntro />
        <RegistrationWizard />
      </main>
      <Footer />
    </>
  );
}
