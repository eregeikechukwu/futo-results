"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthCTABtn } from "../secondary/buttons";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { loginSchema } from "@/utils/authSchemas";
import { LoginFormData } from "@/app/types/auth";
import { handleStudentLogin } from "@/lib/auth/login";
import { useRouter } from "next/navigation";
import { ForgotPaasswordForm } from "./forgotPassword";
import { errorToastHandler } from "@/helpers/errorHandler";

export default function StudentLoginForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Router fo login
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await handleStudentLogin(data, router, reset);
      toast.success("Login successful! ");
    } catch (error: any) {
      errorToastHandler(error, "Something went wrong, please try again");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleLogin)} className="w-full">
        <div className="flex flex-col gap-24 mb-24">
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <div className="input" id="email">
              <input
                id="email"
                {...register("email")}
                placeholder="youremail@student.edu"
                type="email"
              />
              {/* Error */}
              {errors.email && (
                <p className="error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input" id="password">
              <input
                id="password"
                placeholder="Enter your password"
                type={passwordVisible ? "text" : "password"}
                {...register("password")}
              />
              <button type="button" onClick={togglePasswordVisibility}>
                {passwordVisible ? (
                  <EyeClosed width={19} height={18} />
                ) : (
                  <Eye width={19} height={18} />
                )}
              </button>
              {/* Error */}
              {errors.password && (
                <p className="error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <AuthCTABtn isSubmitting={loading} CTA={handleSubmit(handleLogin)}>
          Login to Portal
        </AuthCTABtn>
      </form>

      {/* FORGOT PASSWORD */}
      {/* Forgot Password Link */}
      <ForgotPaasswordForm
        setForgotPasswordMode={setForgotPasswordMode}
        forgotPasswordMode={forgotPasswordMode}
        role="student"
      />
    </>
  );
}
