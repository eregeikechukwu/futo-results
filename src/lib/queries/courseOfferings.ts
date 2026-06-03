import { createSupabaseClient } from "../supabase/client";

/**
 * Fetches course offerings for an advisor in a specific academic term.
 * Includes course details and result batch information.
 *
 * Business Logic:
 * - course_offerings has a UNIQUE constraint on (advisor_id, term_id, course_id)
 * - An advisor must add a course to course_offerings before uploading results
 * - Course details are fetched from the global courses table (no department_id)
 * - Result batches linked to each offering show upload status and history
 *
 * @param advisorId - UUID of the advisor
 * @param termId - UUID of the academic term
 * @returns Array of course offerings with course details and result batch counts
 * @throws Error if Supabase query fails
 */
export async function fetchAdvisorCourseOfferings(
  advisorId: string,
  termId: string,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select(
      `
      id,
      course_id,
      term_id,
      courses!inner (id, course_code, course_title, unit),
      academic_terms!inner (id, session, semester, is_active),
      result_batches (id, status, created_at, published_at)
    `,
    )
    .eq("advisor_id", advisorId)
    .eq("term_id", termId)
    .order("courses.course_code", { ascending: true });

  if (error) throw error;

  // Transform to include derived fields for easier UI consumption
  return (data || []).map((offering: any) => ({
    id: offering.id,
    courseId: offering.course_id,
    termId: offering.term_id,
    courseCode: offering.courses.course_code,
    courseTitle: offering.courses.course_title,
    unit: offering.courses.unit,
    session: offering.academic_terms.session,
    semester: offering.academic_terms.semester,
    isActive: offering.academic_terms.is_active,
    // Batch statistics
    totalBatches: offering.result_batches?.length || 0,
    publishedBatches:
      offering.result_batches?.filter((b: any) => b.status === "published")
        .length || 0,
    draftBatches:
      offering.result_batches?.filter((b: any) => b.status === "draft")
        .length || 0,
    lastBatchAt: offering.result_batches?.[0]?.created_at || null,
  }));
}

/**
 * Fetches a single course offering by ID with all related information.
 *
 * Business Logic:
 * - Used for viewing details of a specific course offering
 * - Includes course info, term info, and result batch history
 *
 * @param offeringId - UUID of the course offering
 * @returns The course offering object with all related data
 * @throws Error if Supabase query fails or offering not found
 */
