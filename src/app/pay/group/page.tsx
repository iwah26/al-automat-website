import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GroupPayForm } from "@/components/GroupPayForm";
import { groupPayCode } from "@/lib/morning";

export const metadata = { title: "שיעור בנושא המקוואות — תשלום | על אוטומט", robots: { index: false } };

// קישור פרטי — נפתח רק עם הקוד (k) שנגזר מהסוד
export default async function GroupPayPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k = "" } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        {k === groupPayCode() ? (
          <GroupPayForm k={k} />
        ) : (
          <p className="max-w-xl mx-auto text-center text-slate-300 text-lg">הקישור לא תקין.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
