"use client";

import AdvisorLoginForm from "@/components/forms/advisorForm";
import { AuthCard, AuthHeading, InfoCard } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { ShieldCheck } from "lucide-react";
import styles from "@/app/styles/authPages.module.scss";

export default function AdvisorAuth() {
  return (
    <div>
      <AuthLayout type="advisor">
        <AuthCard>
          <div className={styles.advisorBadge}>
            <ShieldCheck height={18} width={18} />
            <p>Advisor Access</p>
          </div>
          <AuthHeading
            heading="Advisor Sign-In"
            subHeading="Secure access for departmental staff"
          />
          <AdvisorLoginForm />
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
      </AuthLayout>
    </div>
  );
}
