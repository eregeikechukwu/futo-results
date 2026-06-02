"use client";

import AuthLayout from "@/layouts/authLayout/AuthLayout";
import AdvisorLoginForm from "@/components/forms/advisorForm";
import { AuthCard, AuthHeading, InfoCard } from "@/components/utilities";
import { ShieldCheck } from "lucide-react";
import styles from "@/app/styles/authPages.module.scss";

import { useState } from "react";
import { LoginFormData } from "@/app/types/auth";
import { AdvisorOtpForm } from "@/components/forms/advisorOtpForm";
import { ForgotPaasswordForm } from "@/components/forms/forgotPassword";

export default function AdminAuth() {
  const [screen, setScreen] = useState<"credentials" | "otp">("credentials");
  const [credentials, setCredentials] = useState<LoginFormData | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const onBack = () => setScreen("credentials");

  return (
    <div>
      <AuthLayout type="advisor">
        {screen === "credentials" ? (
          <AuthCard>
            <div className={styles.advisorBadge}>
              <ShieldCheck height={18} width={18} />
              <p>Admin Access</p>
            </div>
            <AuthHeading
              heading="Admin Sign-In"
              subHeading="Secure access for only me"
            />
            <AdvisorLoginForm
              setCredentials={setCredentials}
              onOtpSent={() => setScreen("otp")}
              role="admin" // Pass role as admin to the login form to differentiate between advisor and admin login
            />
            {/* Forgot Password Link */}
            <ForgotPaasswordForm
              role="admin"
              setForgotPasswordMode={setForgotPasswordMode}
              forgotPasswordMode={forgotPasswordMode}
            />
            <div className={styles.authInfoWrap}>
              <InfoCard
                heading="Restricted Access"
                variant="small"
                type="warning"
              >
                Access is restricted to authorized administrators only. All
                login attempts are monitored and logged.
                <br />
                Your curiosity is appreciated, but this area is off-limits.
              </InfoCard>
            </div>
          </AuthCard>
        ) : (
          <AdvisorOtpForm
            email={credentials?.email || ""}
            onBack={onBack}
            credentials={credentials}
          />
        )}
      </AuthLayout>
    </div>
  );
}
