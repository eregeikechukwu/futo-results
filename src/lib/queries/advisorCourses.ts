import { createSupabaseClient } from "../supabase/client";
// lib/queries/courses.ts

interface AddCourseInput {
  course_code: string;
  course_title: string;
  unit: number;
  term_id: string;
  advisor_id: string;
}

export async function addCourseOffering(input: AddCourseInput) {
  const supabase = createSupabaseClient();

  // ── Step 1: Normalize course code ──
  // Trim whitespace, uppercase, collapse internal spaces
  // "get 201 " → "GET 201"
  const normalizedCode = input.course_code
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  // ── Step 2: Check if course already exists ──
  const { data: existingCourse, error: lookupError } = await supabase
    .from("courses")
    .select("id, course_code, course_title")
    .eq("course_code", normalizedCode)
    .maybeSingle();

  if (lookupError) throw lookupError;

  let courseId: string;

  if (existingCourse) {
    // ── Step 3a: Course exists — use its id ──
    courseId = existingCourse.id;
  } else {
    // ── Step 3b: Course doesn't exist — create it ──
    const { data: newCourse, error: insertCourseError } = await supabase
      .from("courses")
      .insert({
        course_code: normalizedCode,
        course_title: input.course_title.trim(),
      })
      .select("id")
      .single();

    if (insertCourseError) throw insertCourseError;
    courseId = newCourse.id;
  }

  // ── Step 4: Create the course offering ──
  // If this advisor already added this course for this term,
  // the UNIQUE (advisor_id, term_id, course_id) constraint will throw
  const { data: offering, error: offeringError } = await supabase
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
    .single();

  if (offeringError) {
    // Handle duplicate offering gracefully
    if (offeringError.code === "23505") {
      throw new Error(`${normalizedCode} is already added for this term.`);
    }
    throw offeringError;
  }

  return offering;
}
