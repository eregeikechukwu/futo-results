import { ParsedResult } from "@/app/types/resultsUpload";
import { computeGrade } from "@/utils/systemUtils";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

// Calculate stats
export const resultStats = (parsedJson: ParsedResult[]) => {
  if (parsedJson.length === 0)
    return {
      avgScore: 0,
      passRate: 0,
      gradeDistribution: {} as Record<string, number>,
      totalStudents: 0,
      passCount: 0,
      failCount: 0,
    };

  let totalScore = 0;
  let passCount = 0;
  const gradeDistribution: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  };

  parsedJson.forEach((row) => {
    const test = parseInt(row.test || "0");
    const lab = parseInt(row.lab || "0");
    const exam = parseInt(row.exam || "0");
    const total = test + lab + exam;
    const grade = computeGrade(total);

    totalScore += total;
    if (grade !== "F") passCount++;
    gradeDistribution[grade]++;
  });

  return {
    avgScore: (totalScore / parsedJson.length).toFixed(2),
    passRate: ((passCount / parsedJson.length) * 100).toFixed(1),
    gradeDistribution,
    totalStudents: parsedJson.length,
    passCount,
    failCount: parsedJson.length - passCount,
  };
};

export const handleResultTableChange = (
  index: number,
  field: string,
  value: string,
  setErrors: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, string>>>
  >,
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>,
) => {
  setParsedJson((prev) => {
    const updatedResults = [...prev];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    return updatedResults;
  });

  // Clear error for this specific field when editing
  setErrors((prev) => {
    const rowErrors = prev[index] ? { ...prev[index] } : {};
    if (rowErrors[field]) {
      delete rowErrors[field];
    }
    const newErrors = { ...prev };
    if (Object.keys(rowErrors).length > 0) newErrors[index] = rowErrors;
    else delete newErrors[index];
    return newErrors;
  });
};

export const handleImportFromExcel = (
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>,
) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const result = (event.target as FileReader).result as ArrayBuffer;
        const workbook = XLSX.read(result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet) as Record<
          string,
          unknown
        >[];

        const asString = (v: unknown) =>
          v === null || v === undefined ? null : String(v);

        const importedData: ParsedResult[] = data.map((row) => ({
          name: asString(row["Name"]),
          regNo: asString(row["RegNo"]),
          test: String(row["Test"] ?? 0),
          lab: String(row["Lab"] ?? 0),
          exam: String(row["Exam"] ?? 0),
          total: String(row["Total"] ?? 0),
          grade: asString(row["Grade"]),
          remark: asString(row["Remark"]),
        }));

        setParsedJson(importedData);
        toast.success(`Successfully imported ${importedData.length} records`);
      } catch (error) {
        toast.error("Error importing file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
};

export const handleExportToExcel = (
  parsedJson: ParsedResult[],
  courseCode: string,
) => {
  const ws = XLSX.utils.json_to_sheet(
    parsedJson.map((row) => ({
      Name: row.name,
      RegNo: row.regNo,
      Test: row.test,
      Lab: row.lab,
      Exam: row.exam,
      Total:
        parseInt(row.test || "0") +
        parseInt(row.lab || "0") +
        parseInt(row.exam || "0"),
      Grade: computeGrade(
        parseInt(row.test || "0") +
          parseInt(row.lab || "0") +
          parseInt(row.exam || "0"),
      ),
      Remark: row.remark,
    })),
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, `results-${courseCode || "export"}.xlsx`);
};

export const handleDownloadTemplate = () => {
  const templateData = [
    {
      Name: "John Doe",
      RegNo: "20231245883",
      Test: 15,
      Lab: 18,
      Exam: 45,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "results-template.xlsx");
};

export const validateJsonData = (
  parsedJson: ParsedResult[],
  setErrors: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, string>>>
  >,
) => {
  const newErrors: Record<number, Record<string, string>> = {};

  parsedJson.forEach((row, index) => {
    const rowErrors: Record<string, string> = {};

    if (!row.regNo || !String(row.regNo).trim())
      rowErrors["regNo"] = "RegNo is required";
    else if (row.regNo.toString().length !== 11)
      rowErrors["regNo"] = "RegNo must be 11 digits";

    const test = parseInt(row.test || "0");
    const lab = parseInt(row.lab || "0");
    const exam = parseInt(row.exam || "0");

    if (isNaN(test)) rowErrors["test"] = "Test must be a number";
    else if (test < 0 || test > 50) rowErrors["test"] = "Test must be 0-50";

    if (isNaN(lab)) rowErrors["lab"] = "Lab must be a number";
    else if (lab < 0 || lab > 100) rowErrors["lab"] = "Lab must be 0-100";

    if (isNaN(exam)) rowErrors["exam"] = "Exam must be a number";
    else if (exam < 0 || exam > 100) rowErrors["exam"] = "Exam must be 0-100";

    if (Object.keys(rowErrors).length > 0) newErrors[index] = rowErrors;
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
