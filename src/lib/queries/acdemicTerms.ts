import { createSupabaseClient } from "../supabase/client";

export async function fetchAcademicTerms() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .lt("admission_year", new Date().getFullYear() + 1)
    .gt("admission_year", new Date().getFullYear() - 10)
    .order("admission_year", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function fetchActiveAcademicTerm() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) throw error;

  return data;
}
