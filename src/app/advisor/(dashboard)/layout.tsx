import { protectDashboardAccess } from "@/helpers/protectStudentDashboardAccess";
import { Providers } from "@/app/providers";
import AdvisorDashboardShell from "@/components/shells/advisorDashboardShell";

export default async function AdvisorMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await protectDashboardAccess("advisor");

  return (
    <Providers role="advisor">
      <AdvisorDashboardShell>{children}</AdvisorDashboardShell>
    </Providers>
  );
}
