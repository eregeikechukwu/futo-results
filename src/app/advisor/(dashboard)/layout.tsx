import { protectDashboardAccess } from "@/helpers/protectDashboardAccess";
import AdvisorDashboardShell from "@/components/shells/advisorDashboardShell";

export default async function AdvisorMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = protectDashboardAccess("advisor");

  return <AdvisorDashboardShell>{children}</AdvisorDashboardShell>;
}
