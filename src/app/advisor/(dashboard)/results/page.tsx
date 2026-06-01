"use client";

import { useState } from "react";
import { Header } from "@/components/secondary/header";
import { DashboardContainer } from "@/components/secondary/common";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademicTerms, useActiveTerm } from "@/lib/hooks/useAcademicTerms";
import {
  useCourseOfferingsForTerm,
  useResultsForOffering,
  useBatchForOffering,
} from "@/lib/hooks/useResults";
import { errorToastHandler } from "@/helpers/errorHandler";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import ResultsTable from "./ResultsTable";
import styles from "./ResultsTable.module.scss";

export default function ResultsManagementPage() {
  const { advisorData, loading: authLoading } = useAuth();
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(
    null,
  );

  // Fetch all academic terms
  const {
    data: allTerms,
    isLoading: termsLoading,
    error: termsError,
  } = useAcademicTerms();

  // Fetch active term to set as default
  const { data: activeTerm } = useActiveTerm();

  // Set default term when activeTerm is loaded
  if (activeTerm && !selectedTermId) {
    setSelectedTermId(activeTerm.id);
  }

  // Fetch course offerings for selected term
  const {
    data: courseOfferings,
    isLoading: offeringsLoading,
    error: offeringsError,
  } = useCourseOfferingsForTerm(advisorData?.id || "", selectedTermId || "");

  // Fetch results and batch info for selected offering
  const {
    data: results,
    isLoading: resultsLoading,
    error: resultsError,
  } = useResultsForOffering(selectedOfferingId || "");

  console.log(selectedOfferingId, "   results in page component");

  const {
    data: batchInfo,
    isLoading: batchLoading,
    error: batchError,
  } = useBatchForOffering(selectedOfferingId || "");

  // Error handling
  if (termsError) {
    console.log(termsError, "---terms error");
    errorToastHandler(termsError, "Failed to load academic terms");
    return <SomethingWentWrong message="Failed to load academic terms" />;
  }

  if (offeringsError) {
    console.log(offeringsError, "   offerings error");
    errorToastHandler(offeringsError, "Failed to load course offerings");
    return <SomethingWentWrong message="Failed to load course offerings" />;
  }

  if (resultsError) {
    console.log(resultsError, "   results error");
    errorToastHandler(resultsError, "Failed to load results");
  }

  if (batchError) {
    console.log(batchError, "   batch error");
    errorToastHandler(batchError, "Failed to load batch information");
  }

  if (authLoading) return <div>Loading...</div>;
  if (!advisorData) return <SomethingWentWrong />;

  // Find selected course offering for display
  const selectedOffering = courseOfferings?.find(
    (co) => co.id === selectedOfferingId,
  );

  const isLoading =
    termsLoading || offeringsLoading || resultsLoading || batchLoading;

  return (
    <DashboardContainer>
      {/* Page Header */}
      <Header
        heading="Results Management"
        subHeading="View, edit, and manage student results"
        icon="FileText"
      />

      {/* Selectors Section */}
      <div className={styles.selectorsContainer}>
        {/* Term Selector */}
        <div className={styles.selectorGroup}>
          <label className={styles.label}>Academic Term</label>
          <select
            value={selectedTermId || ""}
            onChange={(e) => {
              setSelectedTermId(e.target.value);
              setSelectedOfferingId(null); // Reset offering when term changes
            }}
            className={styles.select}
            disabled={termsLoading}
          >
            <option value="">Select a term...</option>
            {allTerms?.map((term) => (
              <option key={term.id} value={term.id}>
                {term.session} - {term.semester}
              </option>
            ))}
          </select>
        </div>

        {/* Course Offering Selector */}
        <div className={styles.selectorGroup}>
          <label className={styles.label}>Course Offering</label>
          <select
            value={selectedOfferingId || ""}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className={styles.select}
            disabled={offeringsLoading || !selectedTermId}
          >
            <option value="">
              {!selectedTermId ? "Select a term first" : "Select a course..."}
            </option>
            {courseOfferings?.map((offering) => (
              <option key={offering.id} value={offering.id}>
                {offering.courses.course_code} - {offering.courses.course_title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      {selectedOfferingId ? (
        <>
          {isLoading ? (
            <div className={styles.loadingState}>Loading results...</div>
          ) : results && results.length > 0 ? (
            <ResultsTable
              results={results}
              batchInfo={batchInfo}
              offeringId={selectedOfferingId}
              selectedOffering={selectedOffering}
            />
          ) : (
            <div className={styles.emptyState}>
              <p>No results uploaded for this course yet.</p>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>Select a course offering to view results.</p>
        </div>
      )}
    </DashboardContainer>
  );
}
