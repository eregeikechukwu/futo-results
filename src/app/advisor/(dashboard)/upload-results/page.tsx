"use client";

import { useWarnBeforeUnload } from "@/app/hooks/useWarnBeforeUnload";
import { SelectedOffering } from "@/app/types/advisor";
import { ParsedResult } from "@/app/types/resultsUpload";
import { ResultEditTable } from "@/components/forms/resultEditTable";
import { useAdvisorUploadFileSelect } from "@/components/pages/AdvisorUploadFileSelect";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { SelectCourse } from "@/components/secondary/helpers";
import { RecentlyUploadedResults } from "@/components/secondary/RecentlyUploadedResults";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvisorOfferings } from "@/lib/hooks/useAdvisorCourses";
import { useEffect, useState } from "react";

export default function UploadResult() {
  const [parsedJson, setParsedJson] = useState<ParsedResult[]>([]);
  const [course, setCourse] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const { FileSelectComponent, mode } = useAdvisorUploadFileSelect(
    setParsedJson,
    course,
  );
  const { advisorData } = useAuth();

  // Fetch course offerings
  const {
    data: courseOfferings,
    error: advisorOfferingsError,
    isPending,
  } = useAdvisorOfferings(advisorData?.id || "");

  useEffect(() => {
    if (!parsedJson?.length) return;
    setIsEditing(true);
    console.log(parsedJson);
    // alert("parsed Json is landed");
  }, [parsedJson]);

  //Warn user before leaving before editing is complete
  useWarnBeforeUnload(isEditing);

  console.log(course, "results age course offerfings");

  return (
    <DashboardContainer>
      {/* Header */}
      <Header
        heading="Upload Results"
        subHeading="Upload student results via Excel spreadsheet or scanned documents"
        extraComponent={
          <SelectCourse
            setCourse={setCourse}
            courseOfferings={courseOfferings as SelectedOffering[]}
            isPending={isPending}
            advisorOfferingsError={advisorOfferingsError as Error}
          />
        }
      />

      {/* Upload results through OCR or Excel */}
      {!isEditing && course && FileSelectComponent}

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
