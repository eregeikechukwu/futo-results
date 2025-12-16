"use client";

import StudentLoginForm from "@/components/forms/studentLoginForm";
import StudentSignupForm from "@/components/forms/studentSignUpForm";
import { Logo } from "@/components/secondary/logo";
import { AuthCard, AuthHeading } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { useState } from "react";

export default function StudentAuthPage() {
  const [mode, setMode] = useState("sign-up");

  const Modes = [
    {
      id: 1,
      name: "sign-up",
      label: "Create Account",
      subLabel: "Join the verified student community",
    },
    {
      id: 2,
      name: "login",
      label: "Welcome Back",
      subLabel: "Sign in to access your results",
    },
  ];
  const activeMode = Modes.find((m) => m.name === mode);

  return (
    <div>
      <AuthLayout type="student">
        <AuthCard>
          {/* Header */}
          <AuthHeading
            heading={activeMode?.label || ""}
            subHeading={activeMode?.subLabel || ""}
          />
          {/* Mode Switcher */}
          <div className="flex p-6 rounded-[16px] mb-32 bg-[var(--color-background-mild)] w-full">
            {Modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.name)}
                className={`cursor-pointer basis-1/2 rounded-small lh-24 py-12 px-16 font-medium transition-colors ${
                  mode === m.name
                    ? "bg-[var(--color-primary)] shadow-xl text-white"
                    : "bg-[var(--color-background-mild)] text-[var(--color-text-link)] hover:bg-[var(--color-gray-200)]"
                }`}
              >
                {m.name
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>

          {/* Form */}
          {mode === "sign-up" ? (
            <StudentSignupForm setMode={setMode} />
          ) : (
            <StudentLoginForm />
          )}
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
