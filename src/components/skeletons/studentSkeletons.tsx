import "@aejkatappaja/phantom-ui";
import { DashboardContainer } from "@/components/secondary/common";
import { StudentStatCard } from "@/components/statsCards/studentStatCard";
import styles from "./skeletons.module.scss";
import AreaChart from "../chart";
import { buildStudentChartData } from "@/utils/studentResults";
import { resultData } from "@/mock/resultsData";
import { gpas } from "@/utils/studentDashboardStats";
import { Header } from "../secondary/header";
import { GradeBadge } from "../pages/student/GradeBadge";

export function StudentDashboardSkeleton() {
  const labels = resultData.map((semester) => {
    const semesterOb = {
      semester: semester.semester.toLowerCase() === "harmattan" ? "1st" : "2nd",
      level: semester.student.level.split(" ")[0],
    };
    return `${semesterOb.level} ${semesterOb.semester}`;
  });

  return (
    <phantom-ui stagger={2} loading={true}>
      <div className="dashboard-main-container">
        <div className={styles.heroCard}>
          <div className={styles.heroTitleBlock}>
            <h1 className={styles.heroTitle}>Welcome back, Emmanuel Jare</h1>
            <h3 className={styles.heroSubtitle}>
              Mechatronics Department • Academic Session 2025/2026
            </h3>
          </div>

          <button className={styles.heroButton}>View Results</button>
        </div>

        <>
          <div className={styles.statsGrid}>
            <StudentStatCard
              title="Current CGPA"
              count={0}
              subText="Published results"
              icon="Trophy"
              color="blue"
            />
            <StudentStatCard
              title="Total Credits"
              count={2}
              subText="Completed units"
              icon="Book"
              color="green"
            />
            <StudentStatCard
              title="Semesters"
              count={2}
              subText="Published terms"
              icon="Calendar"
              color="purple"
            />
            <StudentStatCard
              title="Current Level"
              value={"300"}
              subText="Based on active term"
              icon="RefreshCcwIcon"
              color="brown"
            />
          </div>

          <div className="dashboard-container">
            <AreaChart labels={labels} dataPoints={gpas} />
          </div>
        </>
      </div>
    </phantom-ui>
  );
}

export function StudentResultsSkeleton() {
  const normalizedCourses = [
    {
      courseCode: "MEE301",
      courseTitle: "Control Systems",
      unit: 3,
      test: 17,
      lab: 18,
      exam: 42,
      total: 77,
      grade: "A",
    },
    {
      courseCode: "MEE303",
      courseTitle: "Machine Design",
      unit: 3,
      test: 14,
      lab: 15,
      exam: 36,
      total: 65,
      grade: "B",
    },
    {
      courseCode: "MEE305",
      courseTitle: "Thermodynamics II",
      unit: 2,
      test: 15,
      lab: 16,
      exam: 38,
      total: 69,
      grade: "B",
    },
  ];
  return (
    <phantom-ui loading={true}>
      <DashboardContainer>
        <Header
          heading="My Results"
          subHeading="Select semester, review grades, and export a PDF result slip."
          button="Export as PDF"
          icon="ArrowDownToLine"
          onClick={() => {}}
        />
        <div className={styles.exportCard}>
          <div>
            <h3 className={styles.exportTitle}>
              Download Official Result Slip
            </h3>
            <p className={styles.exportSubtitle}>
              Export the selected semester as a ready-to-share PDF document.
            </p>
          </div>
          <button type="button" className={styles.exportButton}>
            {"Export as PDF"}
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
              value={"2023/2024 - Harmattan"}
              onChange={() => {}}
              className="w-full mt-8 py-12 px-12 rounded-small border-light secondary-heading input"
            ></select>
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
                    <GradeBadge grade={"B"} />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={8} className={styles.cgpaCell}>
                  Semester CGPA: 3.5 / 5.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardContainer>
    </phantom-ui>
  );
}
