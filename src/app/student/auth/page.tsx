"use client";

import StudentLoginForm from "@/components/forms/studentLoginForm";
import StudentSignupForm from "@/components/forms/studentSignUpForm";
import { AuthCard, AuthHeading } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { useState } from "react";
import styles from "@/app/styles/authPages.module.scss";

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
          <div className={styles.modeSwitcher}>
            {Modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.name)}
                className={`${styles.modeButton} ${
                  mode === m.name
                    ? styles.modeButtonActive
                    : styles.modeButtonInactive
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
