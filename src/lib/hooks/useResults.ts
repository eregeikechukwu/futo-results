import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCourseOfferingsForTerm,
  fetchResultsForOffering,
  fetchBatchForOffering,
  updateResultEntry,
  deleteResultEntry,
  publishBatch,
  publishAllDraftBatches,
} from "../queries/results";
import { gcTimeUni, staleTimeUni } from "./utils";
import { errorToastHandler } from "@/helpers/errorHandler";
import toast from "react-hot-toast";

/**
 * Fetch course offerings for advisor in a specific academic term
 * Automatically includes batch status information
 */
export function useCourseOfferingsForTerm(advisorId: string, termId: string) {
  return useQuery({
    queryKey: ["offerings", advisorId, termId],
    queryFn: () => fetchCourseOfferingsForTerm(advisorId, termId),
    enabled: !!advisorId && !!termId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch all result entries for a specific course offering
 * Includes student info and batch metadata
 * Used to populate the results table
 */
export function useResultsForOffering(offeringId: string) {
  return useQuery({
    queryKey: ["results", offeringId],
    queryFn: () => fetchResultsForOffering(offeringId),
    enabled: !!offeringId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch batch metadata for a course offering
 * Used to display batch status and publish button
 */
export function useBatchForOffering(offeringId: string) {
  return useQuery({
    queryKey: ["batches", offeringId],
    queryFn: () => fetchBatchForOffering(offeringId),
    enabled: !!offeringId,
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: false,
  });
}

/**
 * Mutation to update a result entry's scores
 * Automatically invalidates results query after success
 * IMPORTANT: Payload must only include test_score, lab_score, exam_score
 */
export function useUpdateResultEntry(offeringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      payload,
    }: {
      entryId: string;
      payload: {
        test_score?: number;
        lab_score?: number | null;
        exam_score?: number;
      };
    }) => {
      return updateResultEntry(entryId, payload);
    },
    onSuccess: () => {
      toast.success("Score updated successfully!");
      // Invalidate results so table refetches with new data
      queryClient.invalidateQueries({ queryKey: ["results", offeringId] });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to update score. Please try again.");
    },
  });
}

/**
 * Mutation to delete a result entry
 * Only works if batch status is draft or reviewed (RLS enforced)
 * Automatically invalidates results query after success
 */
export function useDeleteResultEntry(offeringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      return deleteResultEntry(entryId);
    },
    onSuccess: () => {
      toast.success("Result entry deleted successfully!");
      // Invalidate results so table refetches
      queryClient.invalidateQueries({ queryKey: ["results", offeringId] });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to delete entry. Please try again.");
    },
  });
}

/**
 * Mutation to publish a batch
 * Changes status from 'reviewed' to 'published' and locks further edits
 * Automatically invalidates both batches and results queries
 */
export function usePublishBatch(offeringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchId: string) => {
      return publishBatch(batchId);
    },
    onSuccess: () => {
      toast.success("Batch published successfully!");
      // Invalidate both queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["batches", offeringId] });
      queryClient.invalidateQueries({ queryKey: ["results", offeringId] });
    },
    onError: (error) => {
      errorToastHandler(error, "Failed to publish batch. Please try again.");
    },
  });
}

/**
 * Mutation to publish all draft batches for an offering
 * Uses the publish_all_draft_batches RPC and invalidates both batch and result queries
 */
export function usePublishAllDraftBatches(offeringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return publishAllDraftBatches(offeringId);
    },
    onSuccess: (count: number) => {
      toast.success(`${count} batches published successfully.`);
      queryClient.invalidateQueries({ queryKey: ["batches", offeringId] });
      queryClient.invalidateQueries({ queryKey: ["results", offeringId] });
    },
    onError: (error) => {
      errorToastHandler(
        error,
        "Failed to publish draft batches. Please try again.",
      );
    },
  });
}
