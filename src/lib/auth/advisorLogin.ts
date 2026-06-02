import { errorThrowHandler } from "@/helpers/errorHandler";
import { createSupabaseClient } from "../supabase/client";
import { requestTimeout } from "@/helpers/requestTimeout";

export const handleCredentials = async (data: {
  role: "advisor" | "admin";
  email: string;
  password: string;
}) => {
  const supabase = createSupabaseClient();

  // STep1: Verify email + Pasword
  const { data: authData, error: loginError } = await Promise.race([
    supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    }),
    requestTimeout(25000, "Login took too long.Reload and try again"),
  ]);

  if (loginError) {
    errorThrowHandler(
      loginError?.message,
      "Invalid email or password. Please try again.",
    );
  }

if (data.role === "advisor") {
    // Step 2: Confirm they are an advisor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData?.user?.id)
    .single();

  if (profile?.role !== "advisor") {
    await supabase.auth.signOut();
    throw new Error("Access denied. This is for advisors only.");
  }

  // Step 3: SIgn out of password session temporarily
  // Not fully authenticated until OTP is confirmed.
  await supabase.auth.signOut();
} else if (data.role === "admin") {
    // Step 2: Confirm they are an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData?.user?.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Access denied. This is for admins only. How did you even get here?");
  }

  // Step 3: SIgn out of password session temporarily
  // Not fully authenticated until OTP is confirmed.
  await supabase.auth.signOut();
}

  // Step 4: Send OTP to their email
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: false,
    }, //never create new user
  });

  if (otpError) {
    errorThrowHandler(otpError, "Failed to send OTP. Please try again.");
  }

  // STep 5: Switch to OTP screen
};


// NOTE/TO-DO : This is a temporary solution to handle both advisor and admin login in one form. We can create a separate admin login form and remove the role prop when we have that ready. For now, this allows us to have a working admin login without having to create a new form and flow.