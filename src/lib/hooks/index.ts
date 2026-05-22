/**
 * ADVISOR DASHBOARD HOOKS - BARREL EXPORT
 *
 * This file aggregates all hooks needed for the advisor dashboard.
 * Import hooks from this file rather than individual files for cleaner imports.
 *
 * Usage:
 * ```tsx
 * import {
 *   useAdvisorDashboardStats,
 *   useUploadActivity,
 *   useRecentBatches,
 *   useAdvisorCourseOfferings,
 *   useCreateCourseOffering,
 * } from "@/lib/hooks";
 * ```
 */

// ============================================================================
// DASHBOARD STATS HOOKS
// ============================================================================
export {
  useAdvisorDashboardStats,
  useUploadActivity,
  useRecentBatches,
  useCourseOfferingsByTerm,
  useAllCourses,
  useActiveTerms,
  advisorDashboardKeys,
} from "./useAdvisorDashboard";

// ============================================================================
// COURSE OFFERINGS HOOKS
// ============================================================================
export {
  useAdvisorCourseOfferings,
  useGetCourseOffering,
  useAllCourseOfferingsByTerm,
  useCourseOfferingsStats,
  useCreateCourseOffering,
  useDeleteCourseOffering,
  useCheckOfferingExists,
  courseOfferingsKeys,
} from "./useCourseOfferings";
