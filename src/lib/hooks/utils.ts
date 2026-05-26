//============================================================================
// QUERY KEYS
// ============================================================================
/**
 * Factory object for creating consistent query keys across the app.
 * Follows TanStack Query best practices for key structure.
 * Enables proper cache invalidation and dependency management.
 *
 * Structure: [domain, category, ...specifics]
 * This ensures related queries can be invalidated together.
 */
export const advisorDashboardKeys = {
  all: ["advisor", "dashboard"] as const,
  stats: () => [...advisorDashboardKeys.all, "stats"] as const,
  statsDetail: (
    advisorProfileId: string,
    advisorId: string,
    departmentId: string,
    admissionYear: number,
  ) =>
    [
      ...advisorDashboardKeys.stats(),
      { advisorProfileId, advisorId, departmentId, admissionYear },
    ] as const,
  uploadActivity: () =>
    [...advisorDashboardKeys.all, "uploadActivity"] as const,
  uploadActivityDetail: (advisorId: string) =>
    [...advisorDashboardKeys.uploadActivity(), { advisorId }] as const,
  recentBatches: () => [...advisorDashboardKeys.all, "recentBatches"] as const,
  recentBatchesDetail: (advisorId: string, limit?: number) =>
    [...advisorDashboardKeys.recentBatches(), { advisorId, limit }] as const,
  courseOfferings: () =>
    [...advisorDashboardKeys.all, "courseOfferings"] as const,
  courseOfferingsDetail: (termId: string, advisorId?: string) =>
    [...advisorDashboardKeys.courseOfferings(), { termId, advisorId }] as const,
  allCourses: () => [...advisorDashboardKeys.all, "allCourses"] as const,
  activeTerms: () => [...advisorDashboardKeys.all, "activeTerms"] as const,
  students: () => ["students"] as const,
};

// ?Universal stale time for dashborad
export const staleTimeUni = 5 * 60 * 1000; // 5 minutes
export const gcTimeUni = 30 * 60 * 1000; // 30 minutes (formerly cacheTime)
