import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ManualRegisterForm } from "@/components/ManualRegisterForm";
import { verifyVoucher } from "@/lib/manualVoucher";

export const metadata = { title: "הרשמה לסדנת Claude Code לחרדים | על אוטומט", robots: { index: false } };

export default async function ManualRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; n?: string; s?: string }>;
}) {
  const { v = "", n = "", s = "" } = await searchParams;
  const seats = Number(n);
  const ok = verifyVoucher(v, seats, s);
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        {ok ? (
          <ManualRegisterForm v={v} n={seats} s={s} />
        ) : (
          <p className="max-w-xl mx-auto text-center text-slate-300 text-lg">הקישור לא תקין.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
