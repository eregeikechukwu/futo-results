/**
 * ============================================================================
 * ADVISOR DASHBOARD INTEGRATION GUIDE
 * ============================================================================
 *
 * This guide shows how to integrate the query functions and React Query hooks
 * into the advisor dashboard to fetch real data.
 *
 * Files created:
 * - src/lib/queries/advisorDashboard.ts (7 query functions)
 * - src/lib/queries/courseOfferings.ts (7 query functions)
 * - src/lib/hooks/useAdvisorDashboard.ts (7 React Query hooks)
 * - src/lib/hooks/useCourseOfferings.ts (7 React Query hooks + 1 mutation)
 * - src/lib/hooks/index.ts (barrel export)
 *
 * ============================================================================
 * PATTERNS & BEST PRACTICES
 * ============================================================================
 *
 * 1. ALWAYS use hooks from lib/hooks/, never call query functions directly
 * 2. Query functions in lib/queries/ are internal implementation details
 * 3. Wrap components in React.Suspense or loading states while fetching
 * 4. Use useAuth() to get advisor data (advisorData.id)
 * 5. Handle errors with errorToastHandler() or custom UI
 * 6. Cache invalidation happens automatically on mutations (see hooks)
 * 7. All data fetching respects RLS policies - no service role needed
 *
 * ============================================================================
 * UPDATED dashboard/page.tsx EXAMPLE
 * ============================================================================
 */

"use client";

import ProgressBar from "@/components/secondary/ProgressBar";
import { AdvisorQuickActions } from "@/components/secondary/advisorQuickActions";
import { ReportCards } from "@/components/statsCards/reportsCards";
import { AdvisorStatsCards } from "@/components/statsCards/statsCards";
import { Heading2 } from "@/components/secondary/typography";
import { Calendar, UserCheck2Icon } from "lucide-react";
import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSkeleton from "@/components/secondary/loaders/loaders";
import {
  useAdvisorDashboardStats,
  useUploadActivity,
  useRecentBatches,
  useActiveTerms,
} from "@/lib/hooks";

export const metadata = {
  title: "Advisor Dashboard",
  description: "Advisor Dashboard - for managing students, courses, and more.",
};

