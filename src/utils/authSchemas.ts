import z from "zod";

//Validation schema
export const signupSchema = z.object({
  fullname: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .refine(
      (value) => value.trim().split(/\s+/).length >= 2,
      "Full name must contain at least two words",
    ),
  regNumber: z
    .string()
    .length(11, "Registration number must be 11 characters")
    .refine(
      (val) => /^[0-9]{11}$/.test(val), // 11 digits only
      "Registration number must contain only digits",
    )
    .refine(
      (val) => val.endsWith("3"),
      "Registration number must end with the number 3",
    )
    .refine((val) => {
      const year = parseInt(val.slice(0, 4)); // First 4 digits
      const currentYear = new Date().getFullYear();
      return year <= currentYear;
    }, "Admission year cannot be in the future"),
  email: z.string().email("invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

//Validation schema
export const loginSchema = z.object({
  email: z.string().email("invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

//Validation schema
export const advisorLoginSchema = z.object({
  email: z.string().email("invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
