"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/secondary/header";
import { DashboardContainer, ModalForm } from "@/components/secondary/common";
import { useModalTemplate } from "@/components/modals/overlay";
import { EmptyState } from "@/components/secondary/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdvisorOfficeHours,
  useAdvisorOfficeHoursOverrides,
  useAdvisorVisitIntents,
  useResolveAdvisorVisitIntent,
  useAcknowledgeAdvisorVisitIntent,
  useToggleAdvisorOfficeHourActive,
  useToggleAdvisorOfficeHoursOverrideCancel,
  useDeleteAdvisorOfficeHour,
  useDeleteAdvisorOfficeHourOverride,
} from "@/lib/hooks/useOfficeHours";
import { errorToastHandler } from "@/helpers/errorHandler";
import toast from "react-hot-toast";
import SomethingWentWrong from "@/components/secondary/error/somethingWentWrong";
import {
  AdvisorOfficeHour,
  AdvisorOfficeHoursOverride,
  AdvisorVisitIntent,
} from "@/app/types/officeHours";
import { AdvisorOverrideScheduleForm } from "@/components/forms/advisorOverrideScheduleForm";
import { AdvisorWeekelySlotForm } from "@/components/forms/advisorWeeklySlotForm";
import { formatDate, formatTime, weekdayLabels } from "@/utils/systemUtils";
import { DeleteButton, VariantBtn } from "@/components/secondary/buttons";
import { TextLink } from "@/components/secondary/typography";
import { CoverLoader } from "@/components/secondary/loaders/coverLoader";

