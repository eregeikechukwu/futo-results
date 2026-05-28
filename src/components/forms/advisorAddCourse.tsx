"use client";

import { CourseData } from "@/app/types/advisor";
import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdvisorCourseFields, Form } from "../forms/reusables";
import { LoaderSpinner1 } from "../secondary/loaders/loaders";

export function AddCourse({ toggleModal }: { toggleModal: () => void }) {
  const methods = useForm<CourseData>({
    resolver: zodResolver(advisorCourseSchema),
  });

  const onSubmit = async (data: CourseData) => {
    console.log(data);

    //backend calls would come here anyway, so lets simul\te for now
    await new Promise((resolve) => setTimeout(resolve, 3000));
    toggleModal();
    methods.reset();
  };

  const isSubmitting = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* //All the fields in one componenent */}
        <AdvisorCourseFields />

        {/* CTA's */}
        <div className="justify-end w-full flex gap-8 basis-auto">
          <button type="button" className="cancel-btn" onClick={toggleModal}>
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            type="submit"
            className={`${
              isSubmitting && "pointer-events-none opacity-60"
            } button-primary `}
          >
            Add Course
            {isSubmitting && <LoaderSpinner1 />}
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}
