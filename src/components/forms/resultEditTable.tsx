"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CustomBtn } from "../secondary/buttons";
import { InfoCard } from "../utilities";
import { computeGrade, editCourseFields } from "@/utils/systemUtils";
import { useModalTemplate } from "../modals/overlay";
import { AddResultForm } from "./addResult";
import { ParsedResult } from "@/app/types/resultsUpload";
import * as XLSX from "xlsx";
import { RotateCcw, Download, Upload, Eye, EyeOff } from "lucide-react";

const tableHeaders = [
  "Name",
  "RegNo",
  "Test",
  "Lab",
  "Exam",
  "Total",
  "Grade",
  "Remark",
];

export function ResultEditTable({
  setParsedJson,
  parsedJson,
  setIsEditting,
  mode,
}: {
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>;
  parsedJson: ParsedResult[];
  setIsEditting: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
}) {
  // errors -> row index -> field name -> error message
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {},
  );
  const [courseCode, setCourseCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Undo/Redo Stack
  const [history, setHistory] = useState<ParsedResult[][]>([parsedJson]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      Name: true,
      RegNo: true,
      Test: true,
      Lab: true,
      Exam: true,
      Total: false,
      Grade: false,
      Remark: false,
    },
  );

  // Filter parsed data based on search query
  const filteredData = parsedJson.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row.name?.toLowerCase().includes(query) ||
      String(row.regNo).includes(query)
    );
  });

  // Calculate stats
  const stats = useCallback(() => {
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
  }, [parsedJson]);

  const statsData = stats();

  //Type course modal handler
  const { ModalTemplate, toggleModal } = useModalTemplate();

  // Add to history when data changes
  useEffect(() => {
    if (JSON.stringify(parsedJson) !== JSON.stringify(history[historyIndex])) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(parsedJson);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [parsedJson, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setParsedJson(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history, setParsedJson]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setParsedJson(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history, setParsedJson]);

  const handleChange = useCallback(
    (index: number, field: string, value: string) => {
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
    },
    [setParsedJson],
  );

  const validateData = useCallback(() => {
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
  }, [parsedJson]);

  //Main submission function
  const handleSubmit = useCallback(() => {
    if (!validateData()) {
      alert("Please fix validation errors before submitting");
      return;
    }
    if (!courseCode.trim()) {
      alert("Please enter a course code");
      return;
    }

    //  submission logic here
    alert(
      `Successfully saved ${parsedJson.length} results for course ${courseCode}`,
    );
    setIsEditting(false);

    //Save in local storage
    const alreadySavedResults = localStorage.getItem(`results-${courseCode}`);
    if (!alreadySavedResults) {
      localStorage.setItem(`results-${courseCode}`, JSON.stringify(parsedJson));
    } else {
      const existingResults: ParsedResult[] = JSON.parse(alreadySavedResults);
      const updatedResults = [...existingResults, ...parsedJson];
      localStorage.setItem(
        `results-${courseCode}`,
        JSON.stringify(updatedResults),
      );
    }
  }, [courseCode, parsedJson, validateData]);

  const handleDeleteRow = useCallback(
    (indexToDelete: number) => {
      const actualIndex = parsedJson.indexOf(filteredData[indexToDelete]);
      setParsedJson((prev) => prev.filter((_, idx) => idx !== actualIndex));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[actualIndex];
        return newErrors;
      });
    },
    [parsedJson, filteredData, setParsedJson],
  );

  const handleExportToExcel = useCallback(() => {
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
  }, [parsedJson, courseCode]);

  const handleDownloadTemplate = useCallback(() => {
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
  }, []);

  const handleImportFromExcel = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const data: any[] = XLSX.utils.sheet_to_json(sheet);

          const importedData: ParsedResult[] = data.map((row) => ({
            name: row.Name || null,
            regNo: row.RegNo || null,
            test: String(row.Test || 0),
            lab: String(row.Lab || 0),
            exam: String(row.Exam || 0),
            total: String(row.Total || 0),
            grade: row.Grade || null,
            remark: row.Remark || null,
          }));

          setParsedJson(importedData);
          alert(`Successfully imported ${importedData.length} records`);
        } catch (error) {
          alert("Error importing file. Please check the format.");
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  }, [setParsedJson]);

  const toggleColumnVisibility = useCallback((column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const errorCount = Object.keys(errors).length;
  const hasErrors = errorCount > 0;

  return (
    <div className="dashboard-container flex flex-col gap-24">
      <div className="flex justify-between ">
        {/* Heading */}
        <div>
          <h2 className="text-medium">{mode} Extraction Preview</h2>
          <h3 className="text-[var(--color-text-link)]">
            Review and edit extracted data before saving
          </h3>
        </div>

        {/* Buttons */}
        <div>
          <CustomBtn
            onClick={() => setIsEditting(false)}
            className="border-[#d1d5db] border-1 text-[var(--color-text-link)] bg-white"
          >
            Cancel
          </CustomBtn>
          <CustomBtn
            onClick={toggleModal}
            className="border-[#d1d5db] border-1 text-[var(--color-text-link)] ml-12"
          >
            Type in result
          </CustomBtn>
          <CustomBtn
            onClick={handleSubmit}
            className="text-white font-medium bg-[#9333ea] ml-12"
          >
            Approve & save results
          </CustomBtn>
        </div>
      </div>

      <InfoCard
        type="warning"
        heading={`${mode} Extraction Complete`}
        variant="medium"
      >
        Please review the extracted data below. You can edit any incorrect
        entries by clicking on them. Make sure the course code inputted here
        matches the one used to add the course.
      </InfoCard>

      {/* Course details input */}
      <div className="flex gap-4 w-full items-center">
        <label className="label">Course Code: </label>
        <input
          type="text"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="modal-input flex-1 px-2 py-1"
          placeholder="eg: GET210"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="modal-input flex-1 px-2 py-1"
          placeholder="Search by name or RegNo..."
        />

        <p className="whitespace-nowrap">{filteredData.length} results found</p>
      </div>

      {/* Quick Stats Panel */}
      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600">Total Students</p>
          <p className="text-xl font-bold">{statsData.totalStudents}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600">Average Score</p>
          <p className="text-xl font-bold">{statsData.avgScore}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600">Pass Rate</p>
          <p className="text-xl font-bold text-green-600">
            {statsData.passRate}%
          </p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600">Data Quality</p>
          <p
            className={`text-xl font-bold ${
              hasErrors ? "text-red-600" : "text-green-600"
            }`}
          >
            {hasErrors ? `${errorCount} errors` : "✓ Valid"}
          </p>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold mb-2">Grade Distribution</p>
        <div className="flex gap-2">
          {["A", "B", "C", "D", "E", "F"].map((grade) => (
            <div key={grade} className="flex flex-col items-center">
              <div className="text-sm font-bold">{grade}</div>
              <div className="text-xs text-gray-600">
                {(statsData.gradeDistribution as Record<string, number>)[
                  grade
                ] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="px-12 py-8 bg-blue-100 text-blue-700 rounded-[8px] text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="Undo last change"
        >
          <RotateCcw size={16} /> Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="px-12 py-8 bg-blue-100 text-blue-700 rounded-[8px] text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="Redo last change"
        >
          <RotateCcw size={16} className="rotate-180" /> Redo
        </button>
        <button
          onClick={handleExportToExcel}
          className="px-12 py-8 bg-green-100 text-green-700 rounded-[8px] text-sm hover:bg-green-200 transition-all flex items-center gap-2"
          title="Export to Excel"
        >
          <Download size={16} /> Export
        </button>
        <button
          onClick={handleImportFromExcel}
          className="px-12 py-8 bg-orange-100 text-orange-700 rounded-[8px] text-sm hover:bg-orange-200 transition-all flex items-center gap-2"
          title="Import from Excel"
        >
          <Upload size={16} /> Import
        </button>
        <button
          onClick={handleDownloadTemplate}
          className="px-12 py-8 bg-purple-100 text-purple-700 rounded-[8px] text-sm hover:bg-purple-200 transition-all flex items-center gap-2"
          title="Download template"
        >
          <Download size={16} /> Template
        </button>
      </div>

      {/* Column Visibility Toggle */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-semibold mb-2">Show/Hide Columns</p>
        <div className="flex gap-4 flex-wrap">
          {tableHeaders.map((header) => (
            <button
              key={header}
              onClick={() => toggleColumnVisibility(header)}
              className={`px-3 py-2 rounded text-sm flex items-center gap-1 ${
                visibleColumns[header]
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              } hover:opacity-80 transition-all`}
            >
              {visibleColumns[header] ? (
                <Eye size={14} />
              ) : (
                <EyeOff size={14} />
              )}
              {header}
            </button>
          ))}
        </div>
      </div>

      {/* Edit table */}
      <div className="overflow-auto">
        <table className="table overflow-auto">
          <thead>
            <tr>
              {tableHeaders.map((header) =>
                visibleColumns[header] ? <th key={header}>{header}</th> : null,
              )}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((course, index) => (
              <TableRow
                key={index}
                course={course}
                index={index}
                errors={errors}
                handleChange={handleChange}
                onDelete={() => handleDeleteRow(index)}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Type result modal */}
      <ModalTemplate title="Type Result">
        <AddResultForm
          toggleModal={toggleModal}
          setParsedJson={setParsedJson}
        />
      </ModalTemplate>
    </div>
  );
}
export function TableRow({
  course,
  index,
  errors,
  handleChange,
  onDelete,
  visibleColumns,
}: {
  course: ParsedResult;
  index: number;
  errors: Record<number, Record<string, string>>;
  handleChange: (index: number, field: string, value: string) => void;
  onDelete: () => void;
  visibleColumns: Record<string, boolean>;
}) {
  const [tempValue, setTempValue] = useState(course);
  useEffect(() => setTempValue(course), [course]);
  function calculateTotal(course: ParsedResult): number {
    const test = parseInt(course.test || "0");
    const lab = parseInt(course.lab || "0");
    const exam = parseInt(course.exam || "0");
    return (
      (isNaN(test) ? 0 : test) +
      (isNaN(lab) ? 0 : lab) +
      (isNaN(exam) ? 0 : exam)
    );
  }

  const fieldStyles = (fieldName: string) => {
    const total = calculateTotal(tempValue);
    const computedGrade = computeGrade(total);
    const computedRemark = computedGrade === "F" ? "FAIL" : "PASS";

    if (fieldName === "grade") {
      switch (computedGrade) {
        case "A":
          return "#16a34a"; // green-600
        case "B":
          return "#2563eb"; // blue-600
        case "C":
          return "#ca8a04"; // yellow-600
        case "D":
          return "#ea580c"; // orange-600
        case "F":
          return "#dc2626"; // red-600
        default:
          return "#000000";
      }
    }
    if (fieldName === "remark") {
      switch (computedRemark) {
        case "PASS":
          return "#16a34a"; // green-600
        case "FAIL":
          return "#dc2626"; // red-600
        default:
          return "";
      }
    }
    return undefined;
  };

  return (
    <tr
      key={`${course.regNo}-${index}-row`}
      className={
        errors[index] && Object.keys(errors[index]).length > 0
          ? "bg-red-300"
          : ""
      }
    >
      {editCourseFields.map((field, field_index) => {
        const fieldError = errors[index]?.[field.name];
        const value =
          field.name === "total"
            ? calculateTotal(tempValue)
            : field.name === "grade"
              ? computeGrade(calculateTotal(tempValue))
              : field.name === "remark"
                ? computeGrade(calculateTotal(tempValue)) === "F"
                  ? "FAIL"
                  : "PASS"
                : (course as ParsedResult)[field.name as keyof ParsedResult] ||
                  "";

        // Map lowercase field names to capitalized column headers
        const headerName =
          field.name.charAt(0).toUpperCase() + field.name.slice(1);

        // Skip rendering if column is hidden
        if (!visibleColumns[headerName]) return null;

        return (
          <td key={field.name} className={`${field.className}`}>
            <div className="flex flex-col">
              <input
                value={value}
                maxLength={field.maxLength}
                onChange={(e) => { handleChange(index, field.name, e.target.value);
                  setTempValue({ ...tempValue, [field.name]: e.target.value });
                 
                }}
                readOnly={field.readonly}
                key={`${field.name}-${field_index}`}
                type={field.type}
                placeholder={field.placeholder}
                style={{ color: fieldStyles(field.name) }}
                aria-invalid={fieldError ? true : undefined}
                className={`outline-none ${field.className} ${
                  fieldError
                    ? "rounded-[4px] border-solid border-1 border-red-500"
                    : "border-none"
                }`}
              />
              {fieldError && (
                <div className="text-red-600 text-xs mt-1">{fieldError}</div>
              )}
            </div>
          </td>
        );
      })}
      <td className="flex items-center justify-center py-2">
        <button
          onClick={onDelete}
          className="px-12 py-6 bg-red-500 text-white rounded-[4px] text-sm hover:bg-red-600 active:opacity-90 transition-all cursor-pointer"
          title="Delete this row"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
