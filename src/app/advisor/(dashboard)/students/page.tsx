"use client";

import { AdvisorStudentsTable } from "@/components/tables/advisorStudentsTable";
import { advisorStudents } from "@/mock/advisorStudents";
import { AdvisorStudentsStatsCards } from "@/components/statsCards/statsCards";
import { Header } from "@/components/secondary/header";
import { DashboardContainer } from "@/components/secondary/common";

export default function ManageSTudents() {
  const verifiedStudents = advisorStudents.filter(
    (student) => student.status === "verified"
  ).length;
  const pendingStudents = advisorStudents.filter(
    (student) => student.status === "pending"
  ).length;
  const flaggedStudents = advisorStudents.filter(
    (student) => student.status === "flagged"
  ).length;

  return (
    <DashboardContainer>
      {/* Heading */}
      <Header
        heading="Manage Students"
        subHeading="View and manage student registrations and verifications"
        icon="ArrowDownToLine"
        button="Import from Google Form"
      />

      {/* Stats card */}
      <AdvisorStudentsStatsCards
        totalStudents={advisorStudents.length}
        verified={verifiedStudents}
        flagged={flaggedStudents}
        pending={pendingStudents}
      />
      {/* Students table */}
      <AdvisorStudentsTable />
    </DashboardContainer>
  );
}

/*

| Concept                 | Meaning                                    |
| ----------------------- | ------------------------------------------ |
| `getCoreRowModel()`     | Base data before any filtering             |
| `getFilteredRowModel()` | Applies all filter logic                   |
| `globalFilter`          | Search across all columns                  |
| `columnFilters`         | Individual filters per column              |
| `onGlobalFilterChange`  | Updates when you type in search            |
| `accessorKey`           | Tells the table which data field to filter |
*/
