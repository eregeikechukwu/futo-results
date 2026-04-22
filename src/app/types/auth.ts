import { signupSchema } from "@/utils/authSchemas";
import z from "zod";

export type SignupFormData = z.infer<typeof signupSchema>;
