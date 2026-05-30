"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "../modals/reUsables";
import {
  CourseData,
  type TextFieldProps,
  SelectFieldProps,
  SelectOptions,
} from "@/app/types/advisor";
import { Error, ModalForm } from "../secondary/common";
import {
  formatSessionInput,
  semesterOptions,
  unitsOptions,
} from "@/utils/systemUtils";
import { AddedResult } from "@/app/types/resultsUpload";

export function TextFieldResult({
  name,
  label,
  required,
  type = "text",
  id,
  onChange,
  placeholder,
  pattern,
  inputMode,
  maxLength = 100,
}: TextFieldProps) {
  const { register, formState, setValue, watch } =
    useFormContext<AddedResult>();
  const error = formState.errors[name as keyof AddedResult]?.message as
    | string
    | undefined;

  const value = watch(name as keyof AddedResult) || "";

  return (
    <div className="modal-field">
      {label && <Label htmlFor={id ?? String(name)}>{label}</Label>}

      <input
        id={id ?? String(name)}
        {...register(name as keyof AddedResult, { required })}
        type={type}
        value={value}
        pattern={pattern}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => {
          let val: string | number = e.target.value;
          if (onChange) val = onChange(val) ?? val;
          if (type === "number") val = Number(val);
          console.log(val);
          setValue(name as keyof AddedResult, val);
        }}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      {!!error && <Error>{error}</Error>}
    </div>
  );
}

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
          let val: string | number = e.target.value;
          if (onChange) val = onChange(val) ?? val;
          setValue(name as keyof CourseData, String(val));
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

export function AdvisorCourseFields({
  termOptions = semesterOptions,
  loading = true,
  error,
}: {
  termOptions?: SelectOptions[];
  loading?: boolean;
  error?: Error;
}) {
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
      {loading ? (
        <p>Loading terms...</p>
      ) : error ? (
        <Error>Error loading terms: {error.message}</Error>
      ) : (
        <SelectField
          name="term" // <-- changed
          label="Term"
          options={termOptions}
        />
      )}
    </ModalForm>
  );
}

export function Form({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit?: () => void;
}) {
  const submit = onSubmit
    ? (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
      }
    : undefined;

  return (
    <form
      onSubmit={(e) => submit && submit(e)}
      className="flex flex-col h-full gap-16"
    >
      {children}
    </form>
  );
}
