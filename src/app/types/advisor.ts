import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import z from "zod";

export interface AdvisorStudent {
  name: string;
  email: string;
  regNumber: string;
  status: "verified" | "pending" | "flagged";
  joinDate: string;
}

export interface AdvisorCourse {
  courseTitle: string;
  courseCode: string;
  unit: string;
  semester: "Rain" | "Harmattan";
  session: string;
}

export type CourseData = z.infer<typeof advisorCourseSchema>;

export type TextFieldProps = {
  name: keyof CourseData | (string & {}); //still keeping chekc for key of types, but allos custom stings when needed
  label?: string;
  required?: boolean;
  type?: string;
  id?: string;
  onChange?: (input: string) => number | string | undefined;
  placeholder?: string;
  maxLength?: number;
  pattern?: string;
  inputMode?:
    | "url"
    | "search"
    | "text"
    | "tel"
    | "numeric"
    | "none"
    | "decimal"
    | undefined;
};

export type SelectOptions = { value: string | number; label: string };

export type SelectFieldProps = {
  name: keyof CourseData | (string & {}); //still keeping chekc for key of types, but allos custom stings when needed
  label?: string;
  required?: boolean;
  options: SelectOptions[];
  id?: string;
  numeric?: boolean;
};

export type Progress = {
  phase: "queued" | "preprocessing" | "ocr" | "parsing" | "done" | string;
  percent: number;
  message: string;
};

export interface OcrJob {
  id: string;
  filename: string;
  createdAt: number;
  updatedAt: number;
  status: "queued" | "processing" | "done" | "failed";
  progress: Progress;
  result: {
    rawText: string;
    rows: string[][];
    parsedJson: Record<string, string | null>[];
  } | null;
  error: string | null;
}

export interface UploadResponse {
  success: boolean;
  jobs: Array<{
    jobId: string;
    filename: string;
  }>;
}

export type ResultRowType = {
  name: string;
  regNo: unknown | null;
  test: unknown | null;
  lab: unknown | null;
  exam: unknown | null;
  program: string;
  total: unknown | null;
  grade: unknown | null;
  remark: unknown | null;
};
