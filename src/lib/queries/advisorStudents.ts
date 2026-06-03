import { createSupabaseClient } from "../supabase/client";
import { NormalizedStudentsData } from "@/app/types/utils";
import { AdvisorStudent } from "@/app/types/advisor";
import { timeout } from "@/app/advisor/functions/students";

export async function uploadPreregistrations(
  newStudentsList: NormalizedStudentsData[],
) {
  const supabase = createSupabaseClient();

  const { data: uploaded, error } = await Promise.race([
    supabase.from("student_preregistrations").upsert(newStudentsList, {
      onConflict: "reg_number",
      ignoreDuplicates: true,
    }),
    timeout(5000),
  ]);
  if (error) throw error;

  return;
}

export async function fetchAdvisorStudents(
  admissionYear: number,
  departmentId: string,
  advisorId: string,
) {
  const supabase = createSupabaseClient();

  console.log(departmentId);

  // Fetch advsr students data,  from the students data
  const { data: studentsFromData, error: errorFromStudents } =
    await Promise.race([
      supabase
        .from("students")
        .select(
          "id, profile_id, reg_number, join_date, admission_year, status, profiles!students_profile_id_fkey (full_name, email)",
        )
        .order("reg_number", { ascending: true })
        .eq("admission_year", admissionYear)
        .eq("department_id", departmentId)
        .is("deleted_at", null),
      timeout(5000),
    ]);

  const { data: studentsFromPrereg, error: errorFromPrereg } =
    await Promise.race([
      supabase
        .from("student_preregistrations")
        .select("id, reg_number, admission_year, email, claimed")
        .eq("claimed", false)
        .order("reg_number", { ascending: true })
        .eq("created_by", advisorId),
      timeout(5000),
    ]);

  if (errorFromPrereg) throw errorFromPrereg;
  if (errorFromStudents) throw errorFromStudents;

  const studentsRaw = [...studentsFromData, ...studentsFromPrereg];
  console.log(studentsRaw, "   --  STudents rsaw");

  const students = studentsRaw.map((student) => {
    if (student.claimed == null) {
      return {
        id: student.id,
        email: student.profiles.email,
        name: student.profiles.full_name,
        regNumber: student.reg_number,
        status: student.status,
        joinDate: student.join_date,
      };
    } else {
      return {
        id: student.id,
        email: student.email,
        name: "Unregistered Student",
        regNumber: student.reg_number,
        status: "pending",
        joinDate: "Unregistered student",
      };
    }
  });

  return students as AdvisorStudent[];
}

// Mutating students status
// export async function setStudentStatus() {}\