export default function AdvisorDashboard() {
  const { advisorData, profile, loading: authLoading } = useAuth();

  // =========================================================================
  // GET ADVISOR CONTEXT
  // =========================================================================
  // Use advisor data from AuthContext to get assignments
  // Each advisor may have multiple assignments (department + admission_year combos)
  // For now, we use the first assignment (or could add UI to switch assignments)
  const currentAssignment = advisorData?.advisor_assignments?.[0];
  const advisorId = advisorData?.id || "";
  const departmentId = currentAssignment?.departments?.id || "";
  const admissionYear = currentAssignment?.admission_year || 0;
  const departmentName = currentAssignment?.departments?.name || "";

  // =========================================================================
  // FETCH DASHBOARD DATA USING REACT QUERY HOOKS
  // =========================================================================

  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdvisorDashboardStats(advisorId, departmentId, admissionYear);

  // Fetch upload activity (last 5 months)
  const {
    data: uploadActivityData,
    isLoading: activityLoading,
    error: activityError,
  } = useUploadActivity(advisorId);

  // Fetch recent result batches
  const {
    data: recentBatches,
    isLoading: batchesLoading,
    error: batchesError,
  } = useRecentBatches(advisorId, 3);

  // Fetch active terms (for context)
  const { data: activeTerms } = useActiveTerms();
  const activeTerm = activeTerms?.[0];

  // =========================================================================
  // LOADING & ERROR STATES
  // =========================================================================
  const isLoading = authLoading || statsLoading;
  const hasError = statsError || activityError || batchesError;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="dashboard-main-container">
        <div className="p-24 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800">
            Error loading dashboard data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TRANSFORM DATA FOR COMPONENTS
  // =========================================================================

  // Upload activity: convert from query format to component format
  const uploadActivities = (uploadActivityData || []).map((activity) => ({
    month: activity.month,
    uploaded: activity.uploaded,
    total: activity.total,
  }));

  // Recent batches: convert to ReportCards format
  const reportCards = (recentBatches || []).map((batch) => ({
    title: batch.title,
    color: batch.color as "brown" | "green" | "red",
    items: batch.items,
    date: new Date(batch.createdAt).toISOString().split("T")[0],
    status: batch.statusLabel,
  }));

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <>
      <div className="dashboard-main-container">
        {/* Welcome banner with advisor info */}
        <div className="flex justify-between items-center bg-gradient-to-r from-[#effff8] to-[var(--color-white)] border border-[var(--color-blue-background)] rounded-[16px] lh-24 p-24">
          <div>
            <h1 className="text-24 lh-32 font-bold mb-8">
              Welcome back, {profile?.full_name}
            </h1>
            <h2 className="text-[var(--color-text-link)]">
              {departmentName} • Academic Session {activeTerm?.session}
            </h2>
          </div>

          {/* Badge */}
          <div className="h-64 w-64 rounded-[16px] center-child bg-[var(--color-primary)]">
            <UserCheck2Icon size={26} stroke="var(--color-white)" />
          </div>
        </div>

        {/* Stats Cards with real data */}
        <AdvisorStatsCards
          totalStudents={stats?.totalStudents || 0}
          newStudents={stats?.newStudents || 0}
          uploadedResults={stats?.uploadedResults || 0}
          recentResults={stats?.recentResults || 0}
          activeSessions={stats?.activeSessions || 0}
          pendingReviews={stats?.pendingReviews || 0}
        />

        {/* Progress bars and upload summary */}
        <div className="grid grid-cols-[repeat(2,minmax(400px,1fr))] gap-32">
          <div className="dashboard-container">
            {/* Heading */}
            <div className="flex justify-between mb-30">
              <Heading2>Recent Upload Activity</Heading2>
              <span className="text-[var(--color-text-passive)] secondary-heading flex gap-8 items-center">
                <Calendar size={16} /> Last 5 months
              </span>
            </div>

            {/* Progress bars */}
            {activityLoading ? (
              <div className="text-center py-16">Loading activity...</div>
            ) : (
              <div className="flex flex-col gap-16">
                {uploadActivities.map((activity) => (
                  <ProgressBar
                    key={activity.month}
                    title={activity.month.slice(0, 3)}
                    progress={activity.uploaded}
                    total={activity.total}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Last Uploads summary */}
          <div className="dashboard-container">
            <div className="mb-24">
              <Heading2>Last Upload Summary</Heading2>
            </div>
            {batchesLoading ? (
              <div className="text-center py-16">Loading batches...</div>
            ) : reportCards.length > 0 ? (
              <ReportCards reports={reportCards} />
            ) : (
              <p className="text-[var(--color-text-passive)]">
                No recent uploads yet. Start by uploading results!
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-container">
          <div className="mb-24">
            <Heading2>Quick Actions</Heading2>
          </div>

          <AdvisorQuickActions />
        </div>
      </div>
    </>
  );
}

/**
 * ============================================================================
 * INTEGRATION CHECKLIST
 * ============================================================================
 *
 * To integrate into your actual dashboard:
 *
 * [ ] 1. Update ReportCards component to accept reports prop (see above)
 *        - Current hardcoded array, change to accept {reports} parameter
 *
 * [ ] 2. Update AdvisorStatsCards if needed
 *        - Verify it accepts the stats values correctly
 *
 * [ ] 3. Ensure DashboardSkeleton exists
 *        - Import from correct location or create if missing
 *
 * [ ] 4. Test that AuthContext provides advisorData correctly
 *        - Run in browser and check console for advisorData structure
 *
 * [ ] 5. Verify database queries return expected data
 *        - Check Supabase logs if queries fail
 *        - Ensure RLS policies allow advisor to see their data
 *
 * [ ] 6. Add error boundaries if needed
 *        - Consider wrapping sections in error boundaries
 *        - Show user-friendly error messages
 *
 * [ ] 7. Monitor query performance
 *        - Use React Query DevTools to inspect cache
 *        - Adjust stale times if needed
 *
 * ============================================================================
 * NEXT PAGES TO HANDLE
 * ============================================================================
 *
 * Once dashboard is complete, follow same pattern for:
 *
 * 1. /advisor/(dashboard)/courses/page.tsx
 *    - Use useAdvisorCourseOfferings() to fetch real courses
 *    - Use useCreateCourseOffering() for add course modal
 *    - Use useDeleteCourseOffering() for delete action
 *    - Use useCourseOfferingsStats() for stats cards
 *
 * 2. /advisor/(dashboard)/students/page.tsx
 *    - Create similar hooks in src/lib/hooks/useAdvisorStudents.ts
 *    - Query functions already exist in src/lib/queries/students.ts
 *    - Follow the same pattern as above
 *
 * 3. /advisor/(dashboard)/upload-results/page.tsx
 *    - Create hooks for result_batches and result_entries
 *    - Handle file upload and processing
 *    - Show upload progress
 *
 * ============================================================================
 * QUERY PERFORMANCE NOTES
 * ============================================================================
 *
 * Cache behavior is configured for each hook:
 * - Stats: 5 min stale, 30 min cache (active user interaction)
 * - Activity: 10 min stale, 60 min cache (historical data)
 * - Batches: 5 min stale, 30 min cache (recent uploads)
 * - Courses: 1 min stale, 10 min cache (frequently changes)
 * - Terms: 60 min stale, 4 hours cache (rarely changes)
 *
 * All queries have:
 * - Automatic retry on failure (2 attempts with exponential backoff)
 * - Refetch on window focus (catch data changes when user returns)
 * - Proper enabled conditions (don't fetch if params missing)
 *
 * ============================================================================
 */
