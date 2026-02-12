"use client";

import { ParsedResult } from "@/app/types/resultsUpload";
import { ResultEditTable } from "@/components/forms/resultEditTable";
import { AdvisorUploadFileSelect } from "@/components/pages/AdvisorUploadFileSelect";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { RecentlyUploadedResults } from "@/components/secondary/RecentlyUploadedResults";
import { useEffect, useState } from "react";

export default function UploadResult() {
  const [parsedJson, setParsedJson] = useState<ParsedResult[]>([]);
  const { FileSelectComponent, mode } = AdvisorUploadFileSelect(setParsedJson);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!parsedJson?.length) return;
    setIsEditing(true);
    console.log(parsedJson);
    // alert("parsed Json is landed");
  }, [parsedJson]);

  //Warn user before leaving before editing is complete
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isEditing) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing]);

  return (
    <DashboardContainer>
      {/* Header */}
      <Header
        heading="Upload Results"
        subHeading="Upload student results via Excel spreadsheet or scanned documents"
      />

      {/* Upload results through OCR or Excel */}
      {!isEditing && FileSelectComponent}

      {/* Table edit component */}
      {isEditing && (
        <ResultEditTable
          mode={mode}
          parsedJson={parsedJson}
          setIsEditting={setIsEditing}
          setParsedJson={setParsedJson}
        />
      )}

      {/* RecentlyUploadedResults  */}
      {!isEditing && (
        <RecentlyUploadedResults
          setIsEditing={setIsEditing}
          setParsedJson={setParsedJson}
        />
      )}
    </DashboardContainer>
  );
}
