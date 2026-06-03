import { timeout } from "@/app/advisor/functions/students";
import { createSupabaseClient } from "../supabase/client";
import { UpdateCourseInput, AddCourseInput } from "@/app/types/advisor";

// lib/queries/courses.ts

export async function addCourseOffering(input: AddCourseInput) {
  const supabase = createSupabaseClient();

  // ── Step 1: Normalize course code ──
  // Trim whitespace, uppercase, collapse internal spaces
  // "get 201 " → "GET 201"
  const normalizedCode = input.course_code
    .trim()
    .toUpperCase()
    .replace(/[^a-zA-Z0-9]/g, "");

  // ── Step 2: Check if course already exists ──
  const { data: existingCourse, error: lookupError } = await Promise.race([
    supabase
      .from("courses")
      .select("id, course_code, course_title")
      .eq("course_code", normalizedCode)
      .maybeSingle(),
    timeout(30000),
  ]);

  if (lookupError) throw lookupError;

  let courseId: string;

  if (existingCourse) {
    // ── Step 3a: Course exists — use its id ──
    courseId = existingCourse.id;
  } else {
    // ── Step 3b: Course doesn't exist — create it ──
    const { data: newCourse, error: insertCourseError } = await Promise.race([
      supabase
        .from("courses")
        .insert({
          course_code: normalizedCode,
          course_title: input.course_title.trim(),
        })
        .select("id")
        .single(),
      timeout(30000),
    ]);
    if (insertCourseError) throw insertCourseError;
    courseId = newCourse.id;
  }

  // ── Step 4: Create the course offering ──
  // If this advisor already added this course for this term,
  // the UNIQUE (advisor_id, term_id, course_id) constraint will throw
  const { data: offering, error: offeringError } = await Promise.race([
    supabase
      .from("course_offerings")
      .insert({
        course_id: courseId,
        term_id: input.term_id,
        advisor_id: input.advisor_id,
        unit: input.unit,
      })
      .select(
        `
      id,
      unit,
      courses!inner ( id, course_code, course_title ),
      academic_terms!inner ( id, session, semester )
    `,
      )
      .single(),
    timeout(30000),
  ]);

  if (offeringError) {
    // Handle duplicate offering gracefully
    if (offeringError.code === "23505") {
      throw new Error(`${normalizedCode} is already added for this term.`);
    }
    throw offeringError;
  }

  return offering;
}

export async function deleteCourseOffering(offeringId: string) {
  const supabase = createSupabaseClient();

  // Check if any result batches exist for this offering
  const { data: batches, error: checkError } = await Promise.race([
    supabase
      .from("result_batches")
      .select("id")
      .eq("offering_id", offeringId)
      .limit(1),
    timeout(30000),
  ]);

  if (checkError) throw checkError;

  if (batches && batches.length > 0) {
    throw new Error(
      "Cannot remove this course — results have already been uploaded for it. Delete the result batches and entries first.",
    );
  }

  // Safe to delete as no batches exist
  const { error } = await supabase
    .from("course_offerings")
    .delete()
    .eq("id", offeringId);

  if (error) throw error;
}

export async function updateCourseOffering(
  offeringId: string,
  input: UpdateCourseInput,
) {
  const supabase = createSupabaseClient();

  console.log(1, "before");
  // For simplicity, this example only allows updating the unit and term of an offering.
  const { data: updatedOffering, error } = await Promise.race([
    supabase
      .from("course_offerings")
      .update({
        unit: input.unit,
        term_id: input.term_id,
      })
      .eq("id", offeringId),

    timeout(10000),
  ]);
  if (error) throw error;

  return updatedOffering;
}
