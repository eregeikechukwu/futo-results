import { StudentsDashboardShell } from "@/components/shells/studentsDashboardShell";

export default async function StudentsMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // async function changeName() {
  //   const { error } = await supabase.auth.updateUser({
  //     email: "eregeikechukwu+student2@gmail.com",
  //     data: {
  //       email: "eregeikechukwu+student2@gmail.com",
  //       full_name: "Dikko Chinedu Oladapo",
  //     },
  //   });
  //   if (error) console.error(error);
  // }

  return <StudentsDashboardShell>{children}</StudentsDashboardShell>;
}
