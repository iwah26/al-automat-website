import { notFound } from "next/navigation";
import { SessionPage } from "@/components/SessionPage";
import { SESSIONS_ROUND4, getSessionRound4 } from "@/data/sessionsRound4";
import { getSessionVideo } from "@/lib/videoStore";

export function generateStaticParams() {
  return SESSIONS_ROUND4.map((s) => ({ id: s.id }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSessionRound4(id);
  if (!session) return {};
  return { title: `${session.title} — ${session.subtitle} | על אוטומט`, robots: { index: false } };
}

export default async function SadnaCourseSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSessionRound4(id);
  if (!session) notFound();

  // הסרטון מגיע מה-webhook של באני (וידאו בשם "r4-1" / "r4-2")
  const videoData = await getSessionVideo(id);
  return (
    <SessionPage
      session={{
        ...session,
        bunnyLibraryId: videoData?.libraryId || session.bunnyLibraryId,
        bunnyVideoId: videoData?.videoId || session.bunnyVideoId,
      }}
    />
  );
}
