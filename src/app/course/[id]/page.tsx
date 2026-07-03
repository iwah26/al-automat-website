import { notFound } from "next/navigation";
import { SessionPage } from "@/components/SessionPage";
import { SESSIONS, getSession } from "@/data/sessions";
import { getSessionVideo } from "@/lib/videoStore";

export function generateStaticParams() {
  return SESSIONS.map((s) => ({ id: s.id }));
}

export const revalidate = 60; // רענון כל דקה

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return {};
  return {
    title: `${session.title} — ${session.subtitle} | על אוטומט`,
    robots: { index: false },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  // מנסה לקחת video ID מ-KV (עולה אוטומטית מה-webhook של Bunny)
  const videoData = await getSessionVideo(id);

  const sessionWithVideo = {
    ...session,
    bunnyLibraryId: videoData?.libraryId || session.bunnyLibraryId,
    bunnyVideoId: videoData?.videoId || session.bunnyVideoId,
  };

  return <SessionPage session={sessionWithVideo} />;
}
