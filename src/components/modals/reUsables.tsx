import React from "react";

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
