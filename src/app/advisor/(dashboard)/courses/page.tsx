"use client";

import { AddCourse } from "@/components/forms/advisorAddCourse";
import { useModalTemplate } from "@/components/modals/overlay";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { AdvisorCoursesStats } from "@/components/statsCards/statsCards";
import { AdvisorCoursesTable } from "@/components/tables/advisorCoursesTable";
import { advisorCourses } from "@/mock/advisorCourses";

export default function AdvisorCourses() {
  const activeSesson = "2024/2025";

  const totalCourses = advisorCourses.filter(
    (course) => course.session === activeSesson
  );
  const totalCoursesCount = totalCourses.length;
  const totalCredits: number = totalCourses.reduce(
    (acc, course) => acc + Number(course.unit),
    0
  );
  const harmattan = totalCourses.filter(
    (course) => course.semester === "Harmattan"
  ).length;
  const rain = totalCourses.filter(
    (course) => course.semester === "Rain"
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
        toggleModal={toggleModal}
      />

      {/* Stats card */}
      <AdvisorCoursesStats
        totalCourses={totalCoursesCount}
        totalCredits={totalCredits}
        harmattan={harmattan}
        rain={rain}
      />

      {/* Add courses table */}
      <AdvisorCoursesTable activeSesson={activeSesson} />

      {/* Add course modal */}
      <ModalTemplate title={"Add New Course"}>
        <AddCourse toggleModal={toggleModal} />
      </ModalTemplate>
    </DashboardContainer>
  );
}
