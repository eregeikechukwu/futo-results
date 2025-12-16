"use client";

import React, { useState, useCallback } from "react";
import { CustomBtn } from "../secondary/buttons";
import { InfoCard } from "../utilities";
import { editCourseFields } from "@/utils/systemUtils";

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
  setParsedJson: React.Dispatch<
    React.SetStateAction<Record<string, string | null>[]>
  >;
  parsedJson: Record<string, string | null>[];
  setIsEditting: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
}) {
  const [errors, setErrors] = useState<Record<number, string[]>>({});
  const [courseCode, setCourseCode] = useState("");

  const handleChange = useCallback(
    (index: number, field: string, value: string) => {
      setParsedJson((prev) => {
        const updatedResults = [...prev];
        updatedResults[index] = { ...updatedResults[index], [field]: value };
        return updatedResults;
      });

      // Clear errors for this row when editing
      setErrors((prev) => {
        if (prev[index]) {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        }
        return prev;
      });
    },
    [setParsedJson]
  );

  const validateData = useCallback(() => {
    const newErrors: Record<number, string[]> = {};

    parsedJson.forEach((row, index) => {
      const rowErrors: string[] = [];

      console.log(parsedJson, "  From the validator");

      // console.log(row, "Parsed Json row");
      if (!row.Name?.trim()) rowErrors.push("Name is required");
      if (!row.RegNo?.trim()) rowErrors.push("RegNo is required");

      const test = parseInt(row.Test || "0");
      const lab = parseInt(row.Lab || "0");
      const exam = parseInt(row.Exam || "0");

      if (isNaN(test) || test < 0 || test > 30)
        rowErrors.push("Test must be 0-30");
      if (isNaN(lab) || lab < 0 || lab > 10) rowErrors.push("Lab must be 0-10");
      if (isNaN(exam) || exam < 0 || exam > 60)
        rowErrors.push("Exam must be 0-60");

      if (rowErrors.length > 0) {
        newErrors[index] = rowErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [parsedJson]);

  const handleSubmit = useCallback(() => {
    if (!courseCode.trim()) {
      alert("Please enter a course code");
      return;
    }

    if (!validateData()) {
      alert("Please fix validation errors before submitting");
      return;
    }

    // Your submission logic here
    console.log("Submitting:", { courseCode, results: parsedJson });
  }, [courseCode, parsedJson, validateData]);

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

        {/* BUttons */}
        <div>
          <CustomBtn
            onClick={() => setIsEditting(false)}
            className="border-[#d1d5db] border-1 text-[var(--color-text-link)] bg-white"
          >
            Cancel
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
      <div className="flex gap-4 w-full">
        <label className="label">Course Code: </label>
        <input
          type="text"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="modal-input flex-1"
          placeholder="eg: GET210"
        />

        <p>{parsedJson.length} results found</p>
      </div>

      {/* Validation Errors Display */}
      {Object.keys(errors).length > 0 && (
        <InfoCard type="error" heading="Validation Errors" variant="medium">
          {Object.entries(errors).map(([index, rowErrors]) => (
            <div key={index} className="mb-2">
              <strong>Row {parseInt(index) + 1}:</strong> {rowErrors.join(", ")}
            </div>
          ))}
        </InfoCard>
      )}

      {/* Edit table */}
      <div className="overflow-auto">
        <table className="table overflow-auto">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {parsedJson.map((course, index) => (
              <tr
                key={`${course.RegNo}-${index}-row`}
                className={errors[index] ? "bg-red-300" : ""}
              >
                {editCourseFields.map((field) => (
                  <td key={field.name} className={`${field.className}`}>
                    <input
                      value={course[field.name] || ""}
                      maxLength={field.maxLength}
                      onChange={(e) => {
                        handleChange(index, field.name, e.target.value);
                      }}
                      type={field.type}
                      placeholder={field.placeholder}
                      className={`outline-none ${field.className} ${
                        errors[index]
                          ? "rounded-[4px] border-solid border-1 border-red-500"
                          : "border-none"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