export async function fetchCourseOfferingById(offeringId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select(
      `
      id,
      course_id,
      term_id,
      advisor_id,
      courses!inner (id, course_code, course_title, unit),
      academic_terms!inner (id, session, semester, is_active),
      result_batches (id, status, created_at, published_at, source_type)
    `,
    )
    .eq("id", offeringId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Checks if a course offering already exists for the given parameters.
 * Respects the UNIQUE constraint on (advisor_id, term_id, course_id).
 *
 * Business Logic:
 * - Prevents duplicate course offerings (enforced by UNIQUE constraint in DB)
 * - Should be called before creating a new course offering
 * - Returns the existing offering if found, null if not
 *
 * @param advisorId - UUID of the advisor
 * @param termId - UUID of the academic term
 * @param courseId - UUID of the course
 * @returns The existing offering object if found, null otherwise
 * @throws Error if Supabase query fails
 */
export async function checkCourseOfferingExists(
  advisorId: string,
  termId: string,
  courseId: string,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select("id")
    .eq("advisor_id", advisorId)
    .eq("term_id", termId)
    .eq("course_id", courseId)
    .single();

  // No error = offering exists
  // Error with code PGRST116 = no rows returned = doesn't exist
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data || null;
}

/**
 * Creates a new course offering for an advisor in a specific term.
 * Enforces UNIQUE constraint on (advisor_id, term_id, course_id).
 *
 * Business Logic:
 * - An advisor must add a course to course_offerings before uploading results
 * - UNIQUE constraint prevents duplicate offerings
 * - If duplicate, Supabase will throw a constraint violation error
 * - The advisor_id is inferred from the advisor's profile context
 * - Default advisor_id is provided in schema but should use actual advisor_id
 *
 * @param advisorId - UUID of the advisor creating the offering
 * @param termId - UUID of the academic term
 * @param courseId - UUID of the course to add
 * @returns The newly created course offering with id
 * @throws Error if course offering already exists or Supabase query fails
 */
export async function createCourseOffering(
  advisorId: string,
  termId: string,
  courseId: string,
) {
  const supabase = createSupabaseClient();

  // Check if offering already exists before attempting to create
  const existing = await checkCourseOfferingExists(advisorId, termId, courseId);
  if (existing) {
    throw new Error(
      "This course is already offered for this term. Add a different course.",
    );
  }

  const { data, error } = await supabase
    .from("course_offerings")
    .insert({
      advisor_id: advisorId,
      term_id: termId,
      course_id: courseId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Deletes a course offering.
 * Cascading delete: all result_batches and result_entries linked to this offering are deleted.
 *
 * Business Logic:
 * - Can only delete if advisor owns the offering (enforced by RLS policy)
 * - Deleting an offering cascades to delete all results uploaded for that course
 * - This is a destructive operation - use with caution
 * - Cannot delete if there are published results (soft constraint, not enforced by DB)
 *
 * @param offeringId - UUID of the course offering to delete
 * @param advisorId - UUID of the advisor (for RLS verification)
 * @returns Empty object on success
 * @throws Error if offering not found or Supabase query fails
 */
export async function deleteCourseOffering(
  offeringId: string,
  advisorId: string,
) {
  const supabase = createSupabaseClient();

  // First check if offering exists and belongs to this advisor
  const offering = await fetchCourseOfferingById(offeringId);
  if (!offering) {
    throw new Error("Course offering not found.");
  }

  if (offering.advisor_id !== advisorId) {
    throw new Error(
      "You do not have permission to delete this course offering.",
    );
  }

  // Check if there are any published batches (soft validation, not enforced by DB)
  const publishedBatches = offering.result_batches?.filter(
    (b: any) => b.status === "published",
  );
  if (publishedBatches && publishedBatches.length > 0) {
    throw new Error(
      "Cannot delete a course offering with published results. Contact admin to force delete.",
    );
  }

  // Delete the course offering (cascading delete will remove related batches and entries)
  const { error } = await supabase
    .from("course_offerings")
    .delete()
    .eq("id", offeringId);

  if (error) throw error;

  return { success: true };
}

/**
 * Fetches all course offerings across all advisors for a specific term.
 * Used for admin views to see the full picture of what's offered.
 *
 * Business Logic:
 * - Returns offerings from all advisors for the given term
 * - Includes course and advisor details
 * - Useful for batch operations and reports
 *
 * @param termId - UUID of the academic term
 * @returns Array of all course offerings in the term
 * @throws Error if Supabase query fails
 */
export async function fetchAllCourseOfferingsByTerm(termId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select(
      `
      id,
      course_id,
      term_id,
      advisor_id,
      courses!inner (id, course_code, course_title, unit),
      academic_terms!inner (id, session, semester, is_active),
      advisors!inner (id, title, profiles!inner (full_name, email))
    `,
    )
    .eq("term_id", termId)
    .order("courses.course_code", { ascending: true });

  if (error) throw error;

  return data || [];
}

/**
 * Fetches course offerings statistics for a term.
 * Returns counts of offerings, courses, and total units offered.
 *
 * Business Logic:
 * - Counts total offerings in a term
 * - Sums total units across all offerings
 * - Used for dashboard statistics
 *
 * @param termId - UUID of the academic term
 * @returns Object with statistics (count, totalUnits, byAdvisor counts)
 * @throws Error if Supabase query fails
 */
export async function fetchCourseOfferingsStats(termId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select(
      `
      id,
      advisor_id,
      courses!inner (unit)
    `,
    )
    .eq("term_id", termId);

  if (error) throw error;

  const offerings = data || [];
  const totalUnits = offerings.reduce(
    (sum, o: any) => sum + (o.courses.unit || 0),
    0,
  );

  // Count offerings by advisor
  const byAdvisor: Record<string, number> = {};
  offerings.forEach((o: any) => {
    byAdvisor[o.advisor_id] = (byAdvisor[o.advisor_id] || 0) + 1;
  });

  return {
    totalOfferings: offerings.length,
    totalUnits,
    byAdvisor,
  };
}
