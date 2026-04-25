import {
  advisorLoginSchema,
  loginSchema,
  signupSchema,
} from "@/utils/authSchemas";
import { Dispatch, SetStateAction } from "react";
import z from "zod";
// import { AdvisorLoginFormData, OtpProps } from "@/app/types/auth";

export type SignupFormData = z.infer<typeof signupSchema>;

//INfer typr from schema
export type LoginFormData = z.infer<typeof loginSchema>;

export interface AdvisorLoginFormProps {
  onOtpSent: (email: string) => void;
  setCredentials: Dispatch<SetStateAction<LoginFormData | null>>;
}

export type AdvisorLoginFormData = z.infer<typeof advisorLoginSchema>;
