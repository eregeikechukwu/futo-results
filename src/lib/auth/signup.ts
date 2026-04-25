import { SignupFormData } from "@/app/types/auth";
import toast from "react-hot-toast";
import { supabase } from "../supabase";

export async function handleSignUp(
  data: SignupFormData,
  setMode: React.Dispatch<React.SetStateAction<string>>,
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
    console.log(preregError, " Error");
    if (preregError?.message === "Failed to fetch") {
      throw new Error("Failed to fetch, check your internet connection");
    } else
      throw new Error(
        "Your email and reg number do not match our preregistration records. Contact your advisor.",
      );
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
    throw new Error(
      //   signupError?.message ||
      "An error occurred during signup. Please try again.",
    );
  }

  // Step SHow check your email message
  // The students rwo creation and claimed=true happen in  /auth/confirm
  // When the student clicks the link - NOT here

  toast.success("Check you email for a confirmation link!");
  setMode("login");
}
