"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthCTABtn } from "../secondary/buttons";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { loginSchema } from "@/utils/authSchemas";
import { LoginFormData } from "@/app/types/auth";
import { handleStudentLogin } from "@/lib/auth/login";
import { useRouter } from "next/navigation";

export default function StudentLoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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
      toast.error(error.message || "Login failed. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <AuthCTABtn isSubmitting={isSubmitting} CTA={handleSubmit(handleLogin)}>
        Login to Portal
      </AuthCTABtn>

      {/* Forgot Password Link */}
      <div className="mt-26 text-center">
        <a
          href="#"
          className="text-[var(--color-blue-light)] hover:underline hover:text-[var(--color-blue-light)]"
        >
          Forgot Password?
        </a>
      </div>
    </form>
  );
}
