"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthCTABtn } from "../secondary/buttons";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { signupSchema } from "@/utils/authSchemas";

//INfer typr from schema
type SignupFormData = z.infer<typeof signupSchema>;

export default function StudentSignupForm({
  setMode,
}: {
  setMode: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  //Handle form submit
  const onSubmit = async (data: SignupFormData) => {
    console.log("form data: ", data);
    //simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("login success");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex flex-col gap-24 mb-24">
        {/* Full name */}
        <div className="field">
          <label htmlFor="name">Full Name</label>
          <div className="input" id="name">
            <input
              id="name"
              {...register("fullname")}
              placeholder="John Doe"
              type="text"
            />
            {/* Error */}
            {errors.fullname && (
              <p className="error" role="alert">
                {errors.fullname.message}
              </p>
            )}
          </div>
        </div>

        {/* Reg number */}
        <div className="field">
          <label htmlFor="regNumber">Registration Number</label>
          <div className="input" id="regNumber">
            <input
              id="name"
              {...register("regNumber")}
              placeholder="e.g., 20231356243"
              type="text"
            />
            {/* Error */}
            {errors.regNumber && (
              <p className="error" role="alert">
                {errors.regNumber.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
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
      <AuthCTABtn isSubmitting={isSubmitting} CTA={handleSubmit(onSubmit)}>
        Create Account
      </AuthCTABtn>

      {/* Forgot Password Link */}
      <div className="mt-26 text-center">
        Already have an account?
        <span
          onClick={() => setMode("login")}
          className="text-[var(--color-primary)] hover:underline hover:text-[var(--color-blue-light)]"
        >
          &nbsp;
          <a href="#">Login here</a>
        </span>
      </div>
    </form>
  );
}
