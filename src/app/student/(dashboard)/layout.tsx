import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Providers } from "@/app/providers";
import { StudentsDashboardShell } from "@/components/shells/studentsDashboardShell";
import { protectDashboardAccess } from "@/helpers/protectStudentDashboardAccess";

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

export default async function StudentsMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await protectDashboardAccess("student");
  const supabase = await createSupabaseServerClient();

  // Blocking UI until mount to prevent hydration mismatch
  // const isDomMounted = useOnMount();

  // if (!isDomMounted) {
  //   return <LoaderSpinner1 color="black" size={70} />; // or a loading spinner
  // }

  // // Fetch student data
  // const { data: student } = await supabase
  //   .from("students")
  //   .select(
  //     `id, reg_number, admission_year, status, profiles!inner (full_name, email), departments!inner (name, code)`,
  //   )
  //   .eq("profile_id", user.id)
  //   .single();

  // Calculate current level from active term
  const { data: term } = await supabase
    .from("academic_terms")
    .select("session")
    .eq("is_active", true)
    .single();

  return (
    <Providers role="student">
      <StudentsDashboardShell>{children}</StudentsDashboardShell>
    </Providers>
  );
}
