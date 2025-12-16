import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Notification from "@/components/secondary/notification";

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
  { name: "Reports", href: "/advisor/under-construction", icon: "File" },
  { name: "Settings", href: "/advisor/under-construction", icon: "Settings" },
  { name: "Logout", href: "/advisor/auth", icon: "Logout" },
];

export default function AdvisorMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout links={links}>
      <div>
        <div className="fixed top-0 z-20 h-[var(--nav-height)] bg-[var(--color-white)] shadow-sm px-32 w-full flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-medium">Dr. Emmanuel Erege</h1>
            <h2 className="text-[var(--color-text-passive)] secondary-heading">
              Mechatronics Engineering Department
            </h2>
          </div>

          {/* Notification and profile */}
          <div className="flex gap-24 items-center">
            <Notification />
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
