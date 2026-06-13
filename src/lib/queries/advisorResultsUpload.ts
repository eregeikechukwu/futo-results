/**
 * Query for advisor to upload excel results
 * Smart query that reuses previously opened draft batches
 */

import { createSupabaseClient } from "../supabase/client";
import { UploadResult } from "@/app/types/resultsUpload";
import { deleteBatch } from "./advisorResultsDownload";

const deleteOrphanedBatch = async (batchId: string) => {
  try {
    await deleteBatch(batchId);
  } catch (err) {
    console.error("Failed to clean up orphaned batch:", err);
  }
};

export async function uploadExcelResults(
  courseOfferingId: string,
  advisorProfileId: string,
  parsedRows: UploadResult[],
) {
  const supabase = createSupabaseClient();

  // Step 1: Get pr create a draft batch for this offering -- look for an existing draft batch first
  const { data: existingBatch, error: batchFetchError } = await supabase
    .from("result_batches")
    .select("id")
    .eq("offering_id", courseOfferingId)
    .eq("status", "draft")
    .eq("source_type", "excel")
    .maybeSingle();

  if (batchFetchError) throw batchFetchError;

  let batchId: string;

  if (existingBatch) {
    //re- Use the existing draft batch
    batchId = existingBatch.id;
  } else {
    // No draft batch exists - create one
    const { data: newBatch, error: batchCreateError } = await supabase
      .from("result_batches")
      .insert({
        offering_id: courseOfferingId,
        status: "draft",
        source_type: "excel",
        uploaded_by: advisorProfileId,
      })
      .select("id")
      .single();

    if (batchCreateError) throw batchCreateError;
    batchId = newBatch.id;
  }

  //   STep 2: Resolve reg_number to student IDs
  const regNumbers = parsedRows.map((r) => r.reg_number.trim());
  console.log(regNumbers, "regNumbers, ytyhe reg nuilbers form teh excel file");

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, reg_number")
    .in("reg_number", regNumbers);

  if (studentsError) {
    console.log("students error " + studentsError);
    deleteOrphanedBatch(batchId);
    throw studentsError;
  }
  console.log(students, "students");
  // alert(studentsError);

  //   Build a lookup map: reg_number => student_id
  const regToId: Map<string, string> = new Map(
    (students ?? []).map((s) => [s.reg_number, s.id]),
  );
  console.log(regToId, "regToId");

  //   STep 3: Build upsert payload
  // Track which reg numbers had no matching student
  const unmatched: string[] = [];

  const entries = parsedRows.reduce<
    {
      batch_id: string;
      student_id: string;
      test_score?: number;
      exam_score?: number;
      lab_score?: number;
    }[]
  >((acc, row) => {
    const studentId = regToId.get(row.reg_number.trim());
    console.log(studentId, "--- studentId");

    if (!studentId) {
      unmatched.push(row.reg_number);
      return acc; // Skip unmatched rows
    }

    acc.push({
      batch_id: batchId,
      student_id: studentId,
      test_score: row.test_score,
      exam_score: row.exam_score,
      lab_score: row.lab_score,
    });

    return acc;
  }, []);

  if (entries.length === 0) {
    deleteOrphanedBatch(batchId);
    throw new Error(
      `No matching students found. Unmatched reg numbers: ${unmatched.join(", ")}`,
    );
  }

  //   Step 4: Upsert entries
  // ON CONFLICT (batch_id, student_id) updat scores only
  const { data: upserted, error: upsertError } = await supabase
    .from("result_entries")
    .upsert(entries, {
      onConflict: "batch_id,student_id",
      ignoreDuplicates: false, // false = overwrite on conflict
    })
    .select("id");

  if (upsertError) {
    deleteOrphanedBatch(batchId);
    throw upsertError;
  }

  // Step 5: Return Summary
  return {
    batchId,
    inserted: upserted?.length ?? 0,
    unmatched, //Count of unmatched reg numbers, should be sown on the client to warn the advisor
    skipped: unmatched.length,
  };
}
