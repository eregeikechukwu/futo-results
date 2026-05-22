"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchAdvisorCourseOfferings,
  fetchCourseOfferingById,
  createCourseOffering as createOfferingAPI,
  deleteCourseOffering as deleteOfferingAPI,
  checkCourseOfferingExists,
  fetchAllCourseOfferingsByTerm,
  fetchCourseOfferingsStats,
} from "../queries/courseOfferings";
import { errorToastHandler } from "@/helpers/errorHandler";
import toast from "react-hot-toast";

// ============================================================================
// QUERY KEYS
// ============================================================================
/**
 * Factory object for creating consistent query keys for course offerings.
 * Follows TanStack Query best practices for cache management and invalidation.
 *
 * Structure: [domain, feature, ...specifics]
 * This allows granular cache invalidation (e.g., invalidate all offerings vs specific ones)
 */
export const courseOfferingsKeys = {
  all: ["courseOfferings"] as const,
  advisorOfferings: () => [...courseOfferingsKeys.all, "advisor"] as const,
  advisorOfferingsDetail: (advisorId: string, termId: string) =>
    [
      ...courseOfferingsKeys.advisorOfferings(),
      { advisorId, termId },
    ] as const,
  byTerm: () => [...courseOfferingsKeys.all, "byTerm"] as const,
  byTermDetail: (termId: string) =>
    [...courseOfferingsKeys.byTerm(), { termId }] as const,
  byId: () => [...courseOfferingsKeys.all, "byId"] as const,
  byIdDetail: (offeringId: string) =>
    [...courseOfferingsKeys.byId(), { offeringId }] as const,
  stats: () => [...courseOfferingsKeys.all, "stats"] as const,
  statsDetail: (termId: string) =>
    [...courseOfferingsKeys.stats(), { termId }] as const,
};

// ============================================================================
// QUERY: ADVISOR COURSE OFFERINGS
// ============================================================================
/**
 * Hook to fetch course offerings for an advisor in a specific term.
 * Includes course details and result batch information.
 *
 * Usage:
 * ```tsx
 * const { data: offerings, isLoading } = useAdvisorCourseOfferings(
 *   advisorId,
 *   termId
 * );
 * if (isLoading) return <DashboardSkeleton />;
 * return offerings.map(o => <CourseCard key={o.id} offering={o} />);
 * ```
 *
 * Returned data structure:
 * ```
 * [{
 *   id, courseId, termId,
 *   courseCode, courseTitle, unit,
 *   session, semester, isActive,
 *   totalBatches, publishedBatches, draftBatches,
 *   lastBatchAt
 * }, ...]
 * ```
 *
 * Cache behavior:
 * - Stale time: 1 minute (offerings can change when advisor adds/deletes)
 * - Cache time: 10 minutes
 * - Refetch on window focus: enabled (catches new offerings when user returns)
 *
 * @param advisorId - UUID of the advisor
 * @param termId - UUID of the academic term
 * @returns Query result with offerings array
 */
