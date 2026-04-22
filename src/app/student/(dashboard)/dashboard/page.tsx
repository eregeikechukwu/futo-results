import AreaChart from "@/components/chart";
import { StudentStatCard } from "@/components/statsCards/studentStatCard";
import { studentsDashboardStats } from "@/utils/studentDashboardStats";
import Link from "next/link";
import styles from "./dashboard.module.scss";

export default function StudentDashboard() {
  return (
    <div className="dashboard-main-container">
      {/* TOp hero title card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTitleBlock}>
          <h1 className={styles.heroTitle}>
            Welcome back, Nelson Erege
          </h1>
          <h3 className={styles.heroSubtitle}>
            Here's an overview of your academic performance.
          </h3>
        </div>

        {/* Button */}
        <Link href={"/student/results"}>
          <button className={styles.heroButton}>
            View Results
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {studentsDashboardStats.map((stat) => (
          <StudentStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* GPA progress */}
      <AreaChart />

      {/* Heading or CTA */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        <div className={`dashboard-container ${styles.bottomSpacer}`}></div>
      </div>
    </div>
  );
}
