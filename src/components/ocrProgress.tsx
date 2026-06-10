"use client";

import { Progress } from "@/app/types/advisor";
import { CheckCircle, Loader2, X } from "lucide-react";

export function ProgressBar({
  mode,
  // file,
  // retry,
  progress,
  errorMessage,
}: {
  mode: "excel" | "ocr";
  file: React.RefObject<File | null>;
  retry: (file: File) => Promise<void>;
  progress: Progress;
  errorMessage: string | unknown | null;
}) {
  const getPhaseColor = (percent: number) => {
    if (errorMessage) return "#fb2c36";
    if (percent < 11) return "#9CA3AF"; // GRAY-400
    if (percent < 21) return "#EAB308"; // YELLOW-500
    if (percent < 41) return "#3B82FD"; // BLUE-500
    if (percent < 61) return "#A855F7"; // PURPLE-500
    if (percent > 80) return "#22C55E"; // GREEN-500
    return "#A855F7"; // PURPLE-500
  };

  // console.log(errorMessage);

  return (
    <div className="min-h-[calc(100vh-var(--nav-height)] min-w-screen bg-transparent flex items-center justify-center p-16">
      <div className="relative w-full max-w-2xl space-y-4 p-24 bg-white rounded-lg shadow-md border border-gray-100">
        {/* Retry button */}
        {/* {!!errorMessage && (
          <button
            className="!absolute button-primary -top-20 left-0 "
            onClick={() => retry(file.current as File)}
          >
            Try Again
          </button>
        )} */}

        {/* Header with spinner and title */}
        <div className="flex gap-16 items-start">
          <div className="flex-shrink-0 pt-4">
            {!errorMessage ? (
              progress.percent !== 100 ? (
                <Loader2
                  className="w-32 h-32 animate-spin"
                  style={{ color: `${getPhaseColor(progress.percent)}` }}
                />
              ) : (
                <CheckCircle className="w-32 h-32 text-green-500" />
              )
            ) : (
              <X className="text-red-500 h-32 w-32" />
            )}
          </div>
          <div className="flex-1 flex justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === "ocr" ? "Processing Image" : "Processing Excel File"}
              </h2>
              <p
                className={`text-sm ${
                  errorMessage ? "text-red-500" : "text-gray-600"
                } mt-[4px]`}
              >
                {errorMessage
                  ? (errorMessage as string)
                  : " AI is extracting data from your scan..."}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-[4px]">
              {progress.percent}%
            </p>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="mt-8 space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-12 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out `}
              style={{
                width: `${progress.percent}%`,
                backgroundColor: `${getPhaseColor(progress.percent)}`,
              }}
            />
          </div>

          {/* Current step text */}
          {progress.message && (
            <p className="text-xs mt-3 text-gray-500 font-medium">
              {progress.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
