import { createSupabaseClient } from "../supabase/client";
import {
  AdvisorOfficeHour,
  AdvisorOfficeHoursOverride,
  AdvisorVisitIntent,
  StudentAdvisor,
  AdvisorVisitIntentStatus,
} from "@/app/types/officeHours";

// Fetch all recurring office hours for an advisor
export async function fetchAdvisorOfficeHours(advisorId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours")
    .select(
      "id, advisor_id, day_of_week, start_time, end_time, location, note, is_active, created_at",
    )
    .eq("advisor_id", advisorId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdvisorOfficeHour[];
}

// Fetch upcoming overrides for an advisor
export async function fetchAdvisorOfficeHoursOverrides(advisorId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours_override")
    .select(
      "id, advisor_id, date, start_time, end_time, is_cancelled, location, note, created_at",
    )
    .eq("advisor_id", advisorId)
    .gte("date", new Date().toISOString().split("T")[0]) // future dates only
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdvisorOfficeHoursOverride[];
}

// Fetch visit intents for advisor with student + profile data
// Fix: use explicit FK hint for profiles join via students
export async function fetchAdvisorVisitIntents(advisorId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_visit_intents")
    .select(
      `
      id,
      advisor_id,
      student_id,
      preferred_date,
      reason,
      status,
      advisor_note,
      created_at,
      students!advisor_visit_intents_student_id_fkey (
        id,
        reg_number,
        profiles!students_profile_id_fkey ( full_name, email )
      )
    `,
    )
    .eq("advisor_id", advisorId)
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdvisorVisitIntent[];
}

// Fetch the advisor for a specific student set
// Fix: cannot filter on joined table columns with .eq() in PostgREST
// Instead fetch by advisor_id from advisor_assignments directly
export async function fetchStudentAdvisor(
  departmentId: string,
  admissionYear: number,
) {
  const supabase = createSupabaseClient();

  // Step 1: find the advisor_id for this department + admission_year
  const { data: assignment, error: assignmentError } = await supabase
    .from("advisor_assignments")
    .select("advisor_id")
    .eq("department_id", departmentId)
    .eq("admission_year", admissionYear)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) return null;

  if (assignment?.advisor_id === null) {
    alert("No advisor assigned for this department and admission year.");
    return null;
  } else {
    console.log("assignment.advisor_id:", assignment.advisor_id);
  }

  // Step 2: fetch the advisor with their profile
  const { data, error } = await supabase
    .from("advisors")
    .select(
      `
      id,
      title,
      profiles!advisors_profile_id_fkey ( full_name, email ),
      advisor_assignments (
        id,
        admission_year,
        department_id,
        departments!advisor_assignments_department_id_fkey ( id, name, code )
      )
    `,
    )
    .eq("id", assignment.advisor_id)
    .maybeSingle();

  if (data.title === null) {
    alert("No advisor title found for this department and admission year.");
    return null;
  } else {
    console.log("data:", data);
  }

  if (error) throw error;
  return data as StudentAdvisor | null;
}

// Fetch a student's own visit intents with advisor info
// Fix: explicit FK hints on both joins
export async function fetchStudentVisitIntents(studentId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_visit_intents")
    .select(
      `
      id,
      advisor_id,
      student_id,
      preferred_date,
      reason,
      status,
      advisor_note,
      created_at,
      advisors!advisor_visit_intents_advisor_id_fkey (
        title,
        profiles!advisors_profile_id_fkey ( full_name, email )
      )
    `,
    )
    .eq("student_id", studentId)
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdvisorVisitIntent[];
}

// Create a recurring office hour window
export async function createAdvisorOfficeHour(input: {
  advisor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location?: string | null;
  note?: string | null;
  is_active?: boolean;
}) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorOfficeHour;
}

// Create a one-time override (extra session or cancellation)
export async function createAdvisorOfficeHoursOverride(input: {
  advisor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  note?: string | null;
  is_cancelled?: boolean;
}) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours_override")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorOfficeHoursOverride;
}

// Student submits a visit intent
export async function createAdvisorVisitIntent(input: {
  advisor_id: string;
  student_id: string;
  preferred_date: string;
  reason: string;
}) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_visit_intents")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorVisitIntent;
}

export async function resolveVisitIntent(intentId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("advisor_visit_intents")
    .delete()
    .eq("id", intentId);

  if (error) throw error;
}

export async function acknowledgeVisitIntent(
  intentId: string,
  advisorNote?: string | null,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_visit_intents")
    .update({ status: "acknowledged", advisor_note: advisorNote ?? null })
    .eq("id", intentId)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorVisitIntent;
}

// Toggle a recurring office hour window active/inactive
export async function updateAdvisorOfficeHourActive(
  hourId: string,
  isActive: boolean,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours")
    .update({ is_active: isActive })
    .eq("id", hourId)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorOfficeHour;
}

// Toggle a cancellation override
export async function updateAdvisorOfficeHoursOverrideCancel(
  overrideId: string,
  isCancelled: boolean,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("advisor_office_hours_override")
    .update({ is_cancelled: isCancelled })
    .eq("id", overrideId)
    .select()
    .single();

  if (error) throw error;
  return data as AdvisorOfficeHoursOverride;
}

// Delete a recurring office hour window
export async function deleteAdvisorOfficeHour(hourId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("advisor_office_hours")
    .delete()
    .eq("id", hourId);

  if (error) throw error;
}

// Delete a one-time override
export async function deleteAdvisorOfficeHoursOverride(overrideId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("advisor_office_hours_override")
    .delete()
    .eq("id", overrideId);

  if (error) throw error;
}

// Student cancels a pending visit intent
export async function deleteAdvisorVisitIntent(intentId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("advisor_visit_intents")
    .delete()
    .eq("id", intentId);

  if (error) throw error;
}
