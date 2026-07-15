import type { SupabaseClient } from "@supabase/supabase-js";

export const MASHOV_HOMEWORK_NUMBER = 2;
export const TABLE_SEP = "|||";

export async function buildMashovItems(supabase: SupabaseClient, homeworkId: string) {
  const { data, error } = await supabase
    .from("mashov_responses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((r) => ({
    id: `mashov-${r.id}`,
    homework_id: homeworkId,
    text: [
      r.respondent_name,
      r.q1_strengths ?? "",
      r.q2_weaknesses ?? "",
      r.q3_fears ?? "",
      r.q4_change ?? "",
      r.q5_role ?? "",
    ].join(TABLE_SEP),
    done: true,
    created_at: r.created_at,
  }));
}
