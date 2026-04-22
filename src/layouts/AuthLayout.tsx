"use client";

import Image from "next/image";
import styles from "./AuthLayout.module.scss";
export default function AuthLayout({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "student" | "advisor";
}) {
  const vectorImage =
    type === "student"
      ? "/images/student-login-option.jpg"
      : "/images/student-login-option.jpg";
  return (
    <div className={styles.root}>
      {/* Desktop keeps the split-auth feel; mobile is handled by module breakpoints. */}
      <div className={styles.shell}>
        {/* vector */}
        <div className={styles.visualPanel}>
          <Image
            alt="auth vector"
            src={vectorImage}
            className={styles.visualImage}
            height={1000}
            width={700}
          />
        </div>
        {/* Forms */}
        <div className={styles.formPanel}>{children}</div>
      </div>
    </div>
  );
}
