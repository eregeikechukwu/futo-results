import React from "react";
import { LoaderSpinner3 } from "./loaders/loaders";
import { RefreshCcw } from "lucide-react";
import { colorMap } from "@/utils/colorMaps";

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
      className={`button-primary flex gap-10 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"}`}
      onClick={CTA as () => void}
    >
      <p className=" flex items-center">{children}</p>
      {isSubmitting && <LoaderSpinner3 size={15} />}
    </button>
  );
}

export function CTAButton({
  onClickCTA,
  isMutating,
  label,
}: {
  onClickCTA: () => void;
  isMutating: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClickCTA}
      disabled={isMutating}
      className="button-primary flex gap-8 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
      {isMutating && <LoaderSpinner3 size={10} />}
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
      className={`py-8 px-24 lh-24 text-center rounded-lg border-solid cursor-pointer hover:opacity-80 active:opacity-90 transition-all ${className}`}
    >
      {children}
    </button>
  );
}

export function VariantBtn({
  variant,
  children,
  onClick,
  isLoading,
}: {
  variant: "green" | "blue" | "red";
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="button-primary flex gap-8 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 active:opacity-90 transition-all"
      style={{
        backgroundColor: colorMap[variant].colour,
      }}
    >
      {children}
      {isLoading && <LoaderSpinner3 size={10} />}
    </button>
  );
}

// Rferesh
export function RefetchButton({ refetch }: { refetch: () => void }) {
  return (
    <button
      className="group py-10 px-10 center-child rounded-lg border-solid border border-(--color-border-light) cursor-pointer"
      onClick={refetch}
    >
      <RefreshCcw
        className="group-hover:rotate-50 transition-all duration-300"
        size={20}
      />
    </button>
  );
}
