'use client';

import { StudentsDashboardShell } from "@/components/shells/studentsDashboardShell";

export default function StudentsMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentsDashboardShell>{children}</StudentsDashboardShell>;
}
