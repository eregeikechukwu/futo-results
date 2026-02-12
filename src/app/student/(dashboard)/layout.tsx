import Notification from "@/components/secondary/notification";
import { DashboardLayout } from "@/layouts/DashboardLayout";

const links = [
  { name: "dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
  {
    name: "Results",
    href: "/student/results",
    icon: "FileChartColumnIncreasing",
  },
  {
    name: "CGPA Calculator",
    href: "/student/cgpa-calculator",
    icon: "Calculator",
  },
  { name: "Profile", href: "/student/profile", icon: "User2" },

  { name: "Logout", href: "/advisor/auth", icon: "Logout" },
];

export default function StudentsMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout user="student" links={links}>
      <div>
        {/* Nav */}
        <div className="fixed top-0 z-20 h-[var(--nav-height)] bg-[var(--color-white)] shadow-sm px-32 w-[calc(100vw-var(--sidebar-width))] flex items-center justify-between">
          {/* Title */}
          <div className="flex flex-col ">
            <h1 className="text-medium">Welcome, Nelson Erege</h1>
            <h2 className="text-[var(--color-text-passive)] secondary-heading">
              20231456334
            </h2>
          </div>

          {/* NOtification */}
          <div>
            <Notification count={0} />
          </div>
        </div>

        {/* Pages content */}
        <div className="p-32 w-full !mt-[var(--nav-height)]">{children}</div>
      </div>
    </DashboardLayout>
  );
}
