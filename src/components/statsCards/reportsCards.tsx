import ReportBar from "../secondary/reportBar";

type ReportCardProps = {
  title: string;
  color: "brown" | "green" | "red";
  items: string;
  date: string;
  status: string;
};

const reports: ReportCardProps[] = [
  {
    title: "2023/2024 - Harmattan",
    color: "green",
    items: "8 courses",
    date: "2024-01-17",
    status: "Completed",
  },
  {
    title: "2023/2024 - Rain",
    color: "brown",
    items: "7 courses",
    date: "2024-07-10",
    status: "In Progress",
  },
  {
    title: "2024/2025 - Harmattan",
    color: "red",
    items: "9 courses",
    date: "2025-01-22",
    status: "Failed",
  },
];

export function ReportCards() {
  return (
    <div className="flex flex-col  gap-16">
      {reports.map((report, index) => (
        <ReportBar {...report} key={index} />
      ))}
    </div>
  );
}
