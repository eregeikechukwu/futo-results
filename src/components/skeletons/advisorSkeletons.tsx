import { AdvisorStudentsTable } from "@/components/tables/advisorStudentsTable";
import { AdvisorStudentsStatsCards } from "@/components/statsCards/statsCards";
import { advisorStudents } from "@/mock/advisorStudents";
import { AdvisorStudent } from "@/app/types/advisor";
import "@aejkatappaja/phantom-ui";

export function AdvisorTablesSkeleton() {
  return (
    <phantom-ui stagger={2} loading={true}>
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
    </phantom-ui>
  );
}
