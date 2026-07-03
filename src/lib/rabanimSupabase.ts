import { createClient } from "@supabase/supabase-js";

export function getRabanimSupabase() {
  const url = process.env.RABANIM_SUPABASE_URL;
  const key = process.env.RABANIM_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Rabanim Supabase env vars missing");
  return createClient(url, key);
}
