"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "../modals/reUsables";
import {
  CourseData,
  type TextFieldProps,
  SelectFieldProps,
} from "@/app/types/advisor";
import { Error, ModalForm } from "../secondary/common";
import {
  formatSessionInput,
  semesterOptions,
  unitsOptions,
} from "@/utils/systemUtils";

export function TextField({
  name,
  label,
  required,
  type = "text",
  id,
  onChange,
  placeholder,
}: TextFieldProps) {
  const { register, formState, setValue, watch } = useFormContext<CourseData>();
  const error = formState.errors[name as keyof CourseData]?.message as
    | string
    | undefined;

  const value = watch(name as keyof CourseData) || "";

  return (
    <div className="modal-field">
      {label && <Label htmlFor={id ?? String(name)}>{label}</Label>}

      <input
        id={id ?? String(name)}
        {...register(name as keyof CourseData, { required })}
        type={type}
        value={value}
        onChange={(e) => {
          let val: string = e.target.value;
          if (onChange) val = onChange(val) ?? val;
          setValue(name as keyof CourseData, val);
        }}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      {!!error && <Error>{error}</Error>}
    </div>
  );
}

export function SelectField({
  name,
  options,
  label,
  required,
  id,
  numeric,
}: SelectFieldProps) {
  const { register, formState } = useFormContext<CourseData>();
  const error = formState.errors[name as keyof CourseData]?.message as
    | string
    | undefined;

  return (
    <div className="modal-field">
      {label && <Label htmlFor={id ?? String(name)}>{label}</Label>}
      <select
        id={id ?? String(name)}
        {...register(name as keyof CourseData, { required })}
        aria-invalid={!!error}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <Error>{error}</Error>}
    </div>
  );
}

export function AdvisorCourseFields() {
  return (
    <ModalForm>
      {/*abeg o names must match your schema keys exactly */}
      <TextField
        name="courseCode" // <-- changed
        label="Course code"
        required
        placeholder="eg. GST101"
      />
      <TextField
        name="courseTitle" // <-- changed
        label="Course title"
        required
        placeholder="eg. General Studies"
      />
      <SelectField
        name="unit" // <-- changed
        label="Credit Units"
        options={unitsOptions}
        // If your SelectField needs to register with valueAsNumber,
        // it can accept a prop like numeric={true} and call register(name, { valueAsNumber: true })
      />
      <SelectField
        name="semester" // <-- changed
        label="Semester"
        options={semesterOptions}
      />
      <TextField
        name="session" // <-- matches schema
        label="Session"
        required
        onChange={formatSessionInput}
        placeholder="eg. 2024/2025"
      />
    </ModalForm>
  );
}
