import { createSupabaseClient } from "../supabase/client";

// Fetch all advisors students list
export async function fetchAdvisorStudentList(
  departmentId: string,
  admissionYear: number,
) {
  const supabase = createSupabaseClient();

  // Pending students (unclaimed preregistrations)
  const { data: pending, error: pendingError } = await supabase
    .from("students_preregistrations")
    .select("id, reg_number, email, created_at")
    .eq("department_id", departmentId)
    .eq("admission_year", admissionYear)
    .eq("claimed", false)
    .order("created_at", { ascending: false });

  if (pendingError) throw pendingError;

  const { data: active, error: activeError } = await supabase
    .from("students")
    .select(
      "id, reg_number, status, admission_year, profiles!inner (full_name, email)",
    )
    .eq("admission_year", admissionYear)
    .eq("departments.id", departmentId)
    .order("reg_number", { ascending: true });

  if (activeError) throw activeError;

  //   Merge into one list with a derived status field
  const pendingList = (pending ?? []).map((p) => ({
    id: p.id,
    reg_number: p.reg_number,
    email: p.email,
    full_name: null,
    status: "pending" as const,
    source: "preregistration" as const,
  }));

  const activeList = (active ?? []).map((s) => ({
    id: s.id,
    reg_number: s.reg_number,
    email: s.profiles.email,
    full_name: s.profiles.full_name,
    status: s.status as "verified" | "flagged",
    source: "students" as const,
  }));

  return [...pendingList, ...activeList];
}

// Fetch one student by Id
export async function fetchStudentById(studentId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      `
    id, reg_number, admission_year, status, profiles!inner ( full_name, email ), departments!inner ( name, code )'
  `,
    )
    .eq("id", studentId)
    .single();

  if (error) throw error;

  return data;
}

// Fetch student's own profile (used on Dashboard and Profile page)
export async function fetchMyStudentProfile(profileId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      "id, reg_number, admission_year, status, profiles!inner ( full_name, email ), departments!inner ( name, code )",
    )
    .eq("id", profileId)
    .single();

  if (error) throw error;
  return data;
}
