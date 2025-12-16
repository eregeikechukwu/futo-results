"use client";

import AdvisorLoginForm from "@/components/forms/advisorForm";
import { AuthCard, AuthHeading, InfoCard } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { ShieldCheck } from "lucide-react";

export default function AdvisorAuth() {
  return (
    <div>
      <AuthLayout type="advisor">
        <AuthCard>
          <div className="py-4 px-12 m-16 bg-[#dbeafe] rounded-full flex gap-8 text-[var(--color-blue-light)] items-center">
            <ShieldCheck height={18} width={18} />
            <p>Advisor Access</p>
          </div>
          <AuthHeading
            heading="Advisor Sign-In"
            subHeading="Secure access for departmental staff"
          />
          <AdvisorLoginForm />
          <div className="mt-24">
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
