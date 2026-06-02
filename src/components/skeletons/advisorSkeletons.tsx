import { AdvisorStudentsTable } from "@/components/tables/advisorStudentsTable";
import {
  AdvisorStatsCards,
  AdvisorStudentsStatsCards,
} from "@/components/statsCards/statsCards";
import { advisorStudents } from "@/mock/advisorStudents";
import { AdvisorStudent } from "@/app/types/advisor";
import "@aejkatappaja/phantom-ui";
import { Heading2 } from "../secondary/typography";
import { Calendar } from "lucide-react";
import ProgressBar from "../secondary/ProgressBar";
import { defaultReports, ReportCards } from "../statsCards/reportsCards";
import { DashboardContainer } from "../secondary/common";

export function AdvisorTablesSkeleton() {
  return (
    <phantom-ui stagger={2} loading={true}>
    <DashboardContainer>
        <AdvisorStudentsStatsCards
        totalStudents={0}
        verified={0}
        flagged={0}
        pending={0}
      />
      {/* Students table */}
      <AdvisorStudentsTable
        advisorStudents={advisorStudents as AdvisorStudent[]}
      />
    </DashboardContainer>
    </phantom-ui>
  );
}

export function AdvisorStatsSkeleton() {
  return (
    <div>
      <phantom-ui loading={true}>
        <AdvisorStatsCards
          totalStudents={0}
          newStudents={0}
          uploadedResults={0}
          recentResults={0}
          classLevel={0}
          pendingReviews={2}
        />
      </phantom-ui>
    </div>
  );
}

export function AdvisorProgressBarsSkeleton() {
  return (
    <phantom-ui loading={true}>
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
          <ProgressBar key={"dfs"} title={"prof"} progress={0} total={0} />
        </div>
      </div>
    </phantom-ui>
  );
}

export function AdvisorUUploadSummarySkeleton() {
  return (
    <phantom-ui loading={true}>
      <div className="dashboard-container ">
        <div className="mb-24">
          <Heading2>Last Upload Summary</Heading2>
        </div>
        <ReportCards reports={defaultReports} />
      </div>
    </phantom-ui>
  );
}
