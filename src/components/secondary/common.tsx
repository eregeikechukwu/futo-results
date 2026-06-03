export function Error({ children }: { children: React.ReactNode }) {
  return (
    <p className="error" role="alert">
      {children}
    </p>
  );
}

export function ModalForm({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-16 max-h-[23rem] overflow-y-scroll scrollbar !pb-2 ">
      {children}
    </div>
  );
}

export function DashboardContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative flex flex-col gap-32">{children}</div>;
}