export function useAdvisorCourseOfferings(advisorId: string, termId: string) {
  return useQuery({
    queryKey: courseOfferingsKeys.advisorOfferingsDetail(advisorId, termId),
    queryFn: () => fetchAdvisorCourseOfferings(advisorId, termId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    enabled: !!advisorId && !!termId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// QUERY: SINGLE COURSE OFFERING BY ID
// ============================================================================
/**
 * Hook to fetch a single course offering by ID.
 * Used for detail views and editing.
 *
 * Usage:
 * ```tsx
 * const { data: offering } = useGetCourseOffering(offeringId);
 * ```
 *
 * Cache behavior:
 * - Stale time: 5 minutes
 * - Cache time: 30 minutes
 * - Refetch on window focus: enabled
 *
 * @param offeringId - UUID of the course offering
 * @returns Query result with single offering data
 */
export function useGetCourseOffering(offeringId: string) {
  return useQuery({
    queryKey: courseOfferingsKeys.byIdDetail(offeringId),
    queryFn: () => fetchCourseOfferingById(offeringId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    enabled: !!offeringId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// QUERY: ALL COURSE OFFERINGS BY TERM (ADMIN VIEW)
// ============================================================================
/**
 * Hook to fetch all course offerings in a term across all advisors.
 * Used for admin dashboards and comprehensive views.
 *
 * Usage:
 * ```tsx
 * const { data: allOfferings } = useAllCourseOfferingsByTerm(termId);
 * ```
 *
 * Cache behavior:
 * - Stale time: 2 minutes
 * - Cache time: 15 minutes
 * - Refetch on window focus: enabled
 *
 * @param termId - UUID of the academic term
 * @returns Query result with all offerings in the term
 */
export function useAllCourseOfferingsByTerm(termId: string) {
  return useQuery({
    queryKey: courseOfferingsKeys.byTermDetail(termId),
    queryFn: () => fetchAllCourseOfferingsByTerm(termId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    enabled: !!termId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// QUERY: COURSE OFFERINGS STATISTICS
// ============================================================================
/**
 * Hook to fetch statistics about course offerings in a term.
 * Returns counts of offerings, total units, and breakdown by advisor.
 *
 * Usage:
 * ```tsx
 * const { data: stats } = useCourseOfferingsStats(termId);
 * // Returns: { totalOfferings, totalUnits, byAdvisor: { advisorId: count } }
 * ```
 *
 * Cache behavior:
 * - Stale time: 5 minutes
 * - Cache time: 30 minutes
 * - Refetch on window focus: enabled
 *
 * @param termId - UUID of the academic term
 * @returns Query result with offering statistics
 */
export function useCourseOfferingsStats(termId: string) {
  return useQuery({
    queryKey: courseOfferingsKeys.statsDetail(termId),
    queryFn: () => fetchCourseOfferingsStats(termId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    enabled: !!termId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// MUTATION: CREATE COURSE OFFERING
// ============================================================================
/**
 * Hook to create a new course offering.
 * Handles loading, error states, and cache invalidation.
 *
 * Business Logic:
 * - Enforces UNIQUE constraint on (advisor_id, term_id, course_id)
 * - User will get error if trying to add same course twice
 * - Automatically invalidates related queries after success
 * - Shows success toast on completion
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateCourseOffering();
 *
 * const handleAdd = async () => {
 *   try {
 *     const result = await createMutation.mutateAsync({
 *       advisorId: "...",
 *       termId: "...",
 *       courseId: "..."
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Error handling already done via errorToastHandler
 *   }
 * };
 *
 * return (
 *   <button
 *     onClick={handleAdd}
 *     disabled={createMutation.isPending}
 *   >
 *     {createMutation.isPending ? "Adding..." : "Add Course"}
 *   </button>
 * );
 * ```
 *
 * @returns Mutation object with mutateAsync, isPending, error, etc.
 */
export function useCreateCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      advisorId: string;
      termId: string;
      courseId: string;
    }) => {
      return await createOfferingAPI(
        variables.advisorId,
        variables.termId,
        variables.courseId,
      );
    },
    onSuccess: (data, variables) => {
      // Show success toast to user
      toast.success("Course added successfully!");

      // Invalidate related query caches
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.advisorOfferingsDetail(
          variables.advisorId,
          variables.termId,
        ),
      });

      // Invalidate all offerings by term (for admin views)
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.byTermDetail(variables.termId),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.statsDetail(variables.termId),
      });
    },
    onError: (error) => {
      // Error handling via errorToastHandler
      errorToastHandler(error, "Failed to add course. Please try again.");
    },
  });
}

// ============================================================================
// MUTATION: DELETE COURSE OFFERING
// ============================================================================
/**
 * Hook to delete a course offering.
 * Includes cascade delete of result batches and entries.
 *
 * Business Logic:
 * - Only advisor who created the offering can delete it (enforced by RLS)
 * - Deleting cascades to result_batches and result_entries
 * - Soft validation: cannot delete if published batches exist
 * - Shows confirmation dialog before deleting (recommended in component)
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteCourseOffering();
 *
 * const handleDelete = async (offeringId: string, advisorId: string) => {
 *   if (!window.confirm("Delete this course offering?")) return;
 *
 *   try {
 *     await deleteMutation.mutateAsync({ offeringId, advisorId });
 *     // Show success message
 *   } catch (error) {
 *     // Error already handled via errorToastHandler
 *   }
 * };
 * ```
 *
 * @returns Mutation object with mutateAsync, isPending, error, etc.
 */
export function useDeleteCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      offeringId: string;
      advisorId: string;
      termId: string; // Needed for cache invalidation
    }) => {
      return await deleteOfferingAPI(variables.offeringId, variables.advisorId);
    },
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success("Course offering deleted successfully!");

      // Invalidate related caches
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.advisorOfferingsDetail(
          variables.advisorId,
          variables.termId,
        ),
      });

      // Invalidate all offerings by term
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.byTermDetail(variables.termId),
      });

      // Invalidate specific offering
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.byIdDetail(variables.offeringId),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: courseOfferingsKeys.statsDetail(variables.termId),
      });
    },
    onError: (error) => {
      errorToastHandler(
        error,
        "Failed to delete course offering. Please try again.",
      );
    },
  });
}

// ============================================================================
// QUERY: CHECK IF OFFERING EXISTS
// ============================================================================
/**
 * Hook to check if a course offering already exists before attempting to create.
 * Used for validation in forms.
 *
 * Usage:
 * ```tsx
 * const { data: exists } = useCheckOfferingExists(advisorId, termId, courseId);
 * if (exists) {
 *   setError("This course is already offered this term");
 * }
 * ```
 *
 * Cache behavior:
 * - Stale time: 1 minute
 * - Cache time: 10 minutes
 *
 * @param advisorId - UUID of the advisor
 * @param termId - UUID of the academic term
 * @param courseId - UUID of the course
 * @returns Query result with existence check (true/false)
 */
export function useCheckOfferingExists(
  advisorId: string,
  termId: string,
  courseId: string,
) {
  return useQuery({
    queryKey: [
      "courseOfferings",
      "exists",
      { advisorId, termId, courseId },
    ] as const,
    queryFn: async () => {
      const result = await checkCourseOfferingExists(
        advisorId,
        termId,
        courseId,
      );
      return result !== null;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!advisorId && !!termId && !!courseId,
    retry: 1,
  });
}
