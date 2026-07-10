import { WeeklyForm } from "@/app/types/officeHours";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAdvisorOfficeHour } from "@/lib/hooks/useOfficeHours";
import { weeklyScheduleSchema } from "@/utils/adviosrWeekScheduleSchema";
import { weekdayLabels } from "@/utils/systemUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Form, SelectField2, TextField } from "./reusables";
import { ModalForm } from "../secondary/common";
import { CTAButton } from "../secondary/buttons";

export function AdvisorWeekelySlotForm({
  toggleWeeklyModal,
}: {
  toggleWeeklyModal: () => void;
}) {
  const { advisorData } = useAuth();
  const createWeeklyMutation = useCreateAdvisorOfficeHour();

  const methods = useForm<WeeklyForm>({
    resolver: zodResolver(weeklyScheduleSchema),
    defaultValues: {
      day_of_week: 1,
      start_time: "09:00",
      end_time: "10:00",
      location: "The department.",
      note: "",
      is_active: true,
    },
  });

  const handleWeeklySubmit = async (data: WeeklyForm) => {
    const advisorId = advisorData?.id || "";
    console.log("advisorData in AdvisorWeekelySlotForm:", data);

    if (data.end_time <= data.start_time) {
      toast.error("End time must be after start time.");
      return;
    }

    createWeeklyMutation.mutate(
      {
        advisor_id: advisorId,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location || null,
        note: data.note || null,
        is_active: data.is_active,
      },
      {
        onSuccess: () => {
          toast.success("Weekly office hour saved.");
          toggleWeeklyModal();
        },
      },
    );
  };

  const dayOfWeekOptions = weekdayLabels.map((label, index) => ({
    id: `${index}`,
    value: Number(index),
    label: label,
  }));

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(handleWeeklySubmit)}>
        <ModalForm>
          <SelectField2
            label="Day of week"
            name="day_of_week"
            options={dayOfWeekOptions}
            numeric={true}
            required={true}
          />
          <TextField
            type="time"
            name="start_time"
            label="Start time"
            required={true}
          />
          <TextField
            type="time"
            name="end_time"
            label="End time"
            required={true}
          />
          <TextField
            type="text"
            name="location"
            label="Location"
            required={true}
          />
          <div className="modal-field">
            <label>Notes (optional)</label>
            <textarea
              className=" h-auto!"
              rows={4}
              {...methods.register("note")}
            />
          </div>
          <div className="flex items-center gap-12">
            <input
              {...methods.register("is_active")}
              name="is_active"
              id="is_active"
              type="checkbox"
            />
            <label htmlFor="is_active">Active slot</label>
          </div>
          <div className="justify-end flex gap-16">
            <button
              type="button"
              className="cancel-btn"
              onClick={toggleWeeklyModal}
            >
              Cancel
            </button>
            <CTAButton
              onClickCTA={methods.handleSubmit(handleWeeklySubmit)}
              isMutating={createWeeklyMutation.isPending}
              label="Save Weekly Slot"
            />
          </div>
        </ModalForm>
      </Form>
    </FormProvider>
  );
}
