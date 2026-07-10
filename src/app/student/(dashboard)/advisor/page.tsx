"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/secondary/header";
import { DashboardContainer } from "@/components/secondary/common";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdvisorOfficeHours,
  useAdvisorOfficeHoursOverrides,
  useStudentAdvisor,
  useStudentVisitIntents,
  useCreateAdvisorVisitIntent,
} from "@/lib/hooks/useOfficeHours";
import { errorToastHandler } from "@/helpers/errorHandler";
import { EmptyState } from "@/components/secondary/EmptyState";
import toast from "react-hot-toast";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import { weekdayLabels, formatTime, formatDate } from "@/utils/systemUtils";

export default function StudentAdvisorPage() {
  const { studentData } = useAuth();
  const [preferredDate, setPreferredDate] = useState("");
  const [reason, setReason] = useState("");

  const departmentId = studentData?.departments.id || "";
  const admissionYear = studentData?.admission_year || 0;
  const studentId = studentData?.id || "";

  const {
    data: advisor,
    isPending: advisorPending,
    error: advisorError,
  } = useStudentAdvisor(departmentId, admissionYear);
  const {
    data: weeklyHours,
    isPending: weeklyPending,
    error: weeklyError,
  } = useAdvisorOfficeHours(advisor?.id || "");
  const {
    data: overrides,
    isPending: overridePending,
    error: overrideError,
  } = useAdvisorOfficeHoursOverrides(advisor?.id || "");
  const {
    data: intents,
    isPending: intentsPending,
    error: intentsError,
  } = useStudentVisitIntents(studentId);

  const createIntentMutation = useCreateAdvisorVisitIntent();

   const scheduleContent = useMemo(() => {
    if (!weeklyHours) return [];
    return weeklyHours;
  }, [weeklyHours]);

  const overrideContent = useMemo(() => {
    if (!overrides) return [];
    return overrides;
  }, [overrides]);

  useEffect(() => {
    if (advisorError || weeklyError || overrideError || intentsError) {
      errorToastHandler(
        advisorError || weeklyError || overrideError || intentsError,
        "Failed to load advisor or scheduling data.",
      );
    }
  }, [advisorError, weeklyError, overrideError, intentsError]);

  if (!studentData) {
    return (
      <SomethingWentWrong message="Unable to load your student profile." />
    );
  }

  const advisorName = advisor?.profiles.full_name || "Advisor";
  const advisorEmail = advisor?.profiles.email || "";

  const isLoading =
    advisorPending || weeklyPending || overridePending || intentsPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!advisor || !studentId) {
      toast.error("Unable to submit request without advisor information.");
      return;
    }

    if (!preferredDate || !reason.trim()) {
      toast.error("Please choose a date and provide a reason for the visit.");
      return;
    }

    createIntentMutation.mutate(
      {
        advisor_id: advisor.id,
        student_id: studentId,
        preferred_date: preferredDate,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Visit request sent.");
          setPreferredDate("");
          setReason("");
        },
      },
    );
  };

 

  return (
    <DashboardContainer>
      <Header
        heading="My Advisor"
        subHeading="See your advisor's office hours and request a visit."
        icon="User2"
      />

      <div className="dashboard-container p-24">
        <div className="grid gap-12">
          <p className="text-small-passive">Advisor</p>
          <h3 className="text-medium">{advisorName}</h3>
          <p>{advisorEmail}</p>
          <p className="text-small-passive">
            Department:{" "}
            {studentData.departments.name || studentData.departments.code}
          </p>
          <p className="text-small-passive">
            Admission year: {studentData.admission_year}
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Weekly Office Hours</h3>
        {isLoading && !scheduleContent.length ? (
          <p>Loading schedule...</p>
        ) : scheduleContent.length === 0 ? (
          <EmptyState
            item="office hours"
            message="Your advisor has not published recurring availability yet."
          />
        ) : (
          <div className="grid gap-16">
            {scheduleContent.map((slot) => (
              <div
                key={slot.id}
                className="rounded-3xl border border-(--color-border-light) p-24"
              >
                <p className="text-small-passive">
                  {weekdayLabels[slot.day_of_week]}
                </p>
                <p className="text-medium">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </p>
                {slot.location && <p>{slot.location}</p>}
                {slot.note && (
                  <p className="text-(--color-text-passive)">{slot.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Special Date Availability</h3>
        {isLoading && !overrideContent.length ? (
          <p>Loading availability overrides...</p>
        ) : overrideContent.length === 0 ? (
          <EmptyState
            item="special date availability"
            message="Your advisor has not created any date-specific overrides."
          />
        ) : (
          <div className="grid gap-16">
            {overrideContent.map((overrideItem) => (
              <div
                key={overrideItem.id}
                className="rounded-3xl border border-(--color-border-light) p-24"
              >
                <p className="text-small-passive">
                  {formatDate(overrideItem.date)}
                </p>
                <p className="text-medium">
                  {formatTime(overrideItem.start_time)} –{" "}
                  {formatTime(overrideItem.end_time)}
                </p>
                {overrideItem.location && <p>{overrideItem.location}</p>}
                {overrideItem.note && (
                  <p className="text-(--color-text-passive)">
                    {overrideItem.note}
                  </p>
                )}
                <p className="text-small-passive">
                  {overrideItem.is_cancelled ? "Not available" : "Available"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Request a Visit</h3>
        <form onSubmit={handleSubmit} className="grid gap-16">
          <label>
            Preferred date
            <input
              type="date"
              value={preferredDate}
              onChange={(event) => setPreferredDate(event.target.value)}
              className="input w-full mt-8"
            />
          </label>
          <label>
            Reason for visit
            <textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="input w-full mt-8"
              placeholder="Explain what you want to discuss"
            />
          </label>
          <div className="justify-end flex">
            <button
              type="submit"
              className="button-primary"
              disabled={createIntentMutation.isPending}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Your Visit Requests</h3>
        {isLoading && !intents?.length ? (
          <p>Loading your requests...</p>
        ) : !intents || intents.length === 0 ? (
          <EmptyState
            item="visit requests"
            message="You have not sent any visit requests yet."
          />
        ) : (
          <div className="grid gap-16">
            {intents.map((intent) => (
              <div
                key={intent.id}
                className="rounded-3xl border border-(--color-border-light) p-24"
              >
                <div className="flex justify-between gap-16 flex-wrap">
                  <div>
                    <p className="text-medium">
                      {formatDate(intent.preferred_date)}
                    </p>
                    <p>{intent.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small-passive">
                      Status: {intent.status}
                    </p>
                    {intent.advisor_note && (
                      <p>Advisor note: {intent.advisor_note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardContainer>
  );
}
