"use client";

import { AuthCTABtn } from "@/components/secondary/buttons";
import { errorToastHandler } from "@/helpers/errorHandler";
import { createSupabaseClient } from "@/lib/supabase/client";
import { passwordLength } from "@/utils/systemUtils";
import { Eye, EyeClosed } from "lucide-react";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function SetPasswordForm({ role }: { role: "student" | "advisor" }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listen, setListen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const togglePasswordVisibility = (field: string) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field as keyof typeof passwordVisible],
    });
  };

  const validateForm = useCallback(
    function validateForm() {
      console.log("Validating form with values:", {
        password,
        confirmPassword,
      });
      if (password.length >= passwordLength) {
        setErrors((prev) => ({ ...prev, password: undefined }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: `Password must be at least ${passwordLength} characters long`,
        }));
      }

      if (confirmPassword === password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: undefined,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: `Passwords do not match`,
        }));
      }
    },
    [password, confirmPassword],
  );

  console.log(" is form errors? ", isValid);

  useEffect(() => {
    validateForm();
  }, [listen, password, confirmPassword]);

  const handleSubmit = useCallback(
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setIsLoading(true);
      setListen(true);

      // Validate form before submission
      if (errors.password || errors.confirmPassword) {
        setIsLoading(false);
        return;
      }

      //  Call API to set password for the advisor, then redirect to login page
      const supabase = createSupabaseClient();

      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        errorToastHandler(error, "Something went wrong, please try again.");
        setIsLoading(false);
        return;
      }

      // Sign them out to login again
      await supabase.auth.signOut();
      toast.success("Password set successfully! Please log in again.");

      // reset form
      (e.target as HTMLFormElement).reset();
      setPassword("");
      setListen(false);
      setConfirmPassword("");
      setIsLoading(false);

      // Redirect to login after a short delay to allow toast to show
      setTimeout(() => {
        redirect(role === "advisor" ? "/advisor/auth" : "/student/auth");
      }, 1500);
    },
    [password, confirmPassword, errors],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col md:gap-[1.5rem] gap-[1rem] md:mb-[1.5rem] *:"
    >
      {/* password */}
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="input" id="password">
          <input
            id="password"
            placeholder="Enter your password"
            type={passwordVisible.password ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("password")}
          >
            {passwordVisible.password ? (
              <EyeClosed width={19} height={18} />
            ) : (
              <Eye width={19} height={18} />
            )}
          </button>
          {/* Error */}
          {errors.password && listen && (
            <p className="error" role="alert">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input" id="password">
          <input
            id="confirmPassword"
            placeholder="Enter your password"
            type={passwordVisible.confirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirmPassword")}
          >
            {passwordVisible.confirmPassword ? (
              <EyeClosed width={19} height={18} />
            ) : (
              <Eye width={19} height={18} />
            )}
          </button>
          {/* Error */}
          {errors.confirmPassword && listen && (
            <p className="error" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {/* CTA is empty because form's onSubmit handler calls handleSubmit */}
      <AuthCTABtn isSubmitting={isLoading} CTA={() => {}}>
        Set Password
      </AuthCTABtn>
    </form>
  );
}
