import { SignupFormData } from "@/app/types/auth";
import { supabase } from "../supabase";
import { errorThrowHandler } from "@/helpers/errorHandler";

export async function handleSignUp(
  data: SignupFormData,
  setMode: (mode: "login" | "sign-up") => void,
  reset: () => void,
) {
  console.log("form data: ", data);

  // Step 1: check preregistration before creating anything
  const { data: preregData, error: preregError } = await supabase
    .from("student_preregistrations")
    .select("id")
    .eq("reg_number", data.regNumber)
    .eq("email", data.email)
    .eq("claimed", false)
    .maybeSingle();

  if (preregError || !preregData) {
    console.error(preregError + " ... Error");
    alert(preregError?.message);
    errorThrowHandler(
      preregError,
      "Your email and reg number do not match our preregistration records. Contact your advisor.",
    );
    throw new Error(preregError?.message);
    throw new Error(preregError?.message);
  }

  // step2: Create the auth account
  const { data: userData, error: signupError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: {
        full_name: data.fullname,
        reg_number: data.regNumber,
        role: "student",
      },
    },
  });

  if (signupError || !userData) {
    errorThrowHandler(
      signupError,
      "An error occurred during signup. Please try again.",
    );
    throw new Error(signupError?.message);
  }

  // Step SHow check your email message
  // The students rwo creation and claimed=true happen in  /auth/confirm
  // When the student clicks the link - NOT here

  setMode("login");
}
