"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function protectDashboardAccess(role: "student" | "advisor") {
  const { profile, loading, isStudent, isAdvisor, isAdmin, authInitialized } = useAuth();
  const router = useRouter();

  console.log(loading, profile, "From protected dahsboard");

  useEffect(() => {
    if (loading || !authInitialized) return; // Still loading, don't redirect yet

    if (!profile) {
      router.replace(role === "student" ? "/student/auth" : "/advisor/auth");
      return;
    }

    if (profile?.role !== role && !isAdmin) {
      router.replace("/unauthorized");
      return;
    }
  }, [loading, profile, isStudent, router, role, isAdvisor, isAdmin, authInitialized]);

  // Get the authenticated user
  // Use getUser() not getSession() - getUser()

  return;
}
