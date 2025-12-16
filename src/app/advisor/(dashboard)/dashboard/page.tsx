import ProgressBar from "@/components/secondary/ProgressBar";
import { AdvisorQuickActions } from "@/components/secondary/advisorQuickActions";
import { ReportCards } from "@/components/statsCards/reportsCards";
import { AdvisorStatsCards } from "@/components/statsCards/statsCards";
import { Heading2 } from "@/components/secondary/typography";
import { Calendar, UserCheck2Icon } from "lucide-react";
import React from "react";

export const metadata = {
  title: "Advisor Dashboard",
  description: "Advisor Dashboard - for managing students, courses, and more.",
};

export default function AdvisorDashboard() {
  const uploadActivities = [
    { month: "January", uploaded: 23, total: 50 },
    { month: "February", uploaded: 35, total: 50 },
    { month: "March", uploaded: 41, total: 50 },
    { month: "April", uploaded: 28, total: 50 },
    { month: "May", uploaded: 47, total: 50 },
  ];

  return (
    <>
      <div className="dashboard-main-container">
        <div className="flex justify-between  items-center bg-gradient-to-r from-[#effff8] to-[var(--color-white)] border border-[var(--color-blue-background)] rounded-[16px] lh-24 p-24">
          <div>
            <h1 className="text-24 lh-32 font-bold mb-8">
              Welcome back, Dr. Emmanuel Erege
            </h1>
            <h2 className="text-[var(--color-text-link)]">
              Mechatronics Engineering Department • Academic Session 2025/2026
            </h2>
          </div>

          {/* Badge */}
          <div className="h-64 w-64 rounded-[16px] center-child bg-[var(--color-primary)]">
            <UserCheck2Icon size={26} stroke="var(--color-white)" />
          </div>
        </div>

        {/* Stats Cards */}
        <AdvisorStatsCards
          totalStudents={120}
          newStudents={12}
          uploadedResults={45}
          recentResults={8}
          activeSessions={3}
          pendingReviews={5}
        />

        {/* Progress bars and upload summary */}
        <div className="grid grid-cols-[repeat(2,minmax(420px,1fr))] gap-32">
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
              {uploadActivities.map((activity) => (
                <ProgressBar
                  key={activity.month}
                  title={activity.month.slice(0, 3)}
                  progress={activity.uploaded}
                  total={activity.total}
                />
              ))}
            </div>
          </div>
          {/* Last Uploads summary */}
          <div className="dashboard-container ">
            <div className="mb-24">
              <Heading2>Last Upload Summary</Heading2>
            </div>
            <ReportCards />
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
