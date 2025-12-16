"use client";

import { ResultEditTable } from "@/components/forms/resultEditTable";
import { AdvisorUploadFileSelect } from "@/components/pages/AdvisorUploadFileSelect";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { useEffect, useState } from "react";

export default function UploadResult() {
  const [parsedJson, setParsedJson] = useState<Record<string, string | null>[]>(
    []
  );
  const { FileSelectComponent, mode } = AdvisorUploadFileSelect(setParsedJson);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!parsedJson.length) return;
    setIsEditing(true);
    console.log(parsedJson);
    // alert("parsed Json is landed");
  }, [parsedJson]);

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
      {/* <ResultEditTable
        mode={mode}
        parsedJson={parsedJson}
        setParsedJson={setParsedJson}
      /> */}
    </DashboardContainer>
  );
}
