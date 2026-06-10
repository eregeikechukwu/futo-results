"use client";

import AreaChart from "@/components/chart";
import { EmptyState } from "@/components/secondary/EmptyState";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { StudentDashboardSkeleton } from "@/components/skeletons/studentSkeletons";
import { StudentStatCard } from "@/components/statsCards/studentStatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentResults } from "@/lib/hooks/useResults";
import { useActiveTerm } from "@/lib/hooks/useAcademicTerms";
import {
  buildStudentChartData,
  buildStudentDashboardStats,
  groupStudentResultsByTerm,
} from "@/utils/studentResults";
import { errorToastHandler } from "@/helpers/errorHandler";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import styles from "./dashboard.module.scss";

export default function StudentDashboard() {
  const { loading, profile, studentData } = useAuth();
  const {
    data: activeTerm,
    isLoading: activeTermLoading,
    error: activeTermError,
    
  } = useActiveTerm();

  const {
    data: studentResults,
    isLoading: resultsLoading,
    error: resultsError,
    refetch: refetchResults,
  } = useStudentResults(studentData?.id || "");

  useEffect(() => {
    if (resultsError) {
      errorToastHandler(resultsError, "Failed to load published results.");
    }
    if (activeTermError) {
      errorToastHandler(
        activeTermError,
        "Failed to load academic session details.",
      );
    }
  }, [activeTermError, resultsError]);

  const isLoading = loading || resultsLoading || activeTermLoading;

  const termResults = useMemo(() => {
    if (!studentResults || !profile || !studentData) return [];
    return groupStudentResultsByTerm(
      studentResults,
      profile.full_name,
      studentData.reg_number,
      studentData.departments.name || studentData.departments.code,
      studentData.admission_year,
      activeTerm?.session,
    );
  }, [studentResults, profile, studentData, activeTerm]);

  const dashboardStats = useMemo(() => {
    return buildStudentDashboardStats(
      termResults,
      studentData?.admission_year || 0,
      activeTerm?.session,
    );
  }, [termResults, studentData?.admission_year, activeTerm]);

  console.log(studentResults, " ---- Students results brotehre");

  const chartData = useMemo(() => {
    return buildStudentChartData(termResults);
  }, [termResults]);

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (!profile || !studentData) {
    return (
      <SomethingWentWrong message="Unable to load your student profile." />
    );
  }

  if (resultsError || activeTermError) {
    return (
      <SomethingWentWrong
       retry={
refetchResults
       } message="Unable to load your dashboard. Please try again." />
    );
  }

  const hasResults = termResults.length > 0;
  const departmentLabel =
    studentData.departments.name || studentData.departments.code;

  return (
    <div className="dashboard-main-container">
      <div className={styles.heroCard}>
        <div className={styles.heroTitleBlock}>
          <h1 className={styles.heroTitle}>
            Welcome back, {profile.full_name}
          </h1>
          <h3 className={styles.heroSubtitle}>
            {departmentLabel} Department • Academic Session{" "}
            {activeTerm?.session || "N/A"}
          </h3>
        </div>

        <Link href="/student/results">
          <button className={styles.heroButton}>View Results</button>
        </Link>
      </div>

      {hasResults ? (
        <>
          <div className={styles.statsGrid}>
            <StudentStatCard
              title="Current CGPA"
              count={Number(dashboardStats.cumulativeGpa.toFixed(2))}
              subText="Published results"
              icon="Trophy"
              color="blue"
            />
            <StudentStatCard
              title="Total Credits"
              count={dashboardStats.totalUnits}
              subText="Completed units"
              icon="Book"
              color="green"
            />
            <StudentStatCard
              title="Semesters"
              count={dashboardStats.completedSemesters}
              subText="Published terms"
              icon="Calendar"
              color="purple"
            />
            <StudentStatCard
              title="Current Level"
              value={dashboardStats.currentLevel}
              subText="Based on active term"
              icon="RefreshCcwIcon"
              color="brown"
            />
          </div>

          <div className="dashboard-container">
            <AreaChart
              labels={chartData.labels}
              dataPoints={chartData.values}
            />
          </div>
        </>
      ) : (
        <div className="dashboard-container">
          <EmptyState
            item="results"
            message="No published results are available yet. Your advisor may not have released your grades for this term."
          />
        </div>
      )}
    </div>
  );
}
