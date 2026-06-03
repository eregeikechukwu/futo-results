"use client";

import ProgressBar from "@/components/secondary/ProgressBar";
import { AdvisorQuickActions } from "@/components/secondary/advisorQuickActions";
import { ReportCards } from "@/components/statsCards/reportsCards";
import { AdvisorStatsCards } from "@/components/statsCards/statsCards";
import { Heading2 } from "@/components/secondary/typography";
import { Calendar, UserCheck2Icon } from "lucide-react";
import React, { useEffect } from "react";
import {
  useAdvisorDashboardStats,
  useRecentBatches,
  useUploadActivity,
} from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import "@aejkatappaja/phantom-ui";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { LoaderSpinner3 } from "@/components/secondary/loaders/loaders";
import { errorToastHandler } from "@/helpers/errorHandler";
import {
  AdvisorProgressBarsSkeleton,
  AdvisorStatsSkeleton,
  AdvisorUUploadSummarySkeleton,
} from "@/components/skeletons/advisorSkeletons";
// import "@aejkatappaja/phantom-cui";

export default function AdvisorDashboard() {
  const { loading, profile, advisorData } = useAuth();

  const {
    data: statsData,
    isLoading,
    error,
  } = useAdvisorDashboardStats(
    profile?.id || "",
    advisorData?.id || "",
    advisorData?.advisor_assignments[0].departments.id || "",
    advisorData?.advisor_assignments[0].admission_year || 0,
  );
  const {
    data: uploadActivity,
    isLoading: uploadActivityLoading,
    error: uploadActivityError,
  } = useUploadActivity(profile?.id || "");

  // Ftehc report for report cards
  const {
    data: uploadSummaryData,
    isLoading: uploadSummaryLoading,
    error: uploadSummaryError,
  } = useRecentBatches(profile?.id || "");

  useEffect(() => {
    import("@aejkatappaja/phantom-ui");

    if ((!advisorData || !profile) && !loading) {
      toast.error(
        "Something went wrong getting avisor data, please reload and try again.",
      );
    }
  }, []);

  if ((!advisorData || !profile) && !loading) {
    return <SomethingWentWrong />;
  }

  if (loading) return <LoaderSpinner3 />;

  console.log(uploadSummaryData, " upload summary data in dashboard");

  const uploadSummary = uploadSummaryData?.map((batch) => {
    return {
      title: batch?.title,
      color: batch?.color,
      coursecode: batch?.courseCode,
      date: batch?.createdAt.split("T")[0],
      status: batch?.statusLabel,
    };
  });

  // if (isLoading || uploadActivityLoading || uploadSummaryLoading)
  //   return <div>Skeleton</div>;

  console.log("statsData.new: ", uploadSummary);

  // Error handling professionlayy
  if (uploadActivityError || uploadSummaryError || error) {
    errorToastHandler(
      uploadActivityError?.message ||
        uploadSummaryError?.message ||
        error?.message ||
        "Failed to load dashboard data, please reload the page. If the problem persists, contact support.",
    );
    // return <SomethingWentWrong me/ssage="Failed to load dashboard data" />;
  }

  console.log(statsData?.targetLevel);

  return (
    <>
      <div className="dashboard-main-container">
        <div className="flex justify-between  items-center bg-gradient-to-r from-[#effff8] to-[var(--color-white)] border border-[var(--color-blue-background)] rounded-[16px] lh-24 p-24">
          <div>
            <h1 className="text-24 lh-32 font-bold mb-8">
              Welcome back, {advisorData?.title || "Advisor"}{" "}
              {profile?.full_name || "User"}
            </h1>
            <h2 className="text-[var(--color-text-link)]">
              {advisorData?.advisor_assignments[0].departments.name ||
                "Department"}{" "}
              Department • Academic Session{" "}
              {statsData?.activeTerm.session || "N/A"}
            </h2>
          </div>

          {/* Badge */}
          <div className="h-64 w-64 rounded-[16px] center-child bg-[var(--color-primary)]">
            <UserCheck2Icon size={26} stroke="var(--color-white)" />
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <AdvisorStatsSkeleton />
        ) : (
          <AdvisorStatsCards
            totalStudents={statsData?.totalStudents || 0}
            newStudents={statsData?.newStudents || 0}
            uploadedResults={statsData?.uploadedResults || 0}
            recentResults={statsData?.recentResults || 0}
            classLevel={statsData?.targetLevel || 0}
            pendingReviews={statsData?.pendingReviews}
          />
        )}

        {/* Progress bars and upload summary */}
        <div className="grid grid-cols-[repeat(2,minmax(400px,1fr))] gap-32">
          {uploadActivityLoading ? (
            <AdvisorProgressBarsSkeleton />
          ) : (
            <div className="dashboard-container">
              {/* Heading */}
              <div className="flex justify-between mb-30">
                <Heading2>Recent Upload Activity</Heading2>
                <span className="text-[var(--color-text-passive)] secondary-heading flex gap-8 items-center">
                  <Calendar size={16} /> Last 5 months
                </span>
              </div>

              {/* Progress bars */}
              <div className="flex flex-col gap-16">
                {uploadActivityError ? (
                  <div>Error fetching upload report</div>
                ) : (
                  uploadActivity?.map((activity) => (
                    <ProgressBar
                      key={activity.month || ""}
                      title={activity.month ? activity.month.slice(0, 3) : ""}
                      progress={activity.uploaded || 0}
                      total={activity.total || 0}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Last Uploads summary */}
          {uploadSummaryLoading ? (
            <AdvisorUUploadSummarySkeleton />
          ) : (
            <div className="dashboard-container ">
              <div className="mb-24">
                <Heading2>Last Upload Summary</Heading2>
              </div>
              <ReportCards reports={uploadSummary} />
            </div>
          )}
        </div>

        <div className="dashboard-container">
          <div className="mb-24">
            <Heading2>Quick Actions</Heading2>
          </div>

          <AdvisorQuickActions />
        </div>
      </div>
      <div>
        {/* Our Lady of Fatima, St. Gregory, Orapronobis.🙏🏽🙏🏽 Mementori Mori ✝️⛪ */}
      </div>
    </>
  );
}
