"use client";

import { AdvisorCourse, CourseData } from "@/app/types/advisor";
import { useEffect } from "react";
import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AdvisorCourseFields } from "../forms/reusables";
import { LoaderSpinner1 } from "../secondary/loaders";

export function EditCourse({
  course,
  toggleModal,
}: {
  course: AdvisorCourse;
  toggleModal: () => void;
}) {
  const methods = useForm<CourseData>({
    resolver: zodResolver(advisorCourseSchema),
    //set initial defaultValues if course exists at mount
    defaultValues: course as Partial<CourseData> | undefined,
  });

  useEffect(() => {
    if (course) methods.reset(course);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  const onSubmit = async (data: CourseData) => {
    console.log(data);

    // simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    toggleModal();
    toast.success("Edit success");
    methods.reset();
  };

  //submittin state
  const isSubmitting = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col h-full gap-16"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {/* //All the fields in one componenent */}
        <AdvisorCourseFields />

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
            Update Course
            {isSubmitting && <LoaderSpinner1 />}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
