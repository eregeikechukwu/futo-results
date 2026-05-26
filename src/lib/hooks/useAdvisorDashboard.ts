"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdvisorDashboardStats,
  fetchUploadActivity,
  fetchRecentBatches,
  fetchCourseOfferingsByTerm,
  fetchAllCourses,
  fetchActiveTerms,
} from "../queries/advisorDashboard";
import { advisorDashboardKeys, gcTimeUni, staleTimeUni } from "./utils";

// ============================================================================
// DASHBOARD STATS HOOK
// ============================================================================
/**
 * Hook to fetch advisor dashboard statistics.
 * Returns: totalStudents, newStudents, uploadedResults, recentResults, activeSessions, pendingReviews
 *
 * Usage:
 * ```tsx
 * const { data: stats, isLoading, error } = useAdvisorDashboardStats(
 *   advisorId,
 *   departmentId,
 *   admissionYear
 * );
 * ```
 *
 * Cache behavior:
 * - Stale time: 5 minutes (user won't see drastically outdated stats)
 * - Cache time: 30 minutes (data persists in memory)
 * - Refetch on window focus: enabled (refreshes when user returns to tab)
 *
 * @param advisorId - UUID of the advisor
 * @param departmentId - UUID of the advisor's department
 * @param admissionYear - The admission year this advisor is assigned to
 * @returns Query result with stats data
 */
export function useAdvisorDashboardStats(
  advisorProfileId: string,
  advisorId: string,
  departmentId: string,
  admissionYear: number,
) {
  return useQuery({
    queryKey: advisorDashboardKeys.statsDetail(
      advisorProfileId,
      advisorId,
      departmentId,
      admissionYear,
    ),
    queryFn: () =>
      fetchAdvisorDashboardStats(
        advisorProfileId,
        advisorId,
        departmentId,
        admissionYear,
      ),
    staleTime: staleTimeUni,
    gcTime: gcTimeUni,
    refetchOnWindowFocus: true,
    enabled: !!advisorId && !!departmentId && !!admissionYear,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// UPLOAD ACTIVITY HOOK
// ============================================================================
/**
 * Hook to fetch monthly upload activity for the last 5 months.
 * Used for the "Recent Upload Activity" chart on the dashboard.
 *
 * Returns array of months with: { month, uploaded, total }
 *
 * Usage:
 * ```tsx
 * const { data: activity } = useUploadActivity(advisorId);
 * // Returns: [{ month: "January", uploaded: 23, total: 50 }, ...]
 * ```
 *
 * Cache behavior:
 * - Stale time: 10 minutes (less frequent updates for historical data)
 * - Cache time: 60 minutes
 * - Refetch on window focus: enabled
 *
 * @param advisorId - UUID of the advisor
 * @returns Query result with monthly activity data
 */
export function useUploadActivity(advisorProfileId: string) {
  return useQuery({
    queryKey: advisorDashboardKeys.uploadActivityDetail(advisorProfileId),
    queryFn: () => fetchUploadActivity(advisorProfileId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: true,
    enabled: !!advisorProfileId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// RECENT BATCHES HOOK
// ============================================================================
/**
 * Hook to fetch recent result batches for the "Last Upload Summary" section.
 *
 * Returns array of recent batches with course and term information.
 *
 * Usage:
 * ```tsx
 * const { data: batches } = useRecentBatches(advisorId, 5);
 * // Returns: [{ id, status, title, courseTitle, items, color }, ...]
 * ```
 *
 * Cache behavior:
 * - Stale time: 5 minutes
 * - Cache time: 30 minutes
 * - Refetch on window focus: enabled
 *
 * @param advisorId - UUID of the advisor
 * @param limit - Maximum number of batches to fetch (default: 5)
 * @returns Query result with recent batch data
 */
export function useRecentBatches(advisorProfileId: string, limit: number = 5) {
  return useQuery({
    queryKey: advisorDashboardKeys.recentBatchesDetail(advisorProfileId, limit),
    queryFn: () => fetchRecentBatches(advisorProfileId, limit),
    staleTime: staleTimeUni, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    enabled: !!advisorProfileId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// COURSE OFFERINGS BY TERM HOOK
// ============================================================================
/**
 * Hook to fetch course offerings for a specific academic term.
 * Optionally filter by advisor.
 *
 * Usage:
 * ```tsx
 * // Fetch all offerings in a term
 * const { data: offerings } = useCourseOfferingsByTerm(termId);
 *
 * // Fetch only offerings by a specific advisor
 * const { data: advisorOfferings } = useCourseOfferingsByTerm(termId, advisorId);
 * ```
 *
 * Cache behavior:
 * - Stale time: 2 minutes (offerings don't change frequently)
 * - Cache time: 15 minutes
 * - Refetch on window focus: enabled
 *
 * @param termId - UUID of the academic term
 * @param advisorId - Optional: Filter to offerings from this advisor
 * @returns Query result with course offerings
 */
export function useCourseOfferingsByTerm(termId: string, advisorId?: string) {
  return useQuery({
    queryKey: advisorDashboardKeys.courseOfferingsDetail(termId, advisorId),
    queryFn: () => fetchCourseOfferingsByTerm(termId, advisorId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    enabled: !!termId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// ALL COURSES HOOK
// ============================================================================
/**
 * Hook to fetch all available courses (master list).
 * Used for course selection dropdowns when adding new offerings.
 *
 * Usage:
 * ```tsx
 * const { data: courses } = useAllCourses();
 * // Returns: [{ id, course_code, course_title, unit }, ...]
 * ```
 *
 * Cache behavior:
 * - Stale time: 30 minutes (courses list is static)
 * - Cache time: 2 hours
 * - Refetch on window focus: disabled (not necessary for static data)
 *
 * @returns Query result with all courses
 */
export function useAllCourses() {
  return useQuery({
    queryKey: advisorDashboardKeys.allCourses(),
    queryFn: () => fetchAllCourses(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false, // Not necessary for static data
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// ACTIVE TERMS HOOK
// ============================================================================
/**
 * Hook to fetch active academic terms.
 * Typically there's only one active term at a time.
 *
 * Usage:
 * ```tsx
 * const { data: terms } = useActiveTerms();
 * // Returns: [{ id, session, semester, is_active }, ...]
 * ```
 *
 * Cache behavior:
 * - Stale time: 60 minutes (active term rarely changes)
 * - Cache time: 4 hours
 * - Refetch on window focus: disabled
 *
 * @returns Query result with active terms
 */
export function useActiveTerms() {
  return useQuery({
    queryKey: advisorDashboardKeys.activeTerms(),
    queryFn: () => fetchActiveTerms(),
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
