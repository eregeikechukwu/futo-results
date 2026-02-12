import { readonly } from "zod";

// Defaults
export const units = [1, 2, 3, 4, 5, 6];
export const semesters = ["Harmattan", "Rain"];

//Grading system
export function computeGrade(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

//Upload format options
export const excelUploadFormats = [".xlsx", ".xls", ".csv"];
export const ocrUploadFormats = ["application/pdf", "image/jpeg", "image/png"];

// keep unit values as numbers if schema expects number
export const unitsOptions = units.map((unit) => ({
  label: `${unit} ${unit > 1 ? "units" : "unit"}`,
  value: unit,
}));

export const semesterOptions = semesters.map((semester) => ({
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
