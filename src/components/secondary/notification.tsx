import { Bell } from "lucide-react";

export default function Notification({ count = 0 }: { count?: number }) {
  return (
    <div className="p-8 relative cursor-pointer group">
      <Bell
        size={20}
        className="group-hover:text-[var(--color-text-dark)]  text-[var(--color-text-passive)]"
      />
    
        {count > 0 &&   <span className="h-16 w-16 text-white rounded-full absolute center-child -top-1 right-0 bg-[var(--color-red)] text-12 font-medium ">
        {count}
      </span>}
    </div>
  );
}
