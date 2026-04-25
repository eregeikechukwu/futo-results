"use client";

import AuthLayout from "@/layouts/AuthLayout";
import AdvisorLoginForm from "@/components/forms/advisorForm";
import { AuthCard, AuthHeading, InfoCard } from "@/components/utilities";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import styles from "@/app/styles/authPages.module.scss";
import { handleCredentials } from "@/lib/auth/advisorLogin";

import { useState } from "react";
import { AdvisorLoginFormData, LoginFormData } from "@/app/types/auth";
import { advisorLoginSchema } from "@/utils/authSchemas";
import { AdvisorOtpForm } from "@/components/forms/advisorOtpForm";

export default function AdvisorAuth() {
  const [screen, setScreen] = useState<"credentials" | "otp">("otp");
  const [credentials, setCredentials] = useState<LoginFormData | null>(null);

  const onBack = () => setScreen("credentials");

  return (
    <div>
      <AuthLayout type="advisor">
        {screen === "credentials" ? (
          <AuthCard>
            <div className={styles.advisorBadge}>
              <ShieldCheck height={18} width={18} />
              <p>Advisor Access</p>
            </div>
            <AuthHeading
              heading="Advisor Sign-In"
              subHeading="Secure access for departmental staff"
            />
            <AdvisorLoginForm
              setCredentials={setCredentials}
              onOtpSent={() => setScreen("otp")}
            />
            <div className={styles.authInfoWrap}>
              <InfoCard
                heading="Restricted Access"
                variant="small"
                type="warning"
              >
                Access is restricted to authorized departmental staff only. All
                login attempts are monitored and logged.
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
