import z from "zod";

export const advisorCourseSchema = z.object({
  courseTitle: z.string().min(2, "Course name must be at least 3 characters"),
  courseCode: z
    .string()
    .min(3, "Course code must contauin at least 3 characters"),
  unit: z.string().min(1, "Unit must be at least 1"),
  term: z.string().min(1, "Term is required"),
});
