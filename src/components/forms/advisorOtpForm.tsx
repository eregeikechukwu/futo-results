"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCTABtn, CustomBtn } from "../secondary/buttons";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Error } from "../secondary/common";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { LoginFormData } from "@/app/types/auth";
import { handleCredentials } from "@/lib/auth/advisorLogin";

// Supabase expects a 6-digit code sent to email
const advisorOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Code must contain only digits"),
});

const credentialsSchema = z.object({
  email: z.string().email("invalid email address"),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;
type AdvisorOtpFormData = z.infer<typeof advisorOtpSchema>;

export function AdvisorOtpForm({
  email,
  onBack,
  credentials,
}: {
  email: string;
  onBack: () => void;
  credentials?: LoginFormData | null;
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const canResend = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdvisorOtpFormData>({
    resolver: zodResolver(advisorOtpSchema),
  });

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setValue("otp", otpDigits.join(""));
  }, [otpDigits, setValue]);

  const handleVerifyOtp = async (data: AdvisorOtpFormData) => {
    const supabase = createSupabaseClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.otp,
      type: "email",
    });

    if (error) {
      if (error.message.includes("expired")) {
        toast.error("Code expired. Go back and sign in again.");
      } else {
        toast.error("Invalid code. Check your email and try again.");
      }
      return;
    }

    toast.success("Verified successfully!");
    // Redirect to dashboard after successful verification
    router.push("/advisor/dashboard");
  };

  //   Resendng for new email function
  const handleResend = async () => {
    if (!canResend) {
      return;
    }

    setIsResendLoading(true);
    try {
      if (!credentials) {
        toast.error("Email not found, go back and sign in again.");
        return;
      }
      await handleCredentials(credentials);
      toast.success("Check your email for new OTP");
      setSecondsLeft(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP, please try again");
    } finally {
      setIsResendLoading(false);
    }
  };

  const formattedCountdown = `00:${String(secondsLeft).padStart(2, "0")}`;

  return (
    <form onSubmit={handleSubmit(handleVerifyOtp)} className="w-full">
      <div className="flex flex-col gap-24 mb-24">
        <div className="flex items-center gap-12 mb-10">
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--color-blue-light)] hover:underline"
          >
            <span className="inline-flex items-center gap-8">
              <ArrowLeft width={18} height={18} /> Back
            </span>
          </button>
        </div>

        <div className="field">
          <label htmlFor="otp">
            <span>
              <KeyRound />
            </span>
            Verification Code
          </label>
          <div className="flex justify-between w-full gap-8" id="otp">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null): void => {
                  digitRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : undefined}
                maxLength={1}
                value={digit}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^0-9]/g, "");
                  if (!value) {
                    setOtpDigits((prev) => {
                      const next = [...prev];
                      next[index] = "";
                      return next;
                    });
                    return;
                  }

                  const nextValue = value.slice(0, 1);
                  setOtpDigits((prev) => {
                    const next = [...prev];
                    next[index] = nextValue;
                    return next;
                  });

                  if (nextValue && index < 5) {
                    digitRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Backspace" &&
                    !otpDigits[index] &&
                    index > 0
                  ) {
                    digitRefs.current[index - 1]?.focus();
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  const paste = event.clipboardData
                    .getData("text")
                    .replace(/[^0-9]/g, "")
                    .slice(0, 6);
                  if (!paste) {
                    return;
                  }
                  const next = [...otpDigits];
                  for (let i = 0; i < 6; i += 1) {
                    next[i] = paste[i] ?? "";
                  }
                  setOtpDigits(next);
                  const nextFocus = Math.min(paste.length, 5);
                  digitRefs.current[nextFocus]?.focus();
                }}
                className="h-[4rem] w-[4rem] text-center rounded-small border-[1.5px] border-solid border-[var(--color-primary)] bg-[var(--color-blue-background)] text-large outline-none focus:border-[var(--color-blue-light)] focus:ring-1 focus:ring-[var(--color-blue-light)]"
              />
            ))}
          </div>
          <input type="hidden" {...register("otp")} />
          {errors.otp && <Error>{errors.otp.message}</Error>}
        </div>
      </div>

      <AuthCTABtn
        isSubmitting={isSubmitting}
        CTA={handleSubmit(handleVerifyOtp)}
      >
        Verify OTP
      </AuthCTABtn>

      <div className="text-small-passive mt-[1.5rem] md:!mt-[2rem] text-start mt-5 flex flex-col gap-8">
        <p>
          Enter the 6-digit code sent to{" "}
          <strong>{email || "your email"}</strong>.
        </p>
        {/* Resend Button */}
        <div className="flex flex-col gap-8">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isResendLoading}
            className={`py-12 px-16 rounded-small border border-[1.5px] transition-all w-full ${
              canResend
                ? "border-[var(--color-blue-light)] text-[var(--color-blue-light)] hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]"
                : "border-[var(--color-border)] text-[var(--color-text)] cursor-not-allowed opacity-70"
            }`}
          >
            {canResend
              ? isResendLoading
                ? "Resending..."
                : "Request another OTP"
              : `Request another OTP in ${formattedCountdown}`}
          </button>
        </div>
      </div>

      <div className="mt-20">
        <CustomBtn
          onClick={onBack}
          className="border border-[var(--color-border)] text-[var(--color-text)] w-full"
        >
          Change Email
        </CustomBtn>
      </div>
    </form>
  );
}
