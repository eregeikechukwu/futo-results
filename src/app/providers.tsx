export function Providers({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "student" | "advisor";
}) {
  return <>{children}</>;
}
