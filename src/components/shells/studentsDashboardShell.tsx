"use client";

import Notification from "@/components/secondary/notification";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import styles from "./studentLayout.module.scss";
import { useProtectDashboardAccess } from "@/helpers/useProtectDashboardAccess";
import {
  BigLoader,
  LoaderSpinner1,
  LoaderSpinner3,
} from "../secondary/loaders/loaders";
import { useAuth } from "@/contexts/AuthContext";

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

export function StudentsDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("WHhats even the poin to f all these");

  // Protect the dashboard
  useProtectDashboardAccess("student");
  const { loading } = useAuth();

  // Show nothing or loader  before profile is been fetched to prevent hydration mismatch
  if (loading)
    return (
      <>
        <BigLoader />
      </>
    );

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
