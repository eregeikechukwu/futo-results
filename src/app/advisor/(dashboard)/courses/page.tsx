"use client";

import { AddCourse } from "@/components/forms/advisorAddCourse";
import { useModalTemplate } from "@/components/modals/overlay";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { AdvisorCoursesStats } from "@/components/statsCards/statsCards";
import { AdvisorCoursesTable } from "@/components/tables/advisorCoursesTable";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { errorToastHandler } from "@/helpers/errorHandler";
import { useActiveTerm } from "@/lib/hooks/useAcademicTerms";
import { useAdvisorOfferings } from "@/lib/hooks/useAdvisorCourses";
import toast from "react-hot-toast";
import "@aejkatappaja/phantom-ui";
import { AdvisorTablesSkeleton } from "@/components/skeletons/advisorSkeletons";
import { ColumnFilter } from "@tanstack/react-table";
import { AdvisorCourse } from "@/app/types/advisor";

export default function AdvisorCourses() {
  const [sessionFilters, setSessionFilters] = useState<ColumnFilter[]>([
    {
      id: "session",
      value: "",
    },
  ]);
  const { advisorData } = useAuth();

  const {
    data: activeSession,
    isPending: activeTermPending,
    error: activeTermError,
  } = useActiveTerm();
  const {
    data: advisorOffering,
    isPending: advisorOfferingPending,
    error: advisorOfferingError,
  } = useAdvisorOfferings(advisorData?.id || "");

  // Set selected session to active session once it's loaded
  useMemo(() => {
    if (activeSession && !sessionFilters[0].value) {
      setSessionFilters([
        {
          id: "session",
          value: activeSession.session,
        },
      ]);
    }
  }, [activeSession, sessionFilters]);

  const advisorOfferings: AdvisorCourse[] = useMemo(() => {
    if (!advisorOffering) return [];
    return advisorOffering.map((offering) => ({
      id: offering.id,
      courseCode: offering.courses.course_code,
      courseTitle: offering.courses.course_title,
      unit: `${offering.unit}`,
      semester: offering.academic_terms.semester as 'Rain' | 'Harmattan',
      session: offering.academic_terms.session,
    }));
  }, [advisorOffering]);

  const activeSessionMock = "2024/2025";

  // academic courses offerings for selected session filter
  const filteredOfferings = useMemo(() => {
    if (!advisorOffering) return [];
    if (!sessionFilters[0].value) return advisorOffering;

    return advisorOffering.filter(
      (offering) =>
        offering.academic_terms?.session === sessionFilters[0]?.value,
    );
  }, [advisorOffering, sessionFilters]);

  useEffect(() => {
    if (!advisorData) {
      toast.error("Advisor data is missing. Please reload and try again.");
      return;
    }
  }, []);

  if (activeTermError || advisorOfferingError) {
    // errorT
    errorToastHandler(
      activeTermError || advisorOfferingError,
      "Failed to load data. Please try again.",
    );
  }

  // Metrics calculations
  const totalCoursesCount = filteredOfferings.length || 0;
  const totalCredits: number = filteredOfferings.reduce(
    (acc, course) => acc + Number(course.unit),
    0,
  );
  const harmattan = filteredOfferings.filter(
    (course) => course.academic_terms?.semester === "Harmattan",
  ).length;
  const rain = filteredOfferings.filter(
    (course) => course.academic_terms?.semester === "Rain",
  ).length;

  const { toggleModal, ModalTemplate } = useModalTemplate();

  return (
    <DashboardContainer>
      {/* Heading */}
      <Header
        heading="Manage Courses"
        subHeading="Add, edit, and organize departmental courses"
        icon="Plus"
        button="Add Course"
        onClick={toggleModal}
      />

      {advisorOfferingPending || activeTermPending ? (
        <AdvisorTablesSkeleton />
      ) : (
        // {/* Stats card */}
        <>
          <AdvisorCoursesStats
            totalCourses={totalCoursesCount}
            totalCredits={totalCredits}
            harmattan={harmattan}
            rain={rain}
          />

          {/* Add courses table */}
          <AdvisorCoursesTable
            sessionFilters={sessionFilters}
            setSessionFilters={setSessionFilters}
            advisorOfferings={advisorOfferings || []}
            activeSession={activeSession?.session || activeSessionMock}
          />
        </>
      )}

      {/* Add course modal */}
      <ModalTemplate title={"Add New Course"}>
        <AddCourse toggleModal={toggleModal} />
      </ModalTemplate>
    </DashboardContainer>
  );
}
