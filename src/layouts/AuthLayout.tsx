"use client";

import Image from "next/image";
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
    <div className="center-child min-h-screen bg-gradient-to-br from-[var(--color-blue-background)] to-[var(--color-white)]">
      <div className="grid  container items-center p-16 grid-cols-[repeat(2,minmax(500px,1fr))] max-w-288 gap-48">
        {/* vector */}
        <div className=" fixed top-1/2 -translate-y-1/2 left-20 right-[50vw] ">
          <Image
            alt="auth vector"
            src={vectorImage}
            className="w-auto h-[90vh] rounded-[24px] shadow-xl"
            height={1000}
            width={700}
          />
        </div>
        {/* Forms */}
        <div className="px-36 col-start-2 col-end-3">{children}</div>
      </div>
    </div>
  );
}
