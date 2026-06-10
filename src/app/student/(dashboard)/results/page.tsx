"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { GradeBadge } from "@/components/pages/student/GradeBadge";
import { downloadSemesterResultPdf } from "@/components/pages/student/resultPdf";
import {
  calculateCgpaFromGrades,
  computeGrade,
  formatCgpa,
  toGradeLetter,
} from "@/utils/systemUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentResults } from "@/lib/hooks/useResults";
import { groupStudentResultsByTerm } from "@/utils/studentResults";
import { errorToastHandler } from "@/helpers/errorHandler";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { EmptyState } from "@/components/secondary/EmptyState";
import { StudentResultsSkeleton } from "@/components/skeletons/studentSkeletons";
import styles from "./results.module.scss";

export default function StudentResultsPage() {
  const { profile, studentData, loading: authLoading } = useAuth();
  const {
    data: studentResults,
    isLoading: resultsLoading,
    error: resultsError,
  } = useStudentResults(studentData?.id || "");

  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (resultsError) {
      errorToastHandler(resultsError, "Failed to load your results.");
    }
  }, [resultsError]);

  const termResults = useMemo(() => {
    if (!studentResults || !profile || !studentData) return [];
    return groupStudentResultsByTerm(
      studentResults,
      profile.full_name,
      studentData.reg_number,
      studentData.departments.name || studentData.departments.code,
      studentData.admission_year,
      undefined,
    );
  }, [studentResults, profile, studentData]);

  useEffect(() => {
    if (termResults.length > 0 && !selectedSemester) {
      setSelectedSemester(termResults[0].id);
    }
  }, [selectedSemester, termResults]);

  const selectedResult = useMemo(() => {
    return (
      termResults.find((term) => term.id === selectedSemester) || termResults[0]
    );
  }, [selectedSemester, termResults]);

  const normalizedCourses = useMemo(() => {
    if (!selectedResult) return [];
    return selectedResult.courses.map((course) => ({
      ...course,
      grade: toGradeLetter(computeGrade(course.total)),
    }));
  }, [selectedResult]);

  const semesterCgpa = useMemo(() => {
    return calculateCgpaFromGrades(
      normalizedCourses.map((course) => ({
        unit: course.unit,
        grade: course.grade,
      })),
    );
  }, [normalizedCourses]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      let logoBuffer: ArrayBuffer | undefined;
      try {
        const response = await fetch("/images/logo.png");
        if (response.ok) logoBuffer = await response.arrayBuffer();
      } catch {
        logoBuffer = undefined;
      }

      if (selectedResult) {
        await downloadSemesterResultPdf(
          { ...selectedResult, courses: normalizedCourses },
          semesterCgpa,
          logoBuffer,
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || resultsLoading) {
    return <StudentResultsSkeleton />;
  }

  if (!profile || !studentData) {
    return (
      <SomethingWentWrong message="Unable to load your student profile." />
    );
  }

  if (resultsError) {
    return (
      <DashboardContainer>
        <Header
          heading="My Results"
          subHeading="Select semester, review grades, and export a PDF result slip."
          icon="ArrowDownToLine"
          onClick={() => undefined}
        />
        <SomethingWentWrong message="Unable to fetch results. Please try again later." />
      </DashboardContainer>
    );
  }

  const hasResults = termResults.length > 0;

  return (
    <DashboardContainer>
      <Header
        heading="My Results"
        subHeading="Select semester, review grades, and export a PDF result slip."
        icon="ArrowDownToLine"
        onClick={handleExportPdf}
      />

      {hasResults ? (
        <>
          <div className={styles.exportCard}>
            <div>
              <h3 className={styles.exportTitle}>
                Download Official Result Slip
              </h3>
              <p className={styles.exportSubtitle}>
                Export the selected semester as a ready-to-share PDF document.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className={styles.exportButton}
            >
              {isExporting ? "Exporting..." : "Export as PDF"}
            </button>
          </div>

          <div className={`dashboard-container ${styles.controls}`}>
            <div className={styles.semesterField}>
              <label
                htmlFor="semester"
                className="secondary-heading text-[var(--color-text-dark)]"
              >
                Session / Semester
              </label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
                className="w-full mt-8 py-12 px-12 rounded-small border-light secondary-heading input"
              >
                {termResults.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`dashboard-container ${styles.tableWrap}`}>
            <table className="table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credit Unit</th>
                  <th>Test</th>
                  <th>Lab</th>
                  <th>Exam</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {normalizedCourses.map((course) => (
                  <tr key={course.courseCode}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{course.unit}</td>
                    <td>{course.test}</td>
                    <td>{course.lab}</td>
                    <td>{course.exam}</td>
                    <td>{course.total}</td>
                    <td>
                      <GradeBadge grade={course.grade} />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={8} className={styles.cgpaCell}>
                    Semester CGPA: {formatCgpa(semesterCgpa)} / 5.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          item="results"
          message="No published results are available yet. Your advisor may not have released grades for this semester."
        />
      )}
    </DashboardContainer>
  );
}

("Help me lord to fo your wull");
