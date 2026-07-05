import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SednahRabanimIntro } from "@/components/SednahRabanimIntro";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "הרשמה לסדנת הרבנים | על אוטומט",
  description: "הרשמה לסדנת AI לרבנים — טופס רישום",
};

async function logClickIfPresent(code: string | undefined) {
  if (!code) return;
  try {
    const ua = (await headers()).get("user-agent") ?? undefined;
    await getRabanimSupabase().from("rabanim_link_clicks").insert({ code, user_agent: ua });
  } catch {
    // מעקב בלבד — לא אמור לשבור את טעינת הדף בשום מקרה
  }
}

export default async function SednahRabanimPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <SednahRabanimIntro />
      </main>
      <Footer />
    </>
  );
}
