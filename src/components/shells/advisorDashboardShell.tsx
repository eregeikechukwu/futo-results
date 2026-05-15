"use client";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import Notification from "@/components/secondary/notification";
import { DesktopOnly } from "@/components/pages/desktopOnly";
import { useOnMount } from "@/app/hooks/useOnMount";
import { LoaderSpinner1 } from "@/components/secondary/loaders/loaders";
import { useDesktopOnly } from "@/app/hooks/useDesktopOnly";

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
  { name: "Logout", href: "/advisor/auth", icon: "Logout" },
];

export default function AdvisorDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // BLocking UI onsmall screens
  const isSmallScreen = useDesktopOnly();

  // Blocking UI until mount to prevent hydration mismatch
  const isDomMounted = useOnMount();

  if (!isDomMounted) {
    return <LoaderSpinner1 color="black" size={70} />; // or a loading spinner
  }

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
            <h1 className="text-medium">Dr. Emmanuel Erege</h1>
            <h2 className="text-[var(--color-text-passive)] secondary-heading">
              Mechatronics Engineering Department
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
