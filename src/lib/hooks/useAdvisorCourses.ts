// lib/hooks/useCourses.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/supabase/client";
import {
  addCourseOffering,
  deleteCourseOffering,
} from "../queries/advisorCourses";
import { AdvisorCourseDB, UpdateCourseInput } from "@/app/types/advisor";
import { timeout } from "@/app/advisor/functions/students";

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
      return data as AdvisorCourseDB[];
    },
    enabled: !!advisorId,
  });
}

//  Add a course offering
export function useAddCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCourseOffering,
    onSuccess: () => {
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

export function useRemoveCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offerings"] });
    },
  });
}

export function useUpdateCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offeringId,
      input,
    }: {
      offeringId: string;
      input: UpdateCourseInput;
    }) => {
      const supabase = createSupabaseClient();

      // console.log(1, "before", input);

      const { error } = await Promise.race([
        supabase
          .from("course_offerings")
          .update({
            unit: input.unit,
            term_id: input.term_id,
          })
          .eq("id", offeringId),
        timeout(10000),
      ]);
      // console.log(2, "after");

      // const result = await Promise.race([query, timeout(500)]);

      if (error) throw error;
      // console.log("No error was called");

      // return updatedOffering;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offerings"] });
    },
  });
}
