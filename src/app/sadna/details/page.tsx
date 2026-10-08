import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrationWizard } from "@/components/RegistrationWizard";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { verifyRegistrationSignature } from "@/lib/morning";

export const metadata = {
  title: "השלמת פרטים — סדנת Claude Code לחרדים | על אוטומט",
  robots: { index: false },
};

// לכאן מורנינג מחזיר אחרי תשלום (successUrl), ואותו קישור נשלח גם בוואטסאפ האישור.
export default async function SadnaDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string; sig?: string }>;
}) {
  const { rid = "", sig = "" } = await searchParams;
  const valid = rid && sig && verifyRegistrationSignature(rid, sig);
  const { data: reg } = valid
    ? await getRabanimSupabase()
        .from("rabanim_registrations")
        .select("id, first_name, last_name, phone, email")
        .eq("id", rid)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        {reg ? (
          <RegistrationWizard
            cohort="round4"
            details={{
              rid,
              sig,
              firstName: reg.first_name,
              lastName: reg.last_name,
              phone: reg.phone,
              email: reg.email,
            }}
          />
        ) : (
          <div className="max-w-xl mx-auto text-center text-slate-300 text-lg">
            הקישור לא תקין. אפשר להשתמש בקישור שנשלח אליך בוואטסאפ אחרי התשלום.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
