"use client";

import { AuthCard, AuthHeading } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { SetPasswordForm } from "@/components/forms/setPassword";

export default function SetPasswordPage() {
  return (
    <div>
      <AuthLayout type="advisor">
        <AuthCard>
          {/* Header */}
          <AuthHeading
            heading="Set your password"
            subHeading="Set your password for accessing your advisor dashboard"
          />

          {/* Form */}
          <SetPasswordForm role="advisor" />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
