import React from "react";
import { RecentResultReportBar } from "./reportBar";
import { Heading2 } from "./typography";
import { ParsedResult } from "@/app/types/resultsUpload";

export function RecentlyUploadedResults({
  setIsEditing,
  setParsedJson,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>;
}) {
  return (
    <div className="dashboard-container ">
      <div className="mb-24">
        <Heading2>Quick Actions</Heading2>
      </div>

      <div className="grid gap-12 grid-cols-1">
        <RecentResultReportBar
          title="2023/2024 - Harmattan"
          coursecode="CSC301"
          // items="45 students"
          date="2024-01-17"
          img="/images/clear.jpg"
        />
      </div>
    </div>
  );
}
