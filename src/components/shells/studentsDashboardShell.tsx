"use client";

import Notification from "@/components/secondary/notification";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import styles from "./studentLayout.module.scss";

const links = [
  { name: "dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
  {
    name: "Results",
    href: "/student/results",
    icon: "FileChartColumnIncreasing",
  },
  {
    name: "CGPA Calculator",
    href: "/student/cgpa-calculator",
    icon: "Calculator",
  },
  { name: "Profile", href: "/student/profile", icon: "User2" },

  { name: "Logout", href: "/advisor/auth", icon: "Logout" },
];

export  function StudentsDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {

  // Blocking UI until mount to prevent hydration mismatch
  // const isDomMounted = useOnMount();

  // if (!isDomMounted) {
  //   return <LoaderSpinner1 color="black" size={70} />; // or a loading spinner
  // }

  // // Fetch student data
  // const { data: student } = await supabase
  //   .from("students")
  //   .select(
  //     `id, reg_number, admission_year, status, profiles!inner (full_name, email), departments!inner (name, code)`,
  //   )
  //   .eq("profile_id", user.id)
  //   .single();

  // Calculate current level from active term
  return (
    <DashboardLayout user="student" links={links}>
      <div>
        {/* Nav */}
        <div className={styles.topBar}>
          {/* Title */}
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>Welcome, Nelson Erege</h1>
            <h2 className={styles.subTitle}>20231456334</h2>
          </div>

          {/* NOtification */}
          <div>
            <Notification count={0} />
          </div>
        </div>

        {/* Pages content */}
        <div className={styles.content}>{children}</div>
      </div>
    </DashboardLayout>
  );
}
