import AdvisorDashboardShell from "@/components/shells/advisorDashboardShell";

export const metadata = {
  title: "Advisor Dashboard",
  description: "Advisor Dashboard - for managing students, courses, and more.",
};

export default async function AdvisorMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdvisorDashboardShell>{children}</AdvisorDashboardShell>;
}
