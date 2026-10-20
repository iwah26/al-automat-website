import type { Session, Prompt } from "@/data/sessions";
import session1 from "@/data/session-r4-1.json";

// אתר ההקלטות של מחזור ד׳ (חרדים עובדים) — נפרד מאתר הרבנים (/course).
// הסרטון מתחבר אוטומטית: מעלים לבאני וידאו בשם "r4-1" / "r4-2" (webhook → videoStore).
export const SESSIONS_ROUND4: Session[] = [
  {
    id: "r4-1",
    number: 1,
    title: "מפגש א׳",
    subtitle: "שלישי 20.10 · תשתית ומתחילים לבנות",
    bunnyLibraryId: "695009",
    bunnyVideoId: "088ec309-fc84-4211-884f-5511caa81eca",
    // סיכום, פרקים, תמלול ופרומפטים — מתמלול פיירפליז של ההקלטה המלאה (01M5DCCH1VACX41ZFFEN9RY66E)
    summary: session1.summary,
    transcript: session1.transcript,
    chapters: session1.chapters,
    prompts: session1.prompts as Prompt[],
  },
  {
    id: "r4-2",
    number: 2,
    title: "מפגש ב׳",
    subtitle: "שלישי 27.10 · גומרים, משפרים, משיקים",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    summary: "ההקלטה תעלה לכאן אחרי המפגש.",
    transcript: "",
    chapters: [],
    prompts: [],
  },
];

export function getSessionRound4(id: string) {
  return SESSIONS_ROUND4.find((s) => s.id === id);
}
