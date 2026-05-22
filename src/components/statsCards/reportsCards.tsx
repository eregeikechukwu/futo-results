import ReportBar from "../secondary/reportBar";

/**
 * Props for a single report card
 * Used to display upload batches, submissions, or other report items
 */
type ReportCardProps = {
  title: string;
  color: "brown" | "green" | "red";
  coursecode: string;
  date: string;
  status: string;
};

/**
 * Displays a list of report cards (recent uploads, batches, submissions, etc.)
 *
 * The reports prop allows this component to be flexible:
 * - Pass hardcoded reports for static UI testing
 * - Pass real data from React Query hooks for production
 * - Pass empty array to show "no reports" state
 *
 * @param reports - Array of report data to display. If not provided, shows default empty state.
 *
 * Usage:
 * ```tsx
 * // With real data from hook
 * const { data: batches } = useRecentBatches(advisorId);
 * const reports = batches?.map(batch => ({
 *   title: batch.title,
 *   color: batch.color,
 *   items: batch.items,
 *   date: batch.createdAt.split('T')[0],
 *   status: batch.statusLabel
 * })) || [];
 *
 * return <ReportCards reports={reports} />;
 *
 * // Or with default fallback
 * <ReportCards reports={reports || defaultReports} />
 * ```
 */
export function ReportCards({ reports = [] }: { reports?: ReportCardProps[] }) {
  // Fallback default reports if empty (for UI consistency during loading)
  const defaultReports: ReportCardProps[] = [
    {
      title: "2023/2024 - Harmattan",
      color: "green",
      coursecode: "GET203",
      date: "2024-01-17",
      status: "Completed",
    },
    {
      title: "2023/2024 - Rain",
      color: "brown",
      coursecode: "GET207",
      date: "2024-07-10",
      status: "In Progress",
    },
    {
      title: "2024/2025 - Harmattan",
      color: "red",
      coursecode: "GET210",
      date: "2025-01-22",
      status: "Failed",
    },
  ];

  console.log(reports, "reports");

  // Use provided reports if available, otherwise use defaults
  const displayReports = reports.length > 0 ? reports : defaultReports;

  return (
    <div className="flex flex-col  gap-16">
      {displayReports.map((report, index) => (
        <ReportBar {...report} key={index} />
      ))}
    </div>
  );
}
