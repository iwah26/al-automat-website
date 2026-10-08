// Round 2 early-bird deadline: 23:35 Israel time, 2026-07-21 (webinar night).
const ROUND2_EARLY_BIRD_DEADLINE = new Date("2026-07-21T20:35:00Z").getTime();

export function getRound2PriceILS(): number {
  return Date.now() < ROUND2_EARLY_BIRD_DEADLINE ? 950 : 1500;
}

export function getPriceILS(cohort: string): number {
  if (cohort === "round2") return getRound2PriceILS();
  if (cohort === "round4") return 800; // מחזור ד׳ — חרדים עובדים (החלטת יצחק 8.10)
  return 950;
}

// נתיב טופס ההרשמה לכל מחזור — לחזרה מ-PayPal אחרי ביטול
export const COHORT_FORM_PATH: Record<string, string> = {
  round1: "/sednah-rabanim/form",
  round2: "/sednah-rabanim-round2/form",
  round4: "/sadna/form",
};
