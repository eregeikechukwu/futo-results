"use client";

import { createSupabaseClient } from "../supabase/client";
import toast from "react-hot-toast";
import { LoginFormData } from "@/app/types/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Just shut the fuck up"));
    }, ms);
  });
}

export async function handleStudentLogin(
  data: LoginFormData,
  router: AppRouterInstance,
  reset: () => void,
) {
  const supabase = createSupabaseClient();
  let responded = false;

  const { data: authData, error } = await Promise.race([
    supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    }),
    timeout(5000),
  ]);

  if (authData) {
    responded = true;
  }

  if (error) {
    responded = true;
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
