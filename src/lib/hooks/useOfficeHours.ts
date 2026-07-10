import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acknowledgeVisitIntent,
  createAdvisorOfficeHour,
  createAdvisorOfficeHoursOverride,
  createAdvisorVisitIntent,
  deleteAdvisorOfficeHour,
  deleteAdvisorOfficeHoursOverride,
  fetchAdvisorOfficeHours,
  fetchAdvisorOfficeHoursOverrides,
  fetchAdvisorVisitIntents,
  fetchStudentAdvisor,
  fetchStudentVisitIntents,
  resolveVisitIntent,
  updateAdvisorOfficeHourActive,
  updateAdvisorOfficeHoursOverrideCancel,
} from "../queries/officeHours";
import { gcTimeUni, staleTimeUni } from "./utils";
import { errorToastHandler } from "@/helpers/errorHandler";
import {
  AdvisorOfficeHour,
  AdvisorOfficeHoursOverride,
  AdvisorVisitIntent,
  AdvisorVisitIntentStatus,
} from "@/app/types/officeHours";
import { toast } from "react-hot-toast";

const advisorHoursqueryKeys = {
  hours: "advisor-office-hours",
  override: "advisor-office-hours-overrides",
  studentsIntents: "student-visit-intents",
  advisorIntents: "advisor-visit-intents",
};

export function useAdvisorOfficeHours(advisorId: string) {
  return useQuery({
    queryKey: [advisorHoursqueryKeys.hours, advisorId],
    queryFn: () => fetchAdvisorOfficeHours(advisorId),
    enabled: !!advisorId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useAdvisorOfficeHoursOverrides(advisorId: string) {
  return useQuery({
    queryKey: [advisorHoursqueryKeys.override, advisorId],
    queryFn: () => fetchAdvisorOfficeHoursOverrides(advisorId),
    enabled: !!advisorId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useAdvisorVisitIntents(advisorId: string) {
  return useQuery({
    queryKey: [advisorHoursqueryKeys.advisorIntents, advisorId],
    queryFn: () => fetchAdvisorVisitIntents(advisorId),
    enabled: !!advisorId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useStudentAdvisor(departmentId: string, admissionYear: number) {
  return useQuery({
    queryKey: ["student-advisor", departmentId, admissionYear],
    queryFn: () => fetchStudentAdvisor(departmentId, admissionYear),
    enabled: !!departmentId && !!admissionYear,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useStudentVisitIntents(studentId: string) {
  return useQuery({
    queryKey: [advisorHoursqueryKeys.studentsIntents, studentId],
    queryFn: () => fetchStudentVisitIntents(studentId),
    enabled: !!studentId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAdvisorOfficeHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvisorOfficeHour,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.hours],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to save weekly office hour.");
      throw error;
    },
  });
}

export function useCreateAdvisorOfficeHoursOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvisorOfficeHoursOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.override],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to save special date override.");
      throw error;
    },
  });
}

export function useCreateAdvisorVisitIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvisorVisitIntent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.studentsIntents],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to submit visit request.");
      throw error;
    },
  });
}

export function useResolveAdvisorVisitIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ intentId }: { intentId: string }) => {
      return resolveVisitIntent(intentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-visit-intents"] });
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.studentsIntents],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to resolve visit intent.");
      throw error;
    },
  });
}

export function useAcknowledgeAdvisorVisitIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      intentId,
      advisorNote,
    }: {
      intentId: string;
      advisorNote: string | null;
    }) => {
      return acknowledgeVisitIntent(intentId, advisorNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-visit-intents"] });
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.studentsIntents],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to acknowledge student visit intent.");
      throw error;
    },
  });
}

export function useToggleAdvisorOfficeHourActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hourId,
      isActive,
      advisorId,
    }: {
      hourId: string;
      isActive: boolean;
      advisorId: string;
    }) => {
      return updateAdvisorOfficeHourActive(hourId, isActive);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.hours, variables.advisorId],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to update office hour status.");
      throw error;
    },
  });
}

export function useToggleAdvisorOfficeHoursOverrideCancel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      isCancelled,
    }: {
      overrideId: string;
      isCancelled: boolean;
    }) => {
      return updateAdvisorOfficeHoursOverrideCancel(overrideId, isCancelled);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.override],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to update override status.");
      throw error;
    },
  });
}

export function useDeleteAdvisorOfficeHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hourId,
      advisorId,
    }: {
      hourId: string;
      advisorId: string;
    }) => {
      return deleteAdvisorOfficeHour(hourId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.hours, variables.advisorId],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to delete office hour");
    },
  });
}

export function useDeleteAdvisorOfficeHourOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      advisorId,
    }: {
      overrideId: string;
      advisorId: string;
    }) => {
      return deleteAdvisorOfficeHoursOverride(overrideId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.override, variables.advisorId],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to delete office hour override.");
    },
  });
}

export function useDeleteAdvisorIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      intentId,
      studentId,
    }: {
      intentId: string;
      studentId: string;
    }) => {
      return deleteAdvisorOfficeHoursOverride(intentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [advisorHoursqueryKeys.studentsIntents, variables.studentId],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to delete visit intent.");
    },
  });
}
