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

//INfer typr from schema
type AdvisorLoginFormData = z.infer<typeof advisorLoginSchema>;

export default function AdvisorLoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdvisorLoginFormData>({
    resolver: zodResolver(advisorLoginSchema),
  });

  //Handle form submit
  const onSubmit = async (data: AdvisorLoginFormData) => {
    //simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("login success");

    //redirect to dashboard - simulate
    window.location.href = "/advisor/dashboard";
    reset();
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

        {/* 2FA code */}
        <div className="field">
          <label htmlFor="twofa">
            <span>
              <KeyRound />
            </span>
            Access Code
          </label>
          <div className="input" id="password">
            <input
              id="twofa"
              placeholder="Department Access Code"
              type="password"
              {...register("twofa")}
            />
            {/* Error */}
            {errors.twofa && <Error>{errors.twofa.message}</Error>}
          </div>
          {!errors?.twofa && (
            <p className="text-small-passive text-start  mt-5">
              Additional security for advisor accounts
            </p>
          )}
        </div>
      </div>
      <AuthCTABtn isSubmitting={isSubmitting} CTA={handleSubmit(onSubmit)}>
        <span className="group-hover:translate-x-1 transition mr-9">
          <LogIn height={19} width={19} />
        </span>
        Sign In to Dashboard
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
