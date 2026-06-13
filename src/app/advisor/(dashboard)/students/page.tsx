"use client";

import { AdvisorStudentsTable } from "@/components/tables/advisorStudentsTable";
import { AdvisorStudentsStatsCards } from "@/components/statsCards/statsCards";
import { Header } from "@/components/secondary/header";
import { DashboardContainer } from "@/components/secondary/common";
import { useModalTemplate } from "@/components/modals/overlay";
import { excelUploadFormats } from "@/utils/systemUtils";
import { PlusIcon } from "lucide-react";
import { AddStudentForm } from "@/components/forms/addStudent";
import { useCallback, useState, ChangeEvent } from "react";
import { excelToJson, useExcelParser } from "@/lib/excelToJson";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { errorToastHandler } from "@/helpers/errorHandler";
import {
  useFetchStudentsStats,
  useUploadAdvisorStudents,
} from "@/lib/hooks/useAdvisorStudents";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { AdvisorStudent } from "@/app/types/advisor";
import "@aejkatappaja/phantom-ui";
import { AdvisorTablesSkeleton } from "@/components/skeletons/advisorSkeletons";
import { CoverLoader } from "@/components/secondary/loaders/coverLoader";

export default function ManageStudents() {
  const [uploading, setUploading] = useState(false);
  const { toggleModal, ModalTemplate } = useModalTemplate();
  const { advisorData } = useAuth();

  const { parseFile, isLoading: excelLoading } = useExcelParser();

  const {
    data: students,
    error: studentsError,
    isPending: studentsIsPending,
  } = useFetchStudentsStats(
    advisorData?.advisor_assignments[0].admission_year || 0,
    advisorData?.advisor_assignments[0].departments.id || "",
    advisorData?.id || "",
  );
  const uploadStudentsMutation = useUploadAdvisorStudents();

  const handleFileInput = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const file = e.target.files?.[0];

      if (!advisorData) {
        toast.error("No advisor data found.");
        return;
      }
      if (!file) return;

      toast.loading("Uploading file...");

      setUploading(true);
      const exceldata = await excelToJson(file, "students");
      const enrichedData = exceldata.data.map((student) => {
        return {
          ...student,
          created_by: advisorData?.id,
          admission_year: advisorData?.advisor_assignments[0].admission_year,
          department_id: advisorData?.advisor_assignments[0].departments.id,
        };
      });
      // console.log(enrichedData, "Enriched sgasioasoaksas");

      if (enrichedData.length > 0) {
        uploadStudentsMutation.mutate(enrichedData, {
          onSuccess: (result) => {
            toast.success(
              `File uploaded successfully! ${result.length} student${result.length > 1 && "s"} ${result.length > 1 ? "where" : "was"} added`,
            );

            // console.log(result, " THe added students hereeeeeeeee");
            e.target.value = "";
            // setFile(null);
            setUploading(false);
          },
          onError: (error) => {
            errorToastHandler(
              error,
              "Failed to upload file. Please try again.",
            );
            // setFile(null);
            e.target.value = "";
            setUploading(false);
          },
        });
      } else {
        toast.error("No valid student data found in the file.");
      }
    },
    [parseFile],
  );

  // Error loading students
  if (studentsError) {
    errorToastHandler(
      studentsError,
      "Something went wrong fetching students data",
    );
    return (
      <SomethingWentWrong message="Something went wrong fetching students data" />
    );
  }

  const TypeStudent = () => {
    return (
      <button
        onClick={toggleModal}
        disabled={uploading}
        className={`button-primary flex gap-8 items-center ${uploading && "opacity-[70%] pointer-events-none"}`}
      >
        Type in Student
        <PlusIcon size={17} className="" />
      </button>
    );
  };

  const verifiedStudents =
    students?.filter((student) => student.status === "verified").length || 0;
  const pendingStudents =
    students?.filter((student) => student.status === "pending").length || 0;
  const flaggedStudents =
    students?.filter((student) => student.status === "flagged").length || 0;

  return (
    <DashboardContainer>
      {/* Heading */}
      <Header
        heading="Manage Students"
        subHeading="View and manage student registrations and verifications"
        icon="ArrowDownToLine"
        button="Import from Excel"
        buttonLoading={uploading}
        onClick={() => document.getElementById("studentsFileInput")?.click()}
        extraComponent={<TypeStudent />}
      />
      <input
        type="file"
        className="hidden"
        id="studentsFileInput"
        accept={excelUploadFormats.join(",")}
        disabled={uploading}
        onChange={handleFileInput}
      />
      {/* Stats card */}
      {/* Add skeleton loader here */}
      {studentsIsPending ? (
        <AdvisorTablesSkeleton />
      ) : (
        <>
          <AdvisorStudentsStatsCards
            totalStudents={students?.length || 0}
            verified={verifiedStudents || 0}
            flagged={flaggedStudents}
            pending={pendingStudents}
          />
          {/* Students table */}
          <AdvisorStudentsTable
            advisorStudents={students as AdvisorStudent[]}
          />
        </>
      )}

      {/* Cover loader */}
      {uploading && <CoverLoader />}

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
