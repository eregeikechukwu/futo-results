import { z } from "zod";

export const weeklyScheduleSchema = z
  .object({
    day_of_week: z.number()
      .int("Day must be a whole number.")
      .min(1, "Day must be between Monday and Sunday.")
      .max(7, "Day must be between Monday and Sunday."),

    start_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Start time must be in HH:mm format.",
      ),

    end_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "End time must be in HH:mm format.",
      ),

    location: z
      .string()
      .trim()
      .min(1, "Location is required.")
      .max(100, "Location cannot exceed 100 characters."),

    note: z
      .string()
      .trim()
      .max(500, "Note cannot exceed 500 characters.")
      .optional()
      .or(z.literal("")),

    is_active: z.boolean(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be later than start time.",
    path: ["end_time"],
  });

export type WeeklyScheduleForm = z.infer<typeof weeklyScheduleSchema>;
