export interface ExcelParseOptions {
  /** Specific sheet to parse (default: first sheet) */
  sheetName?: string;
  /** First row contains headers (default: true) */
  hasHeaders?: boolean;
  /** Custom headers to use (overrides file headers) */
  headers?: string[];
  /** Trim whitespace from values (default: true) */
  trimValues?: boolean;
  /** Skip empty rows (default: true) */
  skipEmptyRows?: boolean;
  /** Convert numeric strings to numbers (default: true) */
  convertNumbers?: boolean;
}

export interface ExcelMetadata {
  /** Name of the parsed sheet */
  sheetName: string;
  /** Total number of sheets in workbook */
  totalSheets: number;
  /** Array of all available sheet names */
  availableSheets: string[];
  /** Total number of rows parsed */
  totalRows: number;
  /** Detected or provided headers */
  headers: string[];
}

export interface ExcelRawType {
  name: string | null;
  regNo: string | number | null;
  test: string | number | null;
  lab: string | number | null;
  exam: string | number | null;
  total: string | number | null;
  grade: string | null;
  remark: string | null;
}

export interface ExcelParseResult<T = Record<string, unknown>> {
  /** Whether parsing was successful */
  success: boolean;
  /** Parsed data as array of objects */
  data: T[];
  /** Metadata about the parsed file */
  metadata: ExcelMetadata | null;
  /** Error message if parsing failed */
  error?: string;
}

export type ExcelInput = File | Buffer | ArrayBuffer | string;

// ============================================================================
// Type Definitions for Common Use Cases
// ============================================================================

/**
 * Example: Student Grades Schema
 */
export interface StudentGrade {
  Name: string | null;
  RegNo: string | number | null;
  Program: string | null;
  Test: number | null;
  Lab: number | null;
  Exam: number | null;
  Total: number | null;
  Grade: string | null;
  Remark: string | null;
}

/**
 * Example: Generic CSV-like row
 */
export type ExcelRow = Record<string, string | number | boolean | null>;

export interface NormalizedStudentUploadRow {
  // full_name: string | null;
  reg_number: string | null;
  email: string | null;
}

//Result addition form
export interface AddedResult {
  fullname: string;
  regNumber: string | number;
  test: number | null;
  lab: number | null;
  exam: number | null;
  total?: number | null;
  grade?: string | null;
  remark?: string | null;
}
export type ParsedResult = {
  name: string | null;
  regNo: string | number | null;
  test: string | null;
  lab: string | null;
  exam: string | null;
  total: string | null;
  grade: string | null;
  remark: string | null;
};
