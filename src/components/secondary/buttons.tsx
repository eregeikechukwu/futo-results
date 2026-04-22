import React from "react";

export function AuthCTABtn({
  children,
  CTA,
  isSubmitting,
}: {
  children: React.ReactNode;
  CTA: () => void;
  isSubmitting: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`text-medium cursor-pointer transition-all hover:bg-[var(--color-blue-light)] rounded-small shadow-xl center-child bg-[var(--color-primary)] group text-[var(--color-white)]  py-16 w-full ${isSubmitting && "opacity-70 cursor-not-allowed hover:bg-[var(--color-primary)]"}`}
      onClick={CTA}
    >
      <p className=" flex items-center">{children}</p>
    </button>
  );
}

export function CustomBtn({
  children,
  onClick,
  className = "",
}: {
  children: string;
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
