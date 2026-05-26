"use client";

import {  AdvisorStudentUpload } from "@/app/types/advisor";
import { addStudentSchema } from "@/utils/addStudentSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, FormProvider } from "react-hook-form";
import { Form, SelectField, TextField } from "./reusables";
import { ModalForm } from "../secondary/common";
import { useState } from "react";
import toast from "react-hot-toast";
import { NormalizedStudentsData } from "@/app/types/utils";
import { useAuth } from "@/contexts/AuthContext";
import { errorToastHandler } from "@/helpers/errorHandler";
import { useUploadAdvisorStudents } from "@/lib/hooks/useAdvisorStudents";

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const localToday = today.toISOString().split("T")[0];

export function AddStudentForm({ toggleModal }: { toggleModal: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadStudentsMutation = useUploadAdvisorStudents();
  const { advisorData } = useAuth();

  const methods = useForm<AdvisorStudentUpload>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: "",
      regNumber: "",
      email: "",
    },
  });

  const onSubmit = async (data: AdvisorStudentUpload) => {
    if (!advisorData) {
      toast.error("No advisor data found.");
      return;
    }
    toast.loading("Adding student...");
    setIsUploading(true);
    const uploadData: NormalizedStudentsData = {
      reg_number: data.regNumber,
      email: data.email,
      created_by: advisorData?.id,
      admission_year: advisorData?.advisor_assignments[0].admission_year,
      department_id: advisorData?.advisor_assignments[0].departments.id,
    };

    uploadStudentsMutation.mutate([uploadData], {
      onSuccess: () => {
        setIsUploading(false);
        toast.success("Student added successfully!");
        methods.reset();
        toggleModal();
      },
      onError: (error) => {
        setIsUploading(false);
        errorToastHandler(error, "Failed to add student. Please try again.");
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <ModalForm>
          {/* FullNAme field */}
          <TextField name="name" label="Full Name" placeholder="eg. John Doe" />
          {/* Reg number filed */}
          <TextField
            name="regNumber"
            label="Registration Number"
            placeholder="eg: 20231346225"
          />
          {/* Email field */}
          <TextField
            name="email"
            label="Email Address"
            placeholder="eg: emmanuelokafor@gmail.com"
          />
          {/* <SelectField name="status" label="Status" options={studentStatus} /> */}
          {/* Join Date */}
          {/* <TextField
            name="joinDate"
            type="date"
            label="Join Date"
            placeholder="eg: 2023-01-01"
          /> */}
        </ModalForm>

        {/* CTA's */}
        <div className="justify-end w-full flex gap-8 basis-auto">
          <button type="button" className="cancel-btn" onClick={toggleModal}>
            Cancel
          </button>
          <button
            disabled={isUploading}
            type="submit"
            className={`button-primary ${isUploading && "opacity-30"}`}
          >
            Add Student
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}
