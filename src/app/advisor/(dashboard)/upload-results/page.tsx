"use client";

import { useWarnBeforeUnload } from "@/app/hooks/useWarnBeforeUnload";
import { SelectedOffering } from "@/app/types/advisor";
import { ParsedResult } from "@/app/types/resultsUpload";
import { ResultEditTable } from "@/components/tables/resultEditTable";
import { useAdvisorUploadFileSelect } from "@/components/pages/AdvisorUploadFileSelect";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { SelectCourse } from "@/components/secondary/helpers";
import { RecentlyUploadedResults } from "@/components/secondary/RecentlyUploadedResults";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvisorOfferings } from "@/lib/hooks/useAdvisorCourses";
import { useEffect, useState, useCallback } from "react";
import { InfoCard } from "@/components/utilities";

export default function UploadResult() {
  const [parsedJson, setParsedJson] = useState<ParsedResult[]>([]);
  const [course, setCourse] = useState<SelectedOffering | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { FileSelectComponent, mode } = useAdvisorUploadFileSelect(
    setParsedJson,
    course?.id || "",
  );
  const { advisorData } = useAuth();

  // Fetch course offerings
  const {
    data: courseOfferings,
    error: advisorOfferingsError,
    isPending,
    refetch,
  } = useAdvisorOfferings(advisorData?.id || "");

  useEffect(() => {
    if (!parsedJson?.length) return;
    setIsEditing(true);
  }, [parsedJson]);

  //Warn user before leaving before editing is complete
  useWarnBeforeUnload(isEditing);

  const closeEditting = useCallback(() => {
    setIsEditing(false);
    setParsedJson([]);
  }, [isEditing]);

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
            refetch={refetch}
            isDisabled={isEditing}
            advisorOfferingsError={advisorOfferingsError as Error}
          />
        }
      />

      {courseOfferings?.length === 0 && (
        <InfoCard type="warning" heading="No course found">
          <p>
            You don&apos;t have any course to upload results for <br />
            Go to the courses page to add new courses
          </p>
        </InfoCard>
      )}

      {/* Upload results through OCR or Excel */}
      {!isEditing && course && FileSelectComponent}

      {/* Table edit component */}
      {isEditing && course && (
        <ResultEditTable
          courseOfferingId={course?.id}
          courseCode={course.courses.course_code}
          mode={mode}
          parsedJson={parsedJson}
          closeEditting={closeEditting}
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