export default function AdvisorOfficeHoursPage() {
  const { advisorData } = useAuth();
  const advisorId = advisorData?.id || "";

  const [intentNotes, setIntentNotes] = useState<Record<string, string>>({});
  const [isGeneralMutating, setIsGeneralMutating] = useState(false);
  const [hourToBeToggled, setHourToBeToggled] = useState<string | null>(null);

  const {
    data: weeklyHours,
    isPending: weeklyPending,
    error: weeklyError,
  } = useAdvisorOfficeHours(advisorId);
  const {
    data: overrides,
    isPending: overridePending,
    error: overrideError,
  } = useAdvisorOfficeHoursOverrides(advisorId);
  const {
    data: visitIntents,
    isPending: intentsPending,
    error: intentsError,
  } = useAdvisorVisitIntents(advisorId);

  console.log(visitIntents, "Visit intwnts");

  const resolveIntentMutation = useResolveAdvisorVisitIntent();
  const acknowledgeIntentMutation = useAcknowledgeAdvisorVisitIntent();
  const toggleHourMutation = useToggleAdvisorOfficeHourActive();
  const toggleOverrideMutation = useToggleAdvisorOfficeHoursOverrideCancel();
  const deleteHourMutation = useDeleteAdvisorOfficeHour();
  const deleteOverrideMutation = useDeleteAdvisorOfficeHourOverride();

  const { toggleModal: toggleWeeklyModal, ModalTemplate: WeeklyModal } =
    useModalTemplate(isGeneralMutating);
  const { toggleModal: toggleOverrideModal, ModalTemplate: OverrideModal } =
    useModalTemplate(isGeneralMutating);

  useEffect(() => {
    if (weeklyError || overrideError || intentsError) {
      errorToastHandler(
        weeklyError || overrideError || intentsError,
        "Failed to load office hours data.",
      );
    }
  }, [weeklyError, overrideError, intentsError]);

  useEffect(() => {
    if (
      deleteHourMutation.isPending ||
      deleteOverrideMutation.isPending ||
      resolveIntentMutation.isPending ||
      acknowledgeIntentMutation.isPending ||
      toggleHourMutation.isPending ||
      toggleOverrideMutation.isPending
    ) {
      setIsGeneralMutating(true);
    } else {
      setIsGeneralMutating(false);
    }
  }, [
    deleteHourMutation.isPending,
    deleteOverrideMutation.isPending,
    resolveIntentMutation.isPending,
    acknowledgeIntentMutation.isPending,
    toggleHourMutation.isPending,
    toggleOverrideMutation.isPending,
  ]);

  const weeklySchedule = useMemo(() => {
    if (!weeklyHours) return [];
    return weeklyHours;
  }, [weeklyHours]);

  const specialOverrides = useMemo(() => {
    if (!overrides) return [];
    return overrides;
  }, [overrides]);

  const incomingIntents = useMemo(() => {
    if (!visitIntents) return [];
    return visitIntents;
  }, [visitIntents]);

  if (!advisorData) {
    return (
      <SomethingWentWrong message="Unable to load your advisor account." />
    );
  }

  const handleIntentNoteChange = (intentId: string, value: string) => {
    setIntentNotes((current) => ({ ...current, [intentId]: value }));
  };

  const handleAcknowledgeIntent = (intent: AdvisorVisitIntent) => {
    acknowledgeIntentMutation.mutate(
      {
        intentId: intent.id,
        advisorNote: intentNotes[intent.id] || intent.advisor_note || null,
      },
      {
        onSuccess: () => {
          toast.success(`Visit request acknowledged.`);
        },
      },
    );
  };

  const handleToggleHour = (hour: AdvisorOfficeHour) => {
    setHourToBeToggled(hour.id);
    toggleHourMutation.mutate(
      {
        hourId: hour.id,
        isActive: !hour.is_active,
        advisorId: advisorId,
      },
      {
        onSuccess: () => {
          toast.success(
            `Weekly office hour ${hour.is_active ? "deactivated" : "activated"}.`,
          );
          setHourToBeToggled(null);
        },
        onError: () => {
          setHourToBeToggled(null);
        },
      },
    );
  };

  const handleResolveIntent = (intent: AdvisorVisitIntent) => {
    resolveIntentMutation.mutate(
      {
        intentId: intent.id,
      },
      {
        onSuccess: () => {
          toast.success(`Visit request resolved.`);
        },
      },
    );
  };

  const handleToggleOverride = (overrideItem: AdvisorOfficeHoursOverride) => {
    toggleOverrideMutation.mutate(
      {
        overrideId: overrideItem.id,
        isCancelled: !overrideItem.is_cancelled,
      },
      {
        onSuccess: () => {
          toast.success(
            `Override ${overrideItem.is_cancelled ? "restored" : "cancelled"}.`,
          );
        },
      },
    );
  };

  const handleDeleteHour = (hour: AdvisorOfficeHour, advisorId: string) => {
    deleteHourMutation.mutate(
      {
        hourId: hour.id,
        advisorId: advisorId,
      },
      {
        onSuccess: () => {
          toast.success(`Weekly office hour deleted.`);
        },
      },
    );
  };

  const handleDeleteHourOverride = (
    overrideItem: AdvisorOfficeHoursOverride,
    advisorId: string,
  ) => {
    deleteOverrideMutation.mutate(
      {
        overrideId: overrideItem.id,
        advisorId: advisorId,
      },
      {
        onSuccess: () => {
          toast.success(`Date override deleted.`);
        },
      },
    );
  };

  return (
    <DashboardContainer>
      <Header
        heading="Office Hours"
        subHeading="Manage recurring availability, date exceptions, and student visit requests."
        icon="Calendar"
        button="Add Weekly Slot"
        onClick={toggleWeeklyModal}
        extraComponent={
          <button
            type="button"
            className="button-primary"
            onClick={toggleOverrideModal}
          >
            Add Date Override
          </button>
        }
      />

      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Weekly Availability</h3>
        {weeklyPending && !weeklySchedule.length ? (
          <p>Loading weekly office hours...</p>
        ) : weeklySchedule.length === 0 ? (
          <EmptyState
            item="weekly office hours"
            message="Add a repeating weekly slot so students can see your standard availability."
          />
        ) : (
          <div className="grid gap-16">
            {weeklySchedule.map((slot) => (
              <div
                key={slot.id}
                className="rounded-3xl border border-(--color-border-light) p-24"
              >
                <div className="flex justify-between items-start gap-16">
                  <div>
                    <p className="text-small-passive">
                      {weekdayLabels[slot.day_of_week]}
                    </p>
                    <p className="text-medium">
                      {formatTime(slot.start_time)} –{" "}
                      {formatTime(slot.end_time)}
                    </p>
                    {slot.location && <p>{slot.location}</p>}
                    {slot.note && (
                      <p className="text-(--color-text-passive)">{slot.note}</p>
                    )}
                    <p className="text-small-passive">
                      Status: {slot.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-8 align-center">
                    <VariantBtn
                      variant={slot.is_active ? "red" : "green"}
                      onClick={() => handleToggleHour(slot)}
                      isLoading={
                        toggleHourMutation.isPending &&
                        hourToBeToggled === slot.id
                      }
                      disabled={toggleHourMutation.isPending}
                    >
                      {slot.is_active ? "Deactivate" : "Activate"}
                    </VariantBtn>
                    <DeleteButton
                      disabled={
                        deleteHourMutation.isPending ||
                        toggleHourMutation.isPending
                      }
                      onClick={() => handleDeleteHour(slot, advisorId)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Overrides */}
      <div className="dashboard-container">
        <h3 className="text-medium mb-16">Special Date Overrides</h3>
        {overridePending ? (
          <p>Loading date overrides...</p>
        ) : specialOverrides.length === 0 ? (
          <EmptyState
            item="special date overrides"
            message="Add date-specific availability or cancellations for exceptions to your regular schedule."
          />
        ) : (
          <div className="grid gap-16">
            {specialOverrides.map((overrideItem) => (
              <div
                key={overrideItem.id}
                className="rounded-3xl border border-(--color-border-light) p-24"
              >
                <div className="flex justify-between items-start gap-16">
                  <div>
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
                      Status:{" "}
                      {overrideItem.is_cancelled ? "Cancelled" : "Available"}
                    </p>
                  </div>

                  <div className="flex gap-8 align-center">
                    <VariantBtn
                      variant="blue"
                      onClick={() => handleToggleOverride(overrideItem)}
                      isLoading={toggleOverrideMutation.isPending}
                      disabled={
                        toggleOverrideMutation.isPending ||
                        deleteOverrideMutation.isPending
                      }
                    >
                      {overrideItem.is_cancelled ? "Restore" : "Cancel"}
                    </VariantBtn>
                    <DeleteButton
                      onClick={() =>
                        handleDeleteHourOverride(overrideItem, advisorId)
                      }
                      disabled={
                        deleteOverrideMutation.isPending ||
                        toggleOverrideMutation.isPending
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-container">
        <div className="flex justify-between text-center">
          <h3 className="text-medium mb-16  w-max">Incoming Visit Requests</h3>
          {incomingIntents.length > 0 && (
            <TextLink>
              {incomingIntents.length} intent
              {incomingIntents.length > 1 ? "'s" : ""} yet to be resolved
            </TextLink>
          )}
        </div>
        {!incomingIntents.length ? (
          <p>Loading visit requests...</p>
        ) : incomingIntents.length === 0 ? (
          <EmptyState
            item="visit requests"
            message="Students have not submitted any visit requests yet."
          />
        ) : (
          <div>
            <div className="grid gap-16">
              {incomingIntents.map((intent) => (
                <div
                  key={intent.id}
                  className="rounded-3xl border border-(--color-border-light) p-24"
                >
                  <div className="flex justify-between gap-16 flex-wrap">
                    <div>
                      <p className="text-small-passive">
                        {intent.students?.profiles.full_name ||
                          intent.students?.reg_number}
                      </p>
                      <p className="text-medium">
                        {formatDate(intent.preferred_date)}
                      </p>
                      <p>{intent.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-small-passive">
                        Status: {intent.status}
                      </p>
                      <p className="text-small-passive">
                        Requested:{" "}
                        {new Date(intent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-16">
                    <label
                      className="text-small-passive"
                      htmlFor={`note-${intent.id}`}
                    >
                      Note to Student (optional - will be sent upon
                      acknowledgement)
                    </label>
                    <textarea
                      id={`note-${intent.id}`}
                      className="input w-full mt-8 p-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={2}
                      disabled={
                        acknowledgeIntentMutation.isPending ||
                        resolveIntentMutation.isPending ||
                        intent.status === "acknowledged" ||
                        intent.status === "resolved"
                      }
                      value={
                        intentNotes[intent.id] ?? intent.advisor_note ?? ""
                      }
                      onChange={(event) =>
                        handleIntentNoteChange(intent.id, event.target.value)
                      }
                    />
                  </div>
                  <div className="mt-16 flex flex-wrap gap-12">
                    <VariantBtn
                      variant="blue"
                      onClick={() => handleAcknowledgeIntent(intent)}
                      isLoading={acknowledgeIntentMutation.isPending}
                      disabled={intent.status !== "pending"}
                    >
                      Acknowledge
                    </VariantBtn>

                    <VariantBtn
                      variant="blue"
                      onClick={() => handleResolveIntent(intent)}
                      isLoading={resolveIntentMutation.isPending}
                      disabled={intent.status === "resolved"}
                    >
                      Mark as Resolved
                    </VariantBtn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <WeeklyModal title="Add Weekly Office Hour">
        <AdvisorWeekelySlotForm toggleWeeklyModal={toggleWeeklyModal} />
      </WeeklyModal>

      <OverrideModal title="Add Special Date Override">
        <AdvisorOverrideScheduleForm
          toggleOverrideModal={toggleOverrideModal}
        />
      </OverrideModal>

      {/* Cover Loader */}
      {isGeneralMutating && <CoverLoader />}
    </DashboardContainer>
  );
}
