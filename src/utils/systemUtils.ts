// Defaults
export const units = [1, 2, 3, 4, 5, 6];
export const semesters = ["Harmattan", "Rain"];

// Strict grade letters used across result rendering and CGPA calculations.
export type GradeLetter = "A" | "B" | "C" | "D" | "E" | "F";
// Student status
export type StudentStatus = "flagged" | "verified" | "pending";

// Visual tones for grade badges.
export type GradeTone = {
  bg: string;
  text: string;
};

// 5-point grading scale.
export const gradePointMap: Record<GradeLetter, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

// Shared grade color system used in student pages.
export const gradeToneMap: Record<GradeLetter, GradeTone> = {
  A: {
    bg: "var(--color-green-background)",
    text: "var(--color-text-green-dark)",
  },
  B: { bg: "var(--color-blue-background)", text: "var(--color-text-blue)" },
  C: { bg: "var(--color-brown-background)", text: "var(--color-text-brown)" },
  D: { bg: "var(--color-purple-background)", text: "var(--color-white)" },
  E: { bg: "var(--color-red-background)", text: "var(--color-text-red)" },
  F: { bg: "var(--color-red)", text: "var(--color-white)" },
};

const gradeLetters = ["A", "B", "C", "D", "E", "F"] as const;

// Grading system from total score.
export function computeGrade(total: number): GradeLetter {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

// Normalizes unknown/loose string values to strict A-F letters.
export function toGradeLetter(value: string): GradeLetter {
  if (gradeLetters.includes(value as GradeLetter)) {
    return value as GradeLetter;
  }

  return "F";
}

// Computes CGPA from unit + grade pairs.
export function calculateCgpaFromGrades(
  courses: { unit: number; grade: GradeLetter }[],
): number {
  const validCourses = courses.filter((course) => course.unit > 0);
  const totalUnits = validCourses.reduce((sum, course) => sum + course.unit, 0);

  if (!totalUnits) return 0;

  const weightedPointTotal = validCourses.reduce(
    (sum, course) => sum + course.unit * gradePointMap[course.grade],
    0,
  );

  return weightedPointTotal / totalUnits;
}

// Standardized CGPA formatting for UI display.
export function formatCgpa(value: number): string {
  return value.toFixed(2);
}

//Upload format options
export const excelUploadFormats = [".xlsx", ".xls", ".csv"];
export const ocrUploadFormats = ["application/pdf", "image/jpeg", "image/png"];

// keep unit values as numbers if schema expects number
export const unitsOptions = units.map((unit) => ({
  id: unit.toString(),
  label: `${unit} ${unit > 1 ? "units" : "unit"}`,
  value: unit,
}));

export const semesterOptions = semesters.map((semester) => ({
  id: semester.toLowerCase(), // string, matches schema, but the real one is UUID generated on backend, this is just for form handling
  label: semester[0].toUpperCase() + semester.slice(1),
  value: semester, // string, matches schema
}));

export function formatSessionInput(value: string): string | undefined {
  const digits = value.replace(/\D/g, ""); // to rmove  non-digit characters

  if (digits.length <= 4) return;
  return digits.slice(0, 4) + "/" + digits.slice(4, 8);
}

export const editCourseFields = [
  {
    name: "name",
    placeholder: "eg: John Doe (optional)",
    type: "text",
    maxLength: 100,
    className: "w-200",
    readonly: false,
  },
  {
    name: "regNo",
    placeholder: "eg: 20231245887",
    type: "number",
    maxLength: 11,
    className: "w-200",
    readonly: false,
  },
  {
    name: "test",
    placeholder: "eg: 20",
    type: "number",
    maxLength: 2,
    className: "w-50",
    readonly: false,
  },
  {
    name: "lab",
    placeholder: "eg: 20",
    type: "number",
    maxLength: 2,
    className: "w-50",
    readonly: false,
  },
  {
    name: "exam",
    placeholder: "eg: 60",
    type: "number",
    maxLength: 2,
    className: "w-50",
    readonly: false,
  },
  {
    name: "total",
    placeholder: "100",
    type: "number",
    maxLength: 3,
    className: "w-50",
    readonly: true,
  },
  {
    name: "grade",
    placeholder: "eg: A",
    type: "text",
    maxLength: 1,
    className: "w-50 font-bold",
    readonly: true,
  },
  {
    name: "remark",
    placeholder: "eg: PASS",
    type: "text",
    maxLength: 10,
    className: "w-100 font-bold",
    readonly: true,
  },
];

// Universal password length
export const passwordLength = 6;
