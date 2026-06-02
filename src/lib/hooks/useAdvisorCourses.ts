// lib/hooks/useCourses.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/supabase/client";
import { addCourseOffering } from "../queries/courseOfferings";

// ── Fetch all offerings for an advisor in a specific term ──
export function useAdvisorOfferings(advisorId: string) {
  return useQuery({
    queryKey: ["offerings", advisorId],
    queryFn: async () => {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from("course_offerings")
        .select(
          `
          id,
          unit,
          courses!inner ( id, course_code, course_title ),
          academic_terms!inner ( id, session, semester, admission_year )
        `,
        )
        .eq("advisor_id", advisorId)
        .order("courses(course_code)");
      // .eq("term_id", termId)

      if (error) throw error;
      return data;
    },
    enabled: !!advisorId,
  });
}

//  Add a course offering
export function useAddCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCourseOffering,
    onSuccess: (data) => {
      // Invalidate the offerings list for this advisor + term
      queryClient.invalidateQueries({
        queryKey: ["offerings"],
      });
    },
    onError: (error: Error) => {
      // Error is already a friendly message from the query function
      throw new Error(error.message);
    },
  });
}

// ── Remove a course offering ──
export function useRemoveCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offeringId: string) => {
      const supabase = createSupabaseClient();

      const { error } = await supabase
        .from("course_offerings")
        .delete()
        .eq("id", offeringId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offerings"] });
    },
  });
}
