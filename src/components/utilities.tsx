import { Info, LucideCircleAlert, TriangleAlert, X } from "lucide-react";
import { Logo } from "./secondary/logo";
import { error } from "console";
import React from "react";
import styles from "./utilities.module.scss";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authCard}>
      <div className={styles.authLogo}>
        <Logo width={64} />
      </div>
      {children}
    </div>
  );
}

export function AuthHeading({
  heading,
  subHeading,
}: {
  heading: string;
  subHeading: string;
}) {
  return (
    <div className={styles.authHeading}>
      <h1 className={styles.authHeadingTitle} data-metatip="true">
        {heading}
      </h1>
      <p className={styles.authHeadingSub}>{subHeading}</p>
    </div>
  );
}

export function InfoCard({
  heading,
  children,
  type,
  variant = "small",
}: {
  heading: string;
  children: React.ReactNode;
  type: "warning" | "success" | "error" | "info";
  variant?: "small" | "medium";
}) {
  const variants = {
    small: "p-17 rounded-small lh-16 text-12",
    medium: "p-17 rounded-[8px] secondary-heading",
  };

  const typemap = {
    warning:
      "text-[var(--color-text-brown)] border-[var(--color-brown-border)] bg-[var(--color-brown-background)]",
    success:
      "text-[var(--color-text-green)] border-[var(--color-text-green)] bg-[var(--color-green-background)]",
    error:
      "text-[var(--color-text-red)] border-[var(--color-text-red)] bg-[var(--color-red-background)]",
    info: "text-[var(--color-text-blue)] !border-none bg-[var(--color-blue-background)]",
  };
  const iconMap = {
    info: Info,
    warning: TriangleAlert,
    success: LucideCircleAlert,
    error: X,
  };

  return (
    <div
      className={`w-full border-solid border-[2px]  text-left flex gap-8 ${typemap[type]} ${variants[variant]}`}
    >
      {React.createElement(iconMap[type], { width: 22, height: 22 })}
      <div>
        <h3 className="font-semibold text-14 mb-3">{heading}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
}

//Dashboard logo

export function DashboardLogo({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-medium bg-[var(--color-primary)] font-[600] gap-8 h-64 center-child  lh-28 text-white">
      <Logo width={32} />
      {children}
    </div>
  );
}

export function SquareDot({ color }: { color: string }) {
  const bgColor = color || "var(--color-text-passive)";
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`rounded-[4px] mr-12 h-16 w-16 ${bgColor}`}
    />
  );
}
