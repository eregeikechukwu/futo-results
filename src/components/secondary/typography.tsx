import React from "react";

export function TextLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`secondary-heading font-medium  text-[var(--color-text-link)] ${
        className ?? ""
      }`}
    >
      {children}
    </h3>
  );
}

export function Heading2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-medium">{children}</h2>;
}
