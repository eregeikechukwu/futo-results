import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function protectDashboardAccess(role: "student" | "advisor") {
  const supabase = await createSupabaseServerClient();

  // Get the authenticated user
  // Use getUser() not getSession() - getUser() validates the JWt
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    console.log(error);
    redirect(role === "student" ? "/student/auth" : "/advisor/auth");
  } else {
    console.log(user);
  }

  // Check they are actually a student
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== role) redirect("/unauthorized");

  return user;
}
