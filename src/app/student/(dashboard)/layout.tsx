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

export default function StudentsMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout user="student" links={links}>
      <div>
        {/* Nav */}
        <div className={styles.topBar}>
          {/* Title */}
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>Welcome, Nelson Erege</h1>
            <h2 className={styles.subTitle}>
              20231456334
            </h2>
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
