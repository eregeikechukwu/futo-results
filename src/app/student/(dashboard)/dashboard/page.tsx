import AreaChart from "@/components/chart";
import { StudentStatCard } from "@/components/statsCards/studentStatCard";
import { studentsDashboardStats } from "@/utils/studentDashboardStats";
import Link from "next/link";
import styles from "./dashboard.module.scss";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServerClient();

  // Get the authenticated user
  // Use getUser() not getSession() - getUser() validates the JWt
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/student/auth");

  // Check they are actually a student
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") redirect("/unauthorized");

  // Fetch student data
  const { data: student } = await supabase
    .from("students")
    .select(
      `id, reg_number, admission_year, status, profiles!inner (full_name, email), departments!inner (name, code)`,
    )
    .eq("profile_id", user.id)
    .single();

  // Calculate current level from active term
  const { data: term } = await supabase
    .from("academic_terms")
    .select("session")
    .eq("is_active", true)
    .single();

  // const activeYear = term ? parseInt(term.session.slice(0, 4)) : null;
  // const level =
  //   activeYear && student
  //     ? (activeYear - student.admission_year + 1) * 100
  //     : null;

  return (
    <div className="dashboard-main-container">
      {/* TOp hero title card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTitleBlock}>
          <h1 className={styles.heroTitle}>
            Welcome back, {student?.profiles[0]?.full_name}
          </h1>
          <h3 className={styles.heroSubtitle}>
            Here's an overview of your academic performance.
          </h3>
        </div>

        {/* Button */}
        <Link href={"/student/results"}>
          <button className={styles.heroButton}>View Results</button>
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
