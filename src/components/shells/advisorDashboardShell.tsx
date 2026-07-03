"use client";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import Notification from "@/components/secondary/notification";
import { DesktopOnly } from "@/components/pages/desktopOnly";
import { BigLoader } from "@/components/secondary/loaders/loaders";
import { useDesktopOnly } from "@/app/hooks/useDesktopOnly";
import { useProtectDashboardAccess } from "@/helpers/useProtectDashboardAccess";
import { useAuth } from "@/contexts/AuthContext";
import SomethingWentWrong from "../secondary/error/somethingWentWrong";

const links = [
  { name: "dashboard", href: "/advisor/dashboard", icon: "LayoutDashboard" },
  { name: "Manage Students", href: "/advisor/students", icon: "Users" },
  { name: "Manage Courses", href: "/advisor/courses", icon: "Book" },
  { name: "Upload Results", href: "/advisor/upload-results", icon: "Upload" },
  { name: "Manage Results", href: "/advisor/results", icon: "FileBarChart2" },
  // {
  //   name: "Sessions & Levels",
  //   href: "/advisor/under-construction",
  //   icon: "Calendar",
  // },
  { name: "Office Hours", href: "/advisor/office-hours", icon: "Clock" },
  { name: "Reports", href: "/advisor/under-construction", icon: "File" },
  // { name: "Settings", href: "/advisor/under-construction", icon: "Settings" },
  { name: "Logout", href: "", icon: "Logout" },
];

export default function AdvisorDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSmallScreen = useDesktopOnly();

  useProtectDashboardAccess("advisor");

  const { loading, profile, advisorData } = useAuth();

  // Show nothing or loader  before profile is been fetched to prevent hydration mismatch
  if (loading)
    return (
      <>
        <BigLoader />
      </>
    );
  // BLocking UI onsmall screens

  if (isSmallScreen) {
    return <DesktopOnly />;
  }

  return (
    <DashboardLayout user="advisor" links={links}>
      <div>
        {/* Nav */}
        <div className="fixed top-0 z-20 h-(--nav-height) bg-(--color-white) shadow-sm px-32 w-[calc(100vw-var(--sidebar-width))] flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-medium">
              {advisorData?.title} {profile?.full_name}
            </h1>
            <h2 className="text-(--color-text-passive) secondary-heading">
              {advisorData?.advisor_assignments[0].departments.name} Department
            </h2>
          </div>

          {/* Notification and profile */}
          <div className="flex gap-24 items-center">
            <Notification count={2} />
            <span className="w-1 h-26 bg-(--color-border-light)]">
              &nbsp;
            </span>
            <div className="secondary-heading text-(--color-white) rounded-full bg-[var(--color-primary) center-child w-32 h-32 font-medium">
              EE
            </div>
          </div>
        </div>
        <div className="p-32 w-full mt-(--nav-height)!">{advisorData?.id? (children) : <SomethingWentWrong />}</div>
      </div>
    </DashboardLayout>
  );
}
