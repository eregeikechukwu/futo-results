import { createSupabaseClient } from "@/lib/supabase/client";
import type { StudentResultEntry } from "@/utils/studentResults";

export async function fetchStudentResults(
  studentId: string,
): Promise<StudentResultEntry[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("result_entries")
    .select(
      `
      id,
      test_score,
      lab_score,
      exam_score,
      total_score,
      grade,
      remark,
      batch_id,
      result_batches!inner (
        id,
        status,
        published_at,
        offering_id,
        course_offerings!inner (
          id,
          unit,
          courses!inner (
            id,
            course_code,
            course_title
          ),
          academic_terms!inner (
            id,
            session,
            semester,
            admission_year
          )
        )
      )
    `,
    )
    .eq("student_id", studentId);
  // .eq("result_batches.status", "published");

  if (error) throw error;
  return data ?? [];
}
