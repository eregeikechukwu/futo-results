"use client";

import { AdvisorCourse, CourseData } from "@/app/types/advisor";
import React, { useEffect } from "react";
import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdvisorCourseFields, Form } from "../forms/reusables";
import { LoaderSpinner1 } from "../secondary/loaders/loaders";
import { useAcademicTerms } from "@/lib/hooks/useAcademicTerms";

function EditCourse({
  toggleModal,
  isMutating,
  course,
  updateCourse,
}: {
  toggleModal: () => void;
  isMutating?: boolean;
  course: AdvisorCourse;
  updateCourse: (data: CourseData) => Promise<void>;
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

  // Sessions and semesters options for select fields
  const {
    data: academicTerms,
    isPending: academicTermsPending,
    error: academicTermsError,
  } = useAcademicTerms();

  //submitting state
  const isSubmitting = methods.formState.isSubmitting;

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(updateCourse)}>
          {/* //All the fields in one componenent */}
          <AdvisorCourseFields
            termOptions={
              academicTermsPending
                ? []
                : academicTerms.map((term) => ({
                    id: term.id,
                    label: `${term.session} - ${term.semester}`,
                    value: term.id,
                  }))
            }
            loading={academicTermsPending}
            readOnly={true}
            error={academicTermsError as Error | undefined}
          />

          <div className="justify-end w-full flex gap-8 basis-auto">
            <button type="button" className="cancel-btn" onClick={toggleModal}>
              Cancel
            </button>
            <button
              disabled={isSubmitting || isMutating}
              type="submit"
              className={`${
                (isSubmitting || isMutating) && "pointer-events-none opacity-60"
              } button-primary `}
            >
              Update Course
              {isMutating && <LoaderSpinner1 />}
            </button>
          </div>
        </Form>
      </FormProvider>

      {/* Loader spinner taht covers entire table */}
      {/* {isMutating && <CoverLoader />} */}
    </>
  );
}

export default React.memo(EditCourse);
