"use client";

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
import { useMemo, useState } from "react";
import { resultData } from "@/mock/resultsData";
import { ArrowDownToLine } from "lucide-react";
import styles from "./results.module.scss";

export default function StudentResultsPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>(
    resultData[0].id,
  );
  const [isExporting, setIsExporting] = useState(false);

  // Isolates selected result set for easier replacement with server data later.
  const selectedResult = useMemo(
    () =>
      resultData.find((item) => item.id === selectedSemester) ?? resultData[0],
    [selectedSemester],
  );

  // Recomputes grades from total to ensure grade logic stays synced with utils.
  const normalizedCourses = selectedResult.courses.map((course) => {
    const computed = toGradeLetter(computeGrade(course.total));
    return { ...course, grade: computed };
  });

  const semesterCgpa = calculateCgpaFromGrades(
    normalizedCourses.map((course) => ({
      unit: course.unit,
      grade: course.grade,
    })),
  );

  const handleExportPdf = async () => {
    // Creates and downloads a real PDF file (no print popup dependency).
    setIsExporting(true);
    try {
      // Logo is optional. If the file is missing, export still proceeds gracefully.
      let logoBuffer: ArrayBuffer | undefined;
      try {
        const response = await fetch("/images/logo.png");
        if (response.ok) logoBuffer = await response.arrayBuffer();
      } catch {
        logoBuffer = undefined;
      }

      downloadSemesterResultPdf(
        { ...selectedResult, courses: normalizedCourses },
        semesterCgpa,
        logoBuffer,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardContainer>
      <Header
        heading="My Results"
        subHeading="Select semester, review grades, and export a PDF result slip."
        button="Export as PDF"
        icon="ArrowDownToLine"
        onClick={handleExportPdf}
      />

      {/* <div className={styles.exportCard}>
        <div>
          <h3 className={styles.exportTitle}>Download Official Result Slip</h3>
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
          <ArrowDownToLine size={18} />
          {isExporting ? "Exporting..." : "Export as PDF"}
        </button>
      </div> */}

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
            {resultData.map((result) => (
              <option key={result.id} value={result.id}>
                {result.label}
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
    </DashboardContainer>
  );
}
