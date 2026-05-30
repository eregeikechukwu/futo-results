"use client";

import { AddCourse } from "@/components/forms/advisorAddCourse";
import { useModalTemplate } from "@/components/modals/overlay";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { AdvisorCoursesStats } from "@/components/statsCards/statsCards";
import { AdvisorCoursesTable } from "@/components/tables/advisorCoursesTable";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { errorToastHandler } from "@/helpers/errorHandler";
import { useActiveTerm } from "@/lib/hooks/useAcademicTerms";
import { useAdvisorOfferings } from "@/lib/hooks/useAdvisorCourses";
import toast from "react-hot-toast";
import "@aejkatappaja/phantom-ui";
import { AdvisorTablesSkeleton } from "@/components/skeletons/advisorSkeletons";

export default function AdvisorCourses() {
  const { advisorData } = useAuth();

  if (!advisorData) {
    toast.error("Advisor data is missing. Please reload and try again.");
    return;
  }

  const {
    data: activeSession,
    isPending: activeTermPending,
    error: activeTermError,
  } = useActiveTerm();
  const {
    data: advisorOffering,
    isPending: advisorOfferingPending,
    error: advisorOfferingError,
  } = useAdvisorOfferings(advisorData.id);

  if (activeTermError || advisorOfferingError) {
    // errorT
    errorToastHandler(
      activeTermError || advisorOfferingError,
      "Failed to load data. Please try again.",
    );
  }

  const advisorOfferings = useMemo(() => {
    if (!advisorOffering) return [];
    return advisorOffering.map((offering) => ({
      id: offering.id,
      courseCode: offering.courses.course_code,
      courseTitle: offering.courses.course_title,
      unit: offering.unit,
      semester: offering.academic_terms.semester,
      session: offering.academic_terms.session,
    }));
  }, [advisorOffering]);

  advisorOffering
    ? console.log(advisorOffering, activeSession, "academic terms it is")
    : null;

  const activeSessionMock = "2024/2025";

  const totalCoursesCount = advisorOffering?.length || 0;
  const totalCredits: number = advisorOffering?.reduce(
    (acc, course) => acc + Number(course.unit),
    0,
  );
  const harmattan = advisorOffering?.filter(
    (course) => course.academic_terms?.semester === "Harmattan",
  ).length;
  const rain = advisorOffering?.filter(
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

     
       {
         advisorOfferingPending || activeTermPending ? (
           <AdvisorTablesSkeleton />) : (
          // {/* Stats card */}
    <>
        <AdvisorCoursesStats
          totalCourses={totalCoursesCount || 0}
          totalCredits={totalCredits || 0}
          harmattan={harmattan || 0}
          rain={rain || 0}
        />

       {/* Add courses table */}
      <AdvisorCoursesTable
        advisorOfferings={advisorOfferings || []}
        activeSession={activeSession?.session || activeSessionMock}
      /></>
        )
       }

      {/* Add course modal */}
      <ModalTemplate title={"Add New Course"}>
        <AddCourse toggleModal={toggleModal} />
      </ModalTemplate>
    </DashboardContainer>
  );
}
