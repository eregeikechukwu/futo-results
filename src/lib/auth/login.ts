"use client";

import { createSupabaseClient } from "../supabase/client";
import toast from "react-hot-toast";
import { LoginFormData } from "@/app/types/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function handleStudentLogin(
  data: LoginFormData,
  router: AppRouterInstance,
  reset: () => void,
) {
  const supabase = createSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // Map SUpabase error to friendly message
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid email or password.");
    } else if (error.message.includes("Email not confirmed")) {
      throw new Error("Please confirm your email first. Check your inbox.");
    } else {
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }

  reset();
  router.push("/student/dashboard");
}
