import { createSupabaseClient } from "../supabase/client";

export async function fetchDepartments() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from("departments").select("*");

  if (error) throw error;
  return data;
}
