import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — never expose to browser
);

export async function claimNextJob() {
  // ckaim one pending job atomix=cally; no other worker can grab the same row.
  //   FOR UODATE SKIP LOCKED is the correct approach fir a Postgres job queue.
  const { data, error } = await supabase.rpc("claim_ocr_job");
  if (error) throw error;
  return data; //Returns the jo row, or null if nothing is pending
}
