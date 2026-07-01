import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdvisorOfficeHour,
  createAdvisorOfficeHoursOverride,
  createAdvisorVisitIntent,
  fetchAdvisorOfficeHours,
  fetchAdvisorOfficeHoursOverrides,
  fetchAdvisorVisitIntents,
  fetchStudentAdvisor,
  fetchStudentVisitIntents,
  updateAdvisorOfficeHourActive,
  updateAdvisorOfficeHoursOverrideCancel,
  updateAdvisorVisitIntentStatus,
} from "../queries/officeHours";
import { gcTimeUni, staleTimeUni } from "./utils";
import { errorToastHandler } from "@/helpers/errorHandler";
import { AdvisorVisitIntentStatus } from "@/app/types/officeHours";

export function useAdvisorOfficeHours(advisorId: string) {
  return useQuery({
    queryKey: ["advisor-office-hours", advisorId],
    queryFn: () => fetchAdvisorOfficeHours(advisorId),
    enabled: !!advisorId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useAdvisorOfficeHoursOverrides(advisorId: string) {
  return useQuery({
    queryKey: ["advisor-office-hours-overrides", advisorId],
    queryFn: () => fetchAdvisorOfficeHoursOverrides(advisorId),
    enabled: !!advisorId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

export function useAdvisorVisitIntents(advisorId: string) {
  return useQuery({
    queryKey: ["advisor-visit-intents", advisorId],
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
    queryKey: ["student-visit-intents", studentId],
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
      queryClient.invalidateQueries({ queryKey: ["advisor-office-hours"] });
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
        queryKey: ["advisor-office-hours-overrides"],
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
      queryClient.invalidateQueries({ queryKey: ["student-visit-intents"] });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to submit visit request.");
      throw error;
    },
  });
}

export function useUpdateAdvisorVisitIntentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      intentId,
      status,
      advisorNote,
    }: {
      intentId: string;
      status: AdvisorVisitIntentStatus;
      advisorNote: string | null;
    }) => {
      return updateAdvisorVisitIntentStatus(intentId, status, advisorNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-visit-intents"] });
      queryClient.invalidateQueries({ queryKey: ["student-visit-intents"] });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to update visit status.");
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
    }: {
      hourId: string;
      isActive: boolean;
    }) => {
      return updateAdvisorOfficeHourActive(hourId, isActive);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advisor-office-hours", variables[0]],
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
        queryKey: ["advisor-office-hours-overrides", variables[0]],
      });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to update override status.");
      throw error;
    },
  });
}
