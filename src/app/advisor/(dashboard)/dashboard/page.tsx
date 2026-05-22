"use client";

import ProgressBar from "@/components/secondary/ProgressBar";
import { AdvisorQuickActions } from "@/components/secondary/advisorQuickActions";
import { ReportCards } from "@/components/statsCards/reportsCards";
import { AdvisorStatsCards } from "@/components/statsCards/statsCards";
import { Heading2 } from "@/components/secondary/typography";
import { Calendar, UserCheck2Icon } from "lucide-react";
import React from "react";
import {
  useAdvisorDashboardStats,
  useRecentBatches,
  useUploadActivity,
} from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { LoaderSpinner3 } from "@/components/secondary/loaders/loaders";

export default function AdvisorDashboard() {
  const { loading, profile, advisorData } = useAuth();

  console.log(advisorData, profile, " advisor Data it is");

  if ( (!advisorData || !profile) && !loading) {
    toast.error(
      "Something went wrong getting asvisor data, please reload and try again.",
    );
    return <SomethingWentWrong />;
  }

  if (loading) return <LoaderSpinner3 />;

  const {
    data: statsData,
    isLoading,
    error,
  } = useAdvisorDashboardStats(
    profile?.id,
    advisorData?.id,
    advisorData?.advisor_assignments[0].departments.id,
    advisorData?.advisor_assignments[0].admission_year,
  );
  const {
    data: uploadActivity,
    isLoading: uploadActivityLoading,
    error: uploadActivityError,
  } = useUploadActivity(profile?.id);

  // Ftehc report for report cards
  const {
    data: uploadSummaryData,
    isLoading: uploadSummaryLoading,
    error: uploadSummaryError,
  } = useRecentBatches(profile?.id);

  const uploadSummary = uploadSummaryData?.map((batch) => {
    return {
      title: batch?.title,
      color: batch?.color,
      coursecode: batch?.courseCode,
      date: batch?.createdAt.split("T")[0],
      status: batch?.statusLabel,
    };
  });

  if (isLoading || uploadActivityLoading || uploadSummaryLoading)
    return <div>Skeleton</div>;

  console.log("statsData.new: ", statsData?.totalStudents);

  console.log(statsData?.targetLevel);

  return (
    <>
      <div className="dashboard-main-container">
        <div className="flex justify-between  items-center bg-gradient-to-r from-[#effff8] to-[var(--color-white)] border border-[var(--color-blue-background)] rounded-[16px] lh-24 p-24">
          <div>
            <h1 className="text-24 lh-32 font-bold mb-8">
              Welcome back, {advisorData?.title} {profile.full_name}
            </h1>
            <h2 className="text-[var(--color-text-link)]">
              {advisorData.advisor_assignments[0].departments.name} Department •
              Academic Session {statsData?.activeTerm.session}
            </h2>
          </div>

          {/* Badge */}
          <div className="h-64 w-64 rounded-[16px] center-child bg-[var(--color-primary)]">
            <UserCheck2Icon size={26} stroke="var(--color-white)" />
          </div>
        </div>

        {/* Stats Cards */}
        <AdvisorStatsCards
          totalStudents={statsData?.totalStudents}
          newStudents={statsData?.newStudents}
          uploadedResults={statsData?.uploadedResults}
          recentResults={statsData?.recentResults}
          classLevel={statsData?.targetLevel || 0}
          pendingReviews={statsData?.pendingReviews}
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
            <div className="flex flex-col gap-16">
              {uploadActivityError ? (
                <div>Error fetching upload report</div>
              ) : (
                uploadActivity!.map((activity) => (
                  <ProgressBar
                    key={activity.month}
                    title={activity.month.slice(0, 3)}
                    progress={activity.uploaded}
                    total={activity.total}
                  />
                ))
              )}
            </div>
          </div>
          {/* Last Uploads summary */}
          <div className="dashboard-container ">
            <div className="mb-24">
              <Heading2>Last Upload Summary</Heading2>
            </div>
            <ReportCards reports={uploadSummary} />
          </div>
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
