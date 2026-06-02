import toast from "react-hot-toast";
import { AuthCTABtn } from "../secondary/buttons";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { errorToastHandler } from "@/helpers/errorHandler";
import { set } from "zod";

type forgotPasswordProps = {
  role: "student" | "advisor" | "admin";
  setForgotPasswordMode: React.Dispatch<React.SetStateAction<boolean>>;
  forgotPasswordMode: boolean;
};

export function ForgotPaasswordForm({
  role,
  setForgotPasswordMode,
  forgotPasswordMode,
}: forgotPasswordProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleForgotPasswordMode = () => {
    setForgotPasswordMode(!forgotPasswordMode);
    setTimeout(() => {
      window.scrollTo({
        top: forgotPasswordMode ? 0 : document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 200);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    setEmailError(null);

    const supabase = createSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/${role}/set-password`,
    });

    if (error) {
      setIsLoading(false);
      errorToastHandler(
        error,
        "An error occurred while sending the reset link. Please try again.",
      );
      return;
    }

    toast.success(
      "If an account exists with this email, a reset link has been sent.",
    );
    setEmail("");
    setIsLoading(false);
    setForgotPasswordMode(false);
  };

  return (
    <form
      noValidate
      onSubmit={handleForgotPassword}
      className="md:mt-[1rem] mt-[0.7rem] w-full flex flex-col gap-12  border-t-[2px] border-t-solid  border-t-[var(--color-border-light)] pt-24"
    >
      <h1
        onClick={toggleForgotPasswordMode}
        className={`cursor-pointer ${!forgotPasswordMode ? "underline text-[var(--color-primary)]" : "text-black"}`}
      >
        Forgot Password?
      </h1>

      {forgotPasswordMode && (
        <>
          <div className="field mb-13" id="email">
            <div className="input">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* Error */}
              {emailError && (
                <p className="error" role="alert">
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <AuthCTABtn isSubmitting={isLoading} CTA={() => {}}>
            Send Reset Link
          </AuthCTABtn>
        </>
      )}
    </form>
  );
}
