"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProtectDashboardAccess(
  role: "student" | "advisor" | "admin",
) {
  const { profile, loading, isStudent, isAdvisor, isAdmin, authInitialized } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !authInitialized) return; // Still loading, don't redirect yet

    if (!profile) {
      console.log("we are here agaon");
      router.replace(
        role === "student"
          ? "/student/auth"
          : role === "advisor"
            ? "/advisor/auth"
            : "/admin/auth",
      );
      return;
    }

    if (profile?.role !== role && !isAdmin) {
      router.replace("/unauthorized");
      return;
    }
  }, [
    loading,
    profile,
    isStudent,
    router,
    role,
    isAdvisor,
    isAdmin,
    authInitialized,
  ]);

  // Get the authenticated user
  // Use getUser() not getSession() - getUser()

  return;
}
