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
    console.log(loginError.message);
    if (loginError.message === "Failed to fetch") {
      throw new Error("Failed to fetch, check your internet connection");
    }
    throw new Error("Incorrect email or password.");
    return;
  }

  // Step 2: Confirm they are an advisor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
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
    throw new Error("Failed to send verification code. Try again.");
  }

  // STep 5: Switch to OTP screen
};
