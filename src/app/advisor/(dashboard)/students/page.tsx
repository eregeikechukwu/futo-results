"use client";

import { AdvisorStudentsTable } from "@/components/tables/advisorStudentsTable";
import { advisorStudents } from "@/mock/advisorStudents";
import { AdvisorStudentsStatsCards } from "@/components/statsCards/statsCards";
import { Header } from "@/components/secondary/header";
import { DashboardContainer } from "@/components/secondary/common";
import { useModalTemplate } from "@/components/modals/overlay";
import { PlusIcon } from "lucide-react";
import { AddStudentForm } from "@/components/forms/addStudent";

export default function ManageSTudents() {
  const { toggleModal, ModalTemplate } = useModalTemplate();

  const verifiedStudents = advisorStudents.filter(
    (student) => student.status === "verified",
  ).length;
  const pendingStudents = advisorStudents.filter(
    (student) => student.status === "pending",
  ).length;
  const flaggedStudents = advisorStudents.filter(
    (student) => student.status === "flagged",
  ).length;

  const TypeStudent = () => {
    return (
      <button
        onClick={toggleModal}
        className="button-primary flex gap-8 items-center"
      >
        Type in Student
        <PlusIcon size={17} className="" />
      </button>
    );
  };

  return (
    <DashboardContainer>
      {/* Heading */}
      <Header
        heading="Manage Students"
        subHeading="View and manage student registrations and verifications"
        icon="ArrowDownToLine"
        button="Import from Google Form"
        extraButton={<TypeStudent />}
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

      {/* Type in Student thruogh form */}
      <ModalTemplate title={"Add New Student"}>
        {/* <AddStudent toggleModal={toggleModal} /> */}
        <AddStudentForm toggleModal={toggleModal} />
      </ModalTemplate>
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
