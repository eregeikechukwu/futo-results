"use client";

import StudentLoginForm from "@/components/forms/studentLoginForm";
import StudentSignupForm from "@/components/forms/studentSignUpForm";
import { AuthCard, AuthHeading } from "@/components/utilities";
import AuthLayout from "@/layouts/authLayout/AuthLayout";
import { useEffect, useState } from "react";
import styles from "@/app/styles/authPages.module.scss";

export default function StudentAuthPage() {
  const [mode, setModeState] = useState("sign-up");
  const [loading, setLoading] = useState(false);

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

  const setMode = (mode: "sign-up" | "login") => {
    if (loading) {
      return;
    }
    setModeState(mode);
  };

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
          <div
            className={`${styles.modeSwitcher} transition-[0.5s] ${loading && "opacity-50 cursor-not-allowed"}`}
          >
            {Modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.name as "login" | "sign-up")}
                className={`${styles.modeButton} ${
                  mode === m.name
                    ? styles.modeButtonActive
                    : styles.modeButtonInactive
                }  ${loading && "cursor-not-allowed!"}`}
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
            <StudentSignupForm
              loading={loading}
              setLoading={setLoading}
              setMode={setMode}
            />
          ) : (
            <StudentLoginForm loading={loading} setLoading={setLoading} />
          )}
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
