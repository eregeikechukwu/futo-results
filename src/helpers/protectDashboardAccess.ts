"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function protectDashboardAccess(role: "student" | "advisor") {
  const { profile, loading, isStudent, isAdvisor, isAdmin } = useAuth();
  const router = useRouter();

  console.log(loading, profile, "From protected dahsboard");

  useEffect(() => {
    if (loading) return; // Still loading, don't redirect yet
    console.log(loading, "From protected dahsboard 3");

    if (!profile) {
      router.replace(role === "student" ? "/student/auth" : "/advisor/auth");
    }

    if (profile?.role !== role && !isAdmin) {
      router.replace("/unauthorized");
    }
  }, [loading, profile, isStudent, router, role, isAdvisor, isAdmin]);

  // Get the authenticated user
  // Use getUser() not getSession() - getUser()

  return { profile, loading, isStudent, isAdvisor, isAdmin };
}
