import React from "react";
import { RecentResultReportBar } from "./reportBar";
import { Heading2 } from "./typography";
import { ParsedResult } from "@/app/types/resultsUpload";
import { useRecentBatches } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";
import "@aejkatappaja/phantom-ui";
import SomethingWentWrong from "./error/somethingWentWrong";
import { EmptyState } from "./EmptyState";

export function RecentlyUploadedResults({
  setIsEditing,
  setParsedJson,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>;
}) {
  const { profile } = useAuth();
  // Ftehc report for report cards
  const {
    data: uploadSummaryData,
    isLoading: uploadSummaryLoading,
    error: uploadSummaryError,
  } = useRecentBatches(profile?.id || "");

  return (
    <div className="dashboard-container ">
      <div className="mb-24">
        <Heading2>Previously Uploaded Results</Heading2>
      </div>

      <div className="grid gap-12 grid-cols-1">
        {uploadSummaryLoading ? (
          <phantom-ui loading={true}>
            {Array.from([0, 4]).map((_, index) => (
              <RecentResultReportBar
                key={index}
                title="2023/2024 - Harmattan"
                coursecode="CSC301"
                // items="45 students"
                date="2024-01-17"
                img="/images/clear.jpg"
              />
            ))}
          </phantom-ui>
        ) : uploadSummaryError ? (
          <SomethingWentWrong message="There was an error loading previously uploaded results." />
        ) : (
          (uploadSummaryData.length > 0 &&
            uploadSummaryData.map((summary, i) => (
              <RecentResultReportBar
                key={`${i}-${summary.date}} `}
                title={summary.title}
                coursecode={summary.courseCode}
                date={summary?.createdAt.split("T")[0]}
                img=""
              />
            ))) || (
            <EmptyState message="No previous uploads yet" item="results" />
          )
        )}
      </div>
    </div>
  );
}
