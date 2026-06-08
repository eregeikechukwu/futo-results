/* eslint-disable @typescript-eslint/no-explicit-any */

import { AddResultSchema } from "@/utils/resultSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { ModalForm } from "../secondary/common";
import { Label } from "../modals/reUsables";
import { useEffect } from "react";
import { Form, TextFieldResult } from "./reusables";
import { ParsedResult } from "@/app/types/resultsUpload";
import { computeGrade } from "@/utils/systemUtils";

export function AddResultForm({
  toggleModal,
  setParsedJson,
}: {
  toggleModal: () => void;
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>;
}) {
  type AddResultFormData = z.infer<typeof AddResultSchema>;
  const methods = useForm<AddResultFormData>({
    resolver: zodResolver(
      AddResultSchema,
    ) as unknown as Resolver<AddResultFormData>,
  });

  // watch numeric fields
  const test = methods.watch("test") ?? 0;
  const lab = methods.watch("lab") ?? 0;
  const exam = methods.watch("exam") ?? 0;

  const total = Number(test) + Number(lab) + Number(exam);

  useEffect(() => {
    // set computed values in the form
    methods.setValue("total", total);
    const remark = total >= 50 ? "Pass" : "Fail";
    methods.setValue("remark", remark);
    methods.setValue("grade", computeGrade(total));
  }, [test, lab, exam, total, methods]);

  const onSubmit = (data: AddResultFormData) => {
    console.log(data, " form data");

    const parsed: ParsedResult = {
      // prefer schema field or fallback to possible form field names
      name: (data as any).name ?? (data as any).fullname ?? null,
      regNo: (data as any).regNo ?? (data as any).regNumber ?? null,
      test: String(data.test ?? 0),
      lab: String(data.lab ?? 0),
      exam: String(data.exam ?? 0),
      total: String(data.total ?? total),
      grade: data.grade ?? methods.getValues("grade") ?? null,
      remark: data.remark ?? methods.getValues("remark") ?? null,
    };

    setParsedJson((prev) => [parsed, ...(prev ?? [])]);
    toggleModal();
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <ModalForm>
          {/* Fullname Field */}
          <TextFieldResult
            name="name"
            label="Full Name"
            placeholder="eg. John Doe (optional)"
          />
          {/* reg number field */}
          <TextFieldResult
            name="regNo"
            label="Reg Number"
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={11}
            placeholder="eg. 20231245883"
          />

          {/* Test field */}
          <TextFieldResult
            name="test"
            label="Test Score"
            type="number"
            placeholder="eg. 18"
          />

          {/* Lab field */}
          <TextFieldResult
            name="lab"
            label="Lab Score"
            type="number"
            placeholder="eg. 18"
          />

          {/* Exam field */}
          <TextFieldResult
            name="exam"
            label="Exam Score"
            type="number"
            placeholder="eg. 55"
          />

          {/* Computed Total (read-only) */}
          <div className="modal-field">
            <Label htmlFor="total">Total</Label>
            <input value={total} readOnly />
          </div>

          {/* Computed Grade (read-only) */}
          <div className="modal-field">
            <Label htmlFor="grade">Grade</Label>
            <input value={methods.watch("grade") ?? ""} readOnly />
          </div>

          {/* Computed Remark (read-only) */}
          <div className="modal-field">
            <Label htmlFor="remark">Remark</Label>
            <input value={methods.watch("remark") ?? ""} readOnly />
          </div>
        </ModalForm>

        {/* CTA's */}
        <div className="justify-end w-full flex gap-8 basis-auto">
          <button type="button" className="cancel-btn" onClick={toggleModal}>
            Cancel
          </button>
          <button type="submit" className={`button-primary `}>
            Add Result
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}
