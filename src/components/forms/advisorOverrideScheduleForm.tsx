import { OverrideForm } from "@/app/types/officeHours";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAdvisorOfficeHoursOverride } from "@/lib/hooks/useOfficeHours";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import { Form, TextField } from "./reusables";
import { ModalForm } from "../secondary/common";
import {
  OverrideScheduleForm,
  overrideScheduleSchema,
} from "@/utils/adviorOverrideScheduleSchema";

export function AdvisorOverrideScheduleForm({
  toggleOverrideModal,
}: {
  toggleOverrideModal: () => void;
}) {
  const { advisorData } = useAuth();
  const createOverrideMutation = useCreateAdvisorOfficeHoursOverride();

  const methods = useForm<OverrideScheduleForm>({
    resolver: zodResolver(
      overrideScheduleSchema,
    ) as Resolver<OverrideScheduleForm>,
    defaultValues: {
      date: new Date(),
      start_time: "09:00",
      end_time: "10:00",
      location: "The department.",
      note: "",
      is_cancelled: true,
    },
  });

  const handleOverrideSubmit = async (data: OverrideForm) => {
    const advisorId = advisorData?.id || "";

    if (data.end_time <= data.start_time) {
      toast.error("End time must be after start time.");
      return;
    }

    createOverrideMutation.mutate(
      {
        advisor_id: advisorId,
        date: data.date.toDateString(),
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location || null,
        note: data.note || null,
        is_cancelled: data.is_cancelled,
      },
      {
        onSuccess: () => {
          toast.success("Weekly office hour saved.");
          toggleOverrideModal();
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(handleOverrideSubmit)}>
        <ModalForm>
          <TextField type="date" name="date" label="Date" required={true} />
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
              {...methods.register("is_cancelled")}
              name="is_cancelled"
              id="is_cancelled"
              type="checkbox"
            />
            <label htmlFor="is_cancelled">Mark as cancelled</label>
          </div>
          <div className="justify-end flex gap-16">
            <button
              type="button"
              className="cancel-btn"
              onClick={toggleOverrideModal}
            >
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Save Override
            </button>
          </div>
        </ModalForm>
      </Form>
    </FormProvider>
  );
}
