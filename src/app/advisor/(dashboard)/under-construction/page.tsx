import { Construction } from "lucide-react";

export default function UnderConstruction() {
  return (
    <div className="min-h-[calc(80vh-var(--nav-height))] w-full center-child flex-col gap-20">
      <Construction size={60} className="animate-bounce" />
      <h2 className="text-[2rem] font-[600] ">
        This page is under construction
      </h2>
    </div>
  );
}
