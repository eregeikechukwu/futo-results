"use client";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import Notification from "@/components/secondary/notification";
import { DesktopOnly } from "@/components/pages/desktopOnly";
import { BigLoader } from "@/components/secondary/loaders/loaders";
import { useDesktopOnly } from "@/app/hooks/useDesktopOnly";
import { protectDashboardAccess } from "@/helpers/protectDashboardAccess";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { name: "dashboard", href: "/advisor/dashboard", icon: "LayoutDashboard" },
  { name: "Manage Students", href: "/advisor/students", icon: "Users" },
  { name: "Manage Courses", href: "/advisor/courses", icon: "Book" },
  { name: "Upload Results", href: "/advisor/upload-results", icon: "Upload" },
  {
    name: "Sessions & Levels",
    href: "/advisor/under-construction",
    icon: "Calendar",
  },
  // { name: "Reports", href: "/advisor/under-construction", icon: "File" },
  // { name: "Settings", href: "/advisor/under-construction", icon: "Settings" },
  { name: "Logout", href: "", icon: "Logout" },
];

export default function AdvisorDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  const isSmallScreen = useDesktopOnly();

  protectDashboardAccess("advisor");

  const { profile, advisorData } = useAuth();

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
        <div className="fixed top-0 z-20 h-[var(--nav-height)] bg-[var(--color-white)] shadow-sm px-32 w-[calc(100vw-var(--sidebar-width))] flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-medium">
              {advisorData?.title} {profile?.full_name}
            </h1>
            <h2 className="text-[var(--color-text-passive)] secondary-heading">
              {advisorData?.advisor_assignments[0].departments.name} Department
            </h2>
          </div>

          {/* Notification and profile */}
          <div className="flex gap-24 items-center">
            <Notification count={2} />
            <span className="w-1 h-26 bg-[var(--color-border-light)]">
              &nbsp;
            </span>
            <div className="secondary-heading text-[var(--color-white)] rounded-full bg-[var(--color-primary)] center-child w-32 h-32 font-medium">
              EE
            </div>
          </div>
        </div>
        <div className="p-32 w-full !mt-[var(--nav-height)]">{children}</div>
      </div>
    </DashboardLayout>
  );
}
