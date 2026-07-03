export interface Chapter {
  title: string;
  seconds: number;
}

export interface Prompt {
  id: string;
  category: "למידה" | "אבחון" | "יישום" | "כלי";
  title: string;
  description: string;
  content: string;
}

export interface Session {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  slidesUrl?: string;
  summary: string;
  transcript: string;
  chapters: Chapter[];
  prompts: Prompt[];
}

export const SESSIONS: Session[] = [
  {
    id: "1",
    number: 1,
    title: "מפגש א׳",
    subtitle: "תשתית + התחלת הבנייה",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    slidesUrl: "",
    summary: "",
    transcript: "",
    chapters: [],
    prompts: [],
  },
  {
    id: "2",
    number: 2,
    title: "מפגש ב׳",
    subtitle: "גומרים, בודקים, משיקים",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    slidesUrl: "",
    summary: "",
    transcript: "",
    chapters: [],
    prompts: [],
  },
];

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}
