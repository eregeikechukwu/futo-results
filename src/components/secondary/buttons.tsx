import React from "react";
import { LoaderSpinner3 } from "./loaders/loaders";

export function AuthCTABtn({
  children,
  CTA,
  isSubmitting,
}: {
  children: React.ReactNode;
  CTA: () => void;
  isSubmitting?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`flex gap-10 text-medium cursor-pointer transition-all hover:bg-[var(--color-blue-light)] rounded-small shadow-xl center-child bg-[var(--color-primary)] group text-[var(--color-white)]  py-16 w-full ${isSubmitting && "opacity-70 cursor-not-allowed hover:bg-[var(--color-primary)]"}`}
      onClick={CTA as () => void}
    >
      <p className=" flex items-center">{children}</p>
      {isSubmitting && <LoaderSpinner3 />}
    </button>
  );
}

export function CustomBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-8 px-24 lh-24 text-center rounded-[8px] border-solid cursor-pointer hover:opacity-80 active:opacity-90 transition-all ${className}`}
    >
      {children}
    </button>
  );
}
