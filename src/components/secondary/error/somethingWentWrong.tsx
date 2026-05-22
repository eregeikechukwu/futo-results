import { AlertTriangle } from "lucide-react";

type SomethingWentWrongProps = {
  message?: string;
};

export default function SomethingWentWrong({
  message = "Something went wrong. Please try again.",
}: SomethingWentWrongProps) {
  return (
    <div className="flex min-h-[250px] w-full items-center justify-center p-[1.5rem]">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-[2rem] text-center shadow-sm">
        {/* Icon */}
        <div className="mx-auto mb-[1rem] flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-[2rem] w-[2rem] text-red-500" />
        </div>

        {/* Title */}
        <h2 className="mb-[0.5rem] text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-sm leading-6 text-gray-500">{message}</p>
      </div>
    </div>
  );
}
