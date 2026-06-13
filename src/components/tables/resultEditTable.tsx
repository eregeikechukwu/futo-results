"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CustomBtn } from "../secondary/buttons";
import { InfoCard } from "../utilities";
import {
  computeGrade,
  editCourseFields,
  gradeToneMap,
} from "@/utils/systemUtils";
import { useModalTemplate } from "../modals/overlay";
import { AddResultForm } from "../forms/addResult";
import { ParsedResult, UploadResult } from "@/app/types/resultsUpload";
import { RotateCcw, Download, Upload, Eye, EyeOff } from "lucide-react";
import {
  handleDownloadTemplate,
  handleExportToExcel,
  handleImportFromExcel,
  handleResultTableChange,
  resultStats,
  validateJsonData,
} from "@/helpers/resultEdit";
import toast from "react-hot-toast";
import { useUploadExcelResults } from "@/lib/hooks/useUploadResult";
import { useAuth } from "@/contexts/AuthContext";
import { errorToastHandler } from "@/helpers/errorHandler";
import { CoverLoader } from "../secondary/loaders/coverLoader";
import ConfirmationModal from "../secondary/confirmationModal";

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
  courseCode,
  courseOfferingId,
  setParsedJson,
  parsedJson,
  closeEditting,
  mode,
}: {
  courseCode: string;
  courseOfferingId: string;
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>;
  parsedJson: ParsedResult[];
  closeEditting: () => void;
  mode: string;
}) {
  // errors -> row index -> field name -> error message
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Get advisor data
  const { profile: advisorProfile } = useAuth();

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
  // SUbmit/upload handler
  const {
    mutate: uploadResultMutate,
    isPending,
    error,
  } = useUploadExcelResults();

  //Type course modal handler
  const { ModalTemplate, toggleModal } = useModalTemplate();
  // Confirmation modal state
  const [isCancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [isPublishConfirmationOpen, setPublishConfirmationOpen] =
    useState(false);

  // Add to history when data changes
  useEffect(() => {
    if (JSON.stringify(parsedJson) !== JSON.stringify(history[historyIndex])) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(parsedJson);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [parsedJson, history, historyIndex]);

  // Calculate stats
  const statsData = resultStats(parsedJson);

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

  // const validateData = validateJsonData(parsedJson, setErrors);

  //Main submission function
  const handleSubmit = useCallback(() => {
    //  submission logic here
    const formattedResults: UploadResult[] = parsedJson.map((entry) => ({
      reg_number: `${entry.regNo}`,
      test_score: Number(entry.test),
      exam_score: Number(entry.exam),
      lab_score: Number(entry.lab),
    }));

    uploadResultMutate(
      {
        courseOfferingId: courseOfferingId,
        parsedRows: formattedResults,
        advisorProfileId: advisorProfile?.id || "",
      },
      {
        onSuccess: (result) => {
          //   Build inofrmative success message
          const msg =
            result.unmatched.length > 0
              ? `${result.inserted} entries uploaded, ${result.unmatched.length} reg numbers not found: ${result.unmatched.join(",")}`
              : `${result.inserted} entries uploaded successfully.`;

          toast.success(msg, {
            duration: 20000,
          });
          setTimeout(() => {
            toast.success(
              "Go to the Results Management page and publish the results for students to view.",
            );
          }, 2500);
          closeEditting();
        },
        onError: (error) => {
          errorToastHandler(
            error,
            "Failed to upload results. Please try again.",
          );
        },
      },
    );
  }, [parsedJson]);

  const handleSubmitCallback = useCallback(() => {
    if (!validateJsonData(parsedJson, setErrors)) {
      toast.error("Please fix validation errors before submitting");
      return;
    }
    if (!courseOfferingId?.trim()) {
      toast.error("No course offering selected");
      return;
    }
    if (parsedJson.length === 0) {
      toast.error("No results to submit");
      return;
    }

    setPublishConfirmationOpen(true);

    /*toast.success(
      `Successfully saved ${parsedJson.length} results for course ${courseCode}`,
    );
    closeEditting();

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
    } */
  }, [courseCode, parsedJson, setErrors]);

  // Filter parsed data based on search query
  const filteredData = parsedJson.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row.name?.toLowerCase().includes(query) ||
      String(row.regNo).includes(query)
    );
  });

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
          <h3 className="text-(--color-text-link)">
            Review and edit extracted data before saving
          </h3>
        </div>

        {/* Buttons */}
        <div>
          <CustomBtn
            onClick={() => setCancelConfirmationOpen(true)}
            className="border-[#d1d5db] border text-(--color-text-link) bg-white"
          >
            Cancel
          </CustomBtn>
          <CustomBtn
            onClick={toggleModal}
            className="border-[#d1d5db] border text-(--color-text-link) ml-12"
          >
            Type in result
          </CustomBtn>
          <CustomBtn
            onClick={() => handleSubmitCallback()}
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
        entries by clicking on them. After reviewing and saving the results, you
        can go to the Results Management page and publish the results for
        students to view.
      </InfoCard>

      {/* Course details input */}
      <div className="flex gap-4 w-full items-center">
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
          className="px-12 py-8 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="Undo last change"
        >
          <RotateCcw size={16} /> Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="px-12 py-8 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="Redo last change"
        >
          <RotateCcw size={16} className="rotate-180" /> Redo
        </button>
        <button
          onClick={() => handleExportToExcel(parsedJson, courseCode)}
          className="px-12 py-8 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-all flex items-center gap-2"
          title="Export to Excel"
        >
          <Download size={16} /> Export
        </button>
        <button
          onClick={() => handleImportFromExcel(setParsedJson)}
          className="px-12 py-8 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-all flex items-center gap-2"
          title="Import from Excel"
        >
          <Upload size={16} /> Import
        </button>
        <button
          onClick={handleDownloadTemplate}
          className="px-12 py-8 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-all flex items-center gap-2"
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
                handleChange={(rowIndex, field, value) =>
                  handleResultTableChange(
                    rowIndex,
                    field,
                    value,
                    setErrors,
                    setParsedJson,
                  )
                }
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

      {/* Loader that covers the table */}
      {isPending && <CoverLoader />}

      {/* COnfirmation */}
      <ConfirmationModal
        open={isCancelConfirmationOpen}
        onCancel={() => setCancelConfirmationOpen(false)}
        message="discard your changes and close the editor"
        variant="warning"
        onConfirm={closeEditting}
      />
      {/* COnfirmation */}
      <ConfirmationModal
        open={isPublishConfirmationOpen}
        onCancel={() => setPublishConfirmationOpen(false)}
        message="Approve and save results"
        variant="warning"
        confirmLabel="Approve"
        canBeUndone={true}
        onConfirm={handleSubmit}
        isMutating={isPending}
      />
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
      return gradeToneMap[computedGrade].text;
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
      key={`${index * 2}-${index}-row`}
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
                onChange={(e) => {
                  handleChange(index, field.name, e.target.value);
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
                    ? "rounded-sm border-solid border border-red-500"
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
          className="px-12 py-6 bg-red-500 text-white rounded-sm text-sm hover:bg-red-600 active:opacity-90 transition-all cursor-pointer"
          title="Delete this row"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
