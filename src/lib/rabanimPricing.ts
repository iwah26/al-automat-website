// Round 2 early-bird deadline: 23:35 Israel time, 2026-07-21 (webinar night).
const ROUND2_EARLY_BIRD_DEADLINE = new Date("2026-07-21T20:35:00Z").getTime();

export function getRound2PriceILS(): number {
  return Date.now() < ROUND2_EARLY_BIRD_DEADLINE ? 950 : 1500;
}

export function getPriceILS(cohort: string): number {
  return cohort === "round2" ? getRound2PriceILS() : 950;
}
