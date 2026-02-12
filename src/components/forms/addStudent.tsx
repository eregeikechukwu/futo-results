"use client";

import { AdvisorStudent } from "@/app/types/advisor";
import { addStudentSchema } from "@/utils/addStudentSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, FormProvider } from "react-hook-form";
import { Form, SelectField, TextField } from "./reusables";
import { ModalForm } from "../secondary/common";

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const localToday = today.toISOString().split("T")[0];

export function AddStudentForm({ toggleModal }: { toggleModal: () => void }) {
  const methods = useForm<AdvisorStudent>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: "",
      regNumber: "",
      email: "",
      status: "verified",
      joinDate: localToday,
    },
  });

  const studentStatus = [
    { label: "Verified", value: "verified" },
    { label: "Pending", value: "pending" },
    { label: "Flagged", value: "flagged" },
  ];

  const onSubmit = async (data: AdvisorStudent) => {
    console.log(data);
    //simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // toast.success("login success");
    methods.reset();
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
          <SelectField name="status" label="Status" options={studentStatus} />
          {/* Join Date */}
          <TextField
            name="joinDate"
            type="date"
            label="Join Date"
            placeholder="eg: 2023-01-01"
          />
        </ModalForm>

        {/* CTA's */}
        <div className="justify-end w-full flex gap-8 basis-auto">
          <button type="button" className="cancel-btn" onClick={toggleModal}>
            Cancel
          </button>
          <button type="submit" className={`button-primary `}>
            Add Student
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}
