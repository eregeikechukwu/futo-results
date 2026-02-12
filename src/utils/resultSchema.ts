import z from "zod";

const convertScoresToNumber = (data: any) => {
  if (data === "" || data === null || data === undefined) {
    return 0;
  }
  return Number(data);
};

export const AddResultSchema = z.object({
  name: z.string().optional(),
  regNo: z
    .string()
    .length(11, "Registration number must be 11 characters")
    .refine(
      (val) => /^[0-9]{11}$/.test(val), // 11 digits only
      "Registration number must contain only digits",
    )
    .refine(
      (val) => val.endsWith("3"),
      "Registration number must end with the number 3",
    ),

  test: z.preprocess(
    (val) => convertScoresToNumber(val),
    z.number().max(100, "invalid score"),
  ),
  lab: z.preprocess(
    (val) => convertScoresToNumber(val),
    z.number().max(100, "invalid score"),
  ),
  exam: z.preprocess(
    (val) => convertScoresToNumber(val),
    z.number().max(100, "invalid score"),
  ),
  total: z.number().optional(),
  grade: z.string().optional(),
  remark: z.string().optional(),
});
