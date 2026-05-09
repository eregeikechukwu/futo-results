"use client";

import { AuthCard, AuthHeading } from "@/components/utilities";
import AuthLayout from "@/layouts/AuthLayout";
import { SetPasswordForm } from "@/components/forms/setPassword";

export default function SetPasswordPage() {
  return (
    <div>
      <AuthLayout type="student">
        <AuthCard>
          {/* Header */}
          <AuthHeading
            heading="Set your password"
            subHeading="Set your new password for accessing your dashboard"
          />

          {/* Form */}
          <SetPasswordForm role="student" />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
