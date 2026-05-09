import { errorThrowHandler } from "@/helpers/errorHandler";
import { createSupabaseClient } from "../supabase/client";

export const handleCredentials = async (data: {
  email: string;
  password: string;
}) => {
  const supabase = createSupabaseClient();

  // STep1: Verify email + Pasword
  const { data: authData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (loginError) {
    errorThrowHandler(
      loginError?.message,
      "Invalid email or password. Please try again.",
    );
  }

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
