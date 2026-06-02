"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthCTABtn } from "../secondary/buttons";
import { Eye, EyeClosed, KeyRound, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { advisorLoginSchema } from "@/utils/authSchemas";
import { Error } from "../secondary/common";
import { AdvisorLoginFormProps } from "@/app/types/auth";
import { handleCredentials } from "@/lib/auth/advisorLogin";

//INfer typr from schema
type AdvisorLoginFormData = z.infer<typeof advisorLoginSchema>;

export default function AdvisorLoginForm({
  role = "advisor",
  onOtpSent,
  setCredentials,
}: AdvisorLoginFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdvisorLoginFormData>({
    resolver: zodResolver(advisorLoginSchema),
  });

  //Handle form submit
  const onSubmit = async (data: AdvisorLoginFormData) => {
    try {
      setIsloading(true);
      await handleCredentials({ ...data, role }); // Pass role to the login handler to differentiate between advisor and admin login
      setCredentials(data);
      onOtpSent(data.email);
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again later");
      setIsloading(false);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex flex-col gap-24 mb-24">
        <div className="field">
          <label htmlFor="email">
            <span>
              <Mail />
            </span>
            Email Address
          </label>
          <div className="input" id="email">
            <input
              id="email"
              {...register("email")}
              placeholder="youremail@student.edu"
              type="email"
            />
            {/* Error */}
            {errors.email && <Error>{errors.email.message}</Error>}
          </div>
        </div>
        {/* password */}
        <div className="field">
          <label htmlFor="password">
            <span>
              <Lock />
            </span>
            Password
          </label>
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
            {errors.password && <Error>{errors.password.message}</Error>}
          </div>
        </div>
      </div>
      <AuthCTABtn
        isSubmitting={isSubmitting || isLoading}
        CTA={handleSubmit(onSubmit)}
      >
        Send OTP
      </AuthCTABtn>
    </form>
  );
}
