// Defaults
export const units = [1, 2, 3, 4, 5, 6];
export const semesters = ["Harmattan", "Rain"];

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
    placeholder: "John Doe",
    type: "text",
    maxLength: 100,
    className: "w-200",
  },
  {
    name: "regNo",
    placeholder: "20231245887",
    type: "number",
    maxLength: 11,
    className: "w-200",
  },
  {
    name: "test",
    placeholder: "20",
    type: "number",
    maxLength: 2,
    className: "w-50",
  },
  {
    name: "lab",
    placeholder: "20",
    type: "number",
    maxLength: 2,
    className: "w-50",
  },
  {
    name: "exam",
    placeholder: "60",
    type: "number",
    maxLength: 2,
    className: "w-50",
  },
  {
    name: "total",
    placeholder: "100",
    type: "number",
    maxLength: 3,
    className: "w-50",
  },
  {
    name: "grade",
    placeholder: "60",
    type: "text",
    maxLength: 1,
    className: "w-50",
  },
  {
    name: "remark",
    placeholder: "EXCELLENT",
    type: "text",
    maxLength: 10,
    className: "w-100",
  },
];
