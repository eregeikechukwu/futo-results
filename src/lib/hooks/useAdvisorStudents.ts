import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advisorDashboardKeys, gcTimeUni, staleTimeUni } from "./utils";
import {
  fetchAdvisorStudents,
  uploadPreregistrations,
} from "../queries/advisorStudents";
import { createSupabaseClient } from "../supabase/client";
import { errorThrowHandler } from "@/helpers/errorHandler";
import { StudentStatus } from "@/utils/systemUtils";

// Upload students to students_preregistration from advisor Google Form
export function useUploadAdvisorStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPreregistrations,

    onSuccess: () => {
      // Invalidate dashboard data
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "stats", "students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
}

export function useFetchStudentsStats(
  admissionYear: number,
  departmentId: string,
  advisorId: string,
) {
  return useQuery({
    queryKey: advisorDashboardKeys.students(),
    queryFn: () => fetchAdvisorStudents(admissionYear, departmentId, advisorId),
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: true,
    enabled: !!advisorId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff, increase the delay between retries by 1000 up till attempIndex
  });
}

// Update student status (advisor action)
export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      status,
    }: {
      studentId: string;
      status: string;
    }) => {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("students")
        .update({ status })
        .eq("id", studentId);
      if (error) errorThrowHandler(error);
    },
    onSuccess: () => {
      // Invalidate students cache — triggers automatic refetch
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["advisor", "dashboard"] });
    },
  });
}

export function useDeleteStudentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      status,
    }: {
      studentId: string;
      status: StudentStatus;
    }) => {
      const supabase = createSupabaseClient();

      if (status === "verified" || status === "flagged") {
        const { error } = await supabase.rpc("soft_delete_student", {
          student_id: studentId,
        });
        if (error) errorThrowHandler(error);
      } else {
        const { error } = await supabase.rpc("delete_preregistration", {
          prereg_id: studentId,
        });
        if (error) errorThrowHandler(error);
      }
    },
    onSuccess: () => {
      // Invalidate students cache — triggers automatic refetch
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["advisor", "dashboard"] });
    },
  });
}
