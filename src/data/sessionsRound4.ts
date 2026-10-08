import type { Session } from "@/data/sessions";

// אתר ההקלטות של מחזור ד׳ (חרדים עובדים) — נפרד מאתר הרבנים (/course).
// הסרטון מתחבר אוטומטית: מעלים לבאני וידאו בשם "r4-1" / "r4-2" (webhook → videoStore).
export const SESSIONS_ROUND4: Session[] = [
  {
    id: "r4-1",
    number: 1,
    title: "מפגש א׳",
    subtitle: "שישי 9.10 · תשתית ומתחילים לבנות",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    summary: "ההקלטה תעלה לכאן אחרי המפגש.",
    transcript: "",
    chapters: [],
    prompts: [],
  },
  {
    id: "r4-2",
    number: 2,
    title: "מפגש ב׳",
    subtitle: "שישי 16.10 · גומרים, משפרים, משיקים",
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
