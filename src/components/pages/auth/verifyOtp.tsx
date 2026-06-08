/*

"use client";

import { useState } from "react";
import {
  AdvisorCredentialsForm,
  AdvisorOtpForm,
} from "@/components/forms/advisorOtpForm";

export default function VerifyOTP() {
  const [screen, setScreen] = useState<"credentials" | "otp">("credentials");
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <div className="w-full max-w-[480px] mx-auto">
      {screen === "credentials" ? (
        <AdvisorCredentialsForm
          onOtpSent={(email) => {
            setPendingEmail(email);
            setScreen("otp");
          }}
        />
      ) : (
        <AdvisorOtpForm
          email={pendingEmail}
          onBack={() => setScreen("credentials")}
        />
      )}
    </div>
  );
}

*/
