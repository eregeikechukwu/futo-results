"use client";

import { CourseData, SelectOptions } from "@/app/types/advisor";
import { advisorCourseSchema } from "@/utils/advisorDashboardSchemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdvisorCourseFields, Form } from "../forms/reusables";
import { LoaderSpinner1 } from "../secondary/loaders/loaders";
import { useAcademicTerms } from "@/lib/hooks/useAcademicTerms";
import { useAddCourseOffering } from "@/lib/hooks/useAdvisorCourses";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export function AddCourse({ toggleModal }: { toggleModal: () => void }) {
  const { mutate: addCourseMutation, isPending: addCourseLoading } =
    useAddCourseOffering();
  const { advisorData } = useAuth();

  const {
    data: terms,
    isLoading: termsLoading,
    error: termsError,
  } = useAcademicTerms();

  const termOptions: SelectOptions[] = terms
    ? terms.map((term) => ({
        id: term.id,
        value: term.id,
        label: `${term.session} ${term.semester}`,
      }))
    : [];

  const methods = useForm<CourseData>({
    resolver: zodResolver(advisorCourseSchema),
  });

  const onSubmit = async (data: CourseData) => {
    if (!advisorData) {
      toast.error("Advisor data is missing. Please try again later.");
      return;
    }

    console.log({
      course_code: data.courseCode,
      course_title: data.courseTitle,
      unit: data.unit,
      term: data.term,
    });

    addCourseMutation(
      {
        course_code: data.courseCode,
        course_title: data.courseTitle,
        unit: Number(data.unit),
        term_id: data.term,
        advisor_id: advisorData?.id,
      },
      {
        onSuccess: () => {
          toggleModal();
          toast.success("Course added successfully!");
          methods.reset();
        },
        onError: (error: Error) => {
          toast.error(
            error.message || "Failed to add course. Please try again.",
          );
        },
      },
    );

    // //backend calls would come here anyway, so lets simul\te for now
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // toggleModal();
    // methods.reset();
  };

  const isSubmitting = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* //All the fields in one componenent */}
        <AdvisorCourseFields
          loading={termsLoading}
          error={termsError as Error}
          termOptions={termOptions}
        />

        {/* CTA's */}
        <div className="justify-end w-full flex gap-8 basis-auto">
          <button type="button" className="cancel-btn" onClick={toggleModal}>
            Cancel
          </button>
          <button
            disabled={isSubmitting || addCourseLoading}
            type="submit"
            className={`${
              (isSubmitting || addCourseLoading) &&
              "pointer-events-none opacity-60"
            } button-primary `}
          >
            Add Course
            {addCourseLoading && <LoaderSpinner1 />}
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}
