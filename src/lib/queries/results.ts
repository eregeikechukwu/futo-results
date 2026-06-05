import { createSupabaseClient } from "@/lib/supabase/client";

/**
 * Fetch course offerings for a specific advisor in a given term
 * RLS ensures advisor only sees their own offerings
 */
export async function fetchCourseOfferingsForTerm(
  advisorId: string,
  termId: string,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("course_offerings")
    .select(
      `
      id,
      unit,
      courses!inner (id, course_code, course_title),
      academic_terms!inner (id, session, semester),
      result_batches!left (id, status, source_type, created_at, published_at)
    `,
    )
    .eq("advisor_id", advisorId)
    .eq("academic_terms.id", termId)
    .order("courses(course_code)");

  if (error) throw error;
  return data || [];
}

/**
 * Fetch result entries for a specific offering with student and batch data
 * Joined to get full student info and batch status
 * RLS ensures advisor only sees their own results
 */
export async function fetchResultsForOffering(offeringId: string) {
  const supabase = createSupabaseClient();

  // Step 1: Get all batch IDs for this offering
  const { data: batches, error: batchError } = await supabase
    .from("result_batches")
    .select("id")
    .eq("offering_id", offeringId);

  if (batchError) throw batchError;
  if (!batches || batches.length === 0) return [];

  const batchIds = batches.map((b) => b.id);

  // Step 2: Fetch result entries filtered by those batch IDs
  const { data, error } = await supabase
    .from("result_entries")
    .select(
      `
      id,
      test_score,
      lab_score,
      exam_score,
      total_score,
      grade,
      remark,
      batch_id,
      students!inner (
        id,
        reg_number,
        profiles!students_profile_id_fkey ( id, full_name, email )
      ),
      result_batches!inner (
        id,
        status,
        source_type,
        created_at,
        published_at,
        offering_id
      )
    `,
    )
    .in("batch_id", batchIds);
  // .order("students(reg_number)");

  if (error) throw error;
  return data || [];
}

/**
 * Fetch batch metadata for a specific offering
 * Used to get current batch status and publishing info
 */
export async function fetchBatchForOffering(offeringId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("result_batches")
    .select("id, status, source_type, created_at, published_at, uploaded_by")
    .eq("offering_id", offeringId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function publishAllDraftBatches(offeringId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.rpc("publish_all_draft_batches", {
    p_offering_id: offeringId,
  });

  if (error) throw error;
  return Number(data) || 0;
}

/**
 * Update a single result entry with new scores
 * IMPORTANT: Only pass test_score, lab_score, exam_score
 * Never include total_score, grade, or remark — DB trigger calculates these
 */
export async function updateResultEntry(
  entryId: string,
  payload: {
    test_score?: number;
    lab_score?: number | null;
    exam_score?: number;
  },
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("result_entries")
    .update(payload)
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a result entry by ID
 * Only works if batch is in draft or reviewed status (enforced by RLS)
 */
export async function deleteResultEntry(entryId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("result_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}

/**
 * Publish a batch by updating its status to 'published' and setting published_at timestamp
 * Only advisors can publish; admins can archive
 */
export async function publishBatch(batchId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("result_batches")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", batchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
