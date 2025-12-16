import React from "react";
import { ModalForm } from "../secondary/common";
import { SelectField, TextField } from "../forms/reusables";
import {
  unitsOptions,
  semesterOptions,
  formatSessionInput,
} from "@/utils/systemUtils";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      className="secondary-heading block text-[var(--color-text-dark)] mb-8"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export function Input({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label className="secondary-heading" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
