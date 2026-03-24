import AreaChart from "@/components/chart";
import { StudentStatCard } from "@/components/statsCards/studentStatCard";
import { studentsDashboardStats } from "@/utils/studentDashboardStats";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="dashboard-main-container">
      {/* TOp hero title card */}
      <div className="flex-col justify-start gap-24 p-32 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex-col gap text-white gap-8">
          <h1 className="text-extra-large font-bold">
            Welcome back, Nelson Erege
          </h1>
          <h3 className="leading-[1.6667rem]">
            Here's an overview of your academic performance.
          </h3>
        </div>

        {/* Button */}
        <Link href={"/student/results"}>
          <button className="text-[var(--color-primary)] bg-white px-24 py-12 rounded-xl font-[600] w-max cursor-pointer hover:bg-gray-100 active:opacity-80 transition-all">
            View Results
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-24">
        {studentsDashboardStats.map((stat) => (
          <StudentStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* GPA progress */}
      <AreaChart />

      {/* Heading or CTA */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax())]">
        <div className="dashboard-container"></div>
      </div>
    </div>
  );
}
