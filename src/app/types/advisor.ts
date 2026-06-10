import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import z from "zod";

export interface AdvisorStudent {
  id: string;
  name: string;
  email: string;
  regNumber: string;
  status: "verified" | "pending" | "flagged";
  joinDate: string;
}
export interface AdvisorStudentUpload {
  name: string;
  email: string;
  regNumber: string;
  // status: "verified" | "pending" | "flagged";
  // joinDate: string;
}

export interface AdvisorCourseDB {
  id: string;
  unit: number;
  courses: {
    id: string;
    course_code: string;
    course_title: string;
  };
  academic_terms: {
    id: string;
    session: string;
    semester: string;
    admission_year: number;
  };
}

export interface AdvisorCourse {
  id: string;
  courseTitle: string;
  courseCode: string;
  unit: string;
  semester: "Rain" | "Harmattan";
  session: string;
}

export type CourseData = {
  courseTitle: string;
  courseCode: string;
  unit: string;
  term: string;
};

export type TextFieldProps = {
  name: keyof CourseData | (string & {}); //still keeping chekc for key of types, but allos custom stings when needed
  label?: string;
  required?: boolean;
  type?: string;
  id?: string;
  readOnly?: boolean;
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

export type SelectOptions = {
  id: string;
  value: string | number;
  label: string;
};

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

export interface AddCourseInput {
  course_code: string;
  course_title: string;
  unit: number;
  term_id: string;
  advisor_id: string;
}

export interface UpdateCourseInput {
  unit?: number;
  term_id?: string;
}

// Type for result entry with nested data
export interface ResultEntry {
  id: string;
  test_score: number;
  lab_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remark: string;
  batch_id: string;
  students: {
    id: string;
    reg_number: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
    };
  };
  result_batches: {
    id: string;
    status: "draft" | "reviewed" | "published" | "archived";
    source_type: string;
    created_at: string;
    published_at: string | null;
    offering_id: string;
  };
}

export interface BatchInfo {
  id: string;
  status: "draft" | "published";
  source_type: string;
  created_at: string;
  published_at: string | null;
  uploaded_by: string;
}

export interface SelectedOffering {
  id: string;
  unit: number;
  courses: {
    id: string;
    course_code: string;
    course_title: string;
  };
  academic_terms: {
    id: string;
    session: string;
    semester: string;
  };
}

export interface ResultsTableProps {
  results: ResultEntry[];
  batches: BatchInfo[];
  offeringId: string;
  selectedOffering: SelectedOffering | undefined;
}
