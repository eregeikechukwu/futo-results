/**
 * Excel to JSON Parser for Next.js
 * Fully typed TypeScript implementation
 *
 * Installation:
 * npm install xlsx
 * npm install --save-dev @types/node
 *
 * File location: lib/excelParser.ts or utils/excelParser.ts
 */

import * as XLSX from "xlsx";

// ============================================================================
// Types
// ============================================================================

// ============================================================================
// Main Parser Function
// ============================================================================

/**
 * Convert Excel file to JSON
 *
 * @param input - File object, Buffer, ArrayBuffer, or file path
 * @param options - Optional configuration
 * @returns Result object with typed data and metadata
 */
export async function excelToJson<T = Record<string, unknown>>(
  input: ExcelInput,
  options: ExcelParseOptions = {}
): Promise<ExcelParseResult<T>> {
  const {
    sheetName = null,
    hasHeaders = true,
    headers = null,
    trimValues = true,
    skipEmptyRows = true,
    convertNumbers = true,
  } = options;

  try {
    // Read the workbook from different input types
    const workbook = await readWorkbook(input);

    // Get the target sheet
    const targetSheetName = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];

    if (!worksheet) {
      throw new Error(`Sheet "${targetSheetName}" not found`);
    }

    // Convert sheet to JSON
    let rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: hasHeaders ? undefined : 1,
      defval: null,
      blankrows: !skipEmptyRows,
      raw: false,
    }) as Record<string, unknown>[];

    if (!rawData || rawData.length === 0) {
      return {
        success: true,
        data: [] as T[],
        metadata: {
          sheetName: targetSheetName,
          totalSheets: workbook.SheetNames.length,
          availableSheets: workbook.SheetNames,
          totalRows: 0,
          headers: headers || [],
        },
      };
    }

    // Apply custom headers if provided
    if (headers && Array.isArray(headers)) {
      rawData = applyCustomHeaders(rawData, headers);
    }

    // Process each row
    const processedData = rawData.map((row) =>
      processRow(row, { trimValues, convertNumbers })
    ) as T[];

    // Get headers from first row
    const detectedHeaders =
      processedData.length > 0
        ? Object.keys(processedData[0] as Record<string, unknown>)
        : [];

    return {
      success: true,
      data: processedData,
      metadata: {
        sheetName: targetSheetName,
        totalSheets: workbook.SheetNames.length,
        availableSheets: workbook.SheetNames,
        totalRows: processedData.length,
        headers: detectedHeaders,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      error: errorMessage,
      data: [] as T[],
      metadata: null,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read workbook from various input types
 */
async function readWorkbook(input: ExcelInput): Promise<XLSX.WorkBook> {
  // Browser File object
  if (typeof window !== "undefined" && input instanceof File) {
    const buffer = await input.arrayBuffer();
    return XLSX.read(buffer, { type: "array" });
  }

  // Node.js Buffer
  if (Buffer.isBuffer(input)) {
    return XLSX.read(input, { type: "buffer" });
  }

  // ArrayBuffer
  if (input instanceof ArrayBuffer) {
    return XLSX.read(input, { type: "array" });
  }

  // File path (Node.js only)
  if (typeof input === "string") {
    return XLSX.readFile(input);
  }

  throw new Error(
    "Invalid input type. Must be File, Buffer, ArrayBuffer, or file path string"
  );
}

/**
 * Apply custom headers to raw data
 */
function applyCustomHeaders(
  rawData: Record<string, unknown>[],
  headers: string[]
): Record<string, unknown>[] {
  return rawData.map((row) => {
    const newRow: Record<string, unknown> = {};
    const values = Object.values(row);

    headers.forEach((header, index) => {
      newRow[header] = values[index] !== undefined ? values[index] : null;
    });

    return newRow;
  });
}

/**
 * Process a single row
 */
function processRow(
  row: Record<string, unknown>,
  options: { trimValues: boolean; convertNumbers: boolean }
): Record<string, unknown> {
  const { trimValues, convertNumbers } = options;
  const processedRow: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    let processedValue: unknown = value;

    // Trim strings
    if (trimValues && typeof processedValue === "string") {
      processedValue = processedValue.trim();
    }

    // Convert empty strings to null
    if (processedValue === "") {
      processedValue = null;
    }

    // Convert numeric strings to numbers
    if (
      convertNumbers &&
      typeof processedValue === "string" &&
      processedValue !== null
    ) {
      const num = Number(processedValue);
      if (!isNaN(num) && processedValue !== "") {
        processedValue = num;
      }
    }

    processedRow[key] = processedValue;
  }

  return processedRow;
}

// ============================================================================
// React Hook for Next.js
// ============================================================================

import { useState, useCallback } from "react";
import {
  ExcelInput,
  ExcelMetadata,
  ExcelParseOptions,
  ExcelParseResult,
} from "@/app/types/resultsUpload";

export interface UseExcelParserReturn<T = Record<string, unknown>> {
  /** Parsed data */
  data: T[];
  /** Metadata about parsed file */
  metadata: ExcelMetadata | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Parse Excel file */
  parseFile: (
    file: File,
    options?: ExcelParseOptions
  ) => Promise<ExcelParseResult<T>>;
  /** Get available sheets */
  getSheets: (file: File) => Promise<string[]>;
  /** Reset state */
  reset: () => void;
}

/**
 * React Hook for parsing Excel files in Next.js
 *
 * @example
 * function MyComponent() {
 *   const { data, isLoading, error, parseFile } = useExcelParser<StudentGrade>();
 *
 *   const handleUpload = async (file: File) => {
 *     const result = await parseFile(file);
 *     if (result.success) {
 *       console.log('Parsed:', result.data);
 *     }
 *   };
 *
 *   return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
 * }
 */
export function useExcelParser<T = 1>(): UseExcelParserReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [metadata, setMetadata] = useState<ExcelMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(
    async (
      file: File,
      options?: ExcelParseOptions
    ): Promise<ExcelParseResult<T>> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await excelToJson<T>(file, options);

        if (result.success) {
          setData(result.data);
          setMetadata(result.metadata);
        } else {
          setError(result.error || "Failed to parse file");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
          data: [] as T[],
          metadata: null,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getSheets = useCallback(async (file: File): Promise<string[]> => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      return workbook.SheetNames;
    } catch (err) {
      console.error("Failed to get sheet names:", err);
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setMetadata(null);
    setError(null);
  }, []);

  return {
    data,
    metadata,
    isLoading,
    error,
    parseFile,
    getSheets,
    reset,
  };
}

// ============================================================================
// Usage Examples (Remove in production)
// ============================================================================

/*
// 1. Basic Usage - Utility Function
import { excelToJson } from '@/lib/excelParser';

async function handleFileUpload(file: File) {
  const result = await excelToJson(file);
  
  if (result.success) {
    console.log('Data:', result.data);
    console.log('Total rows:', result.metadata?.totalRows);
  } else {
    console.error('Error:', result.error);
  }
}

// 2. With Type Safety
import { excelToJson, StudentGrade } from '@/lib/excelParser';

async function parseStudentGrades(file: File) {
  const result = await excelToJson<StudentGrade>(file, {
    headers: ['Name', 'RegNo', 'Program', 'Test', 'Lab', 'Exam', 'Total', 'Grade', 'Remark']
  });
  
  if (result.success) {
    result.data.forEach(student => {
      console.log(`${student.Name}: ${student.Total}`); // Fully typed!
    });
  }
}

// 3. React Hook in Component
'use client'; // For Next.js App Router

import { useExcelParser, StudentGrade } from '@/lib/excelParser';

export default function ExcelUpload() {
  const { data, isLoading, error, parseFile, getSheets } = useExcelParser<StudentGrade>();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get available sheets first
    const sheets = await getSheets(file);
    console.log('Available sheets:', sheets);

    // Parse the file
    const result = await parseFile(file, {
      sheetName: sheets[0],
      hasHeaders: true,
    });

    if (result.success) {
      console.log('Parsed:', data);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleUpload} />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data.length > 0 && <p>Loaded {data.length} records</p>}
    </div>
  );
}

// 4. Server-Side (API Route)
// app/api/parse-excel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { excelToJson, StudentGrade } from '@/lib/excelParser';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await excelToJson<StudentGrade>(buffer);

  return NextResponse.json(result);
}

// 5. Advanced - Custom Processing
import { excelToJson } from '@/lib/excelParser';

async function parseWithValidation(file: File) {
  const result = await excelToJson<StudentGrade>(file, {
    headers: ['Name', 'RegNo', 'Program', 'Test', 'Lab', 'Exam', 'Total', 'Grade', 'Remark'],
    convertNumbers: true,
    trimValues: true,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  // Custom validation
  const validatedData = result.data.map(row => ({
    ...row,
    isValid: Boolean(row.Name && row.RegNo),
    totalScore: (row.Test || 0) + (row.Lab || 0) + (row.Exam || 0),
  }));

  return validatedData;
}
*/
