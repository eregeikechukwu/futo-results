import { createSupabaseClient } from "../supabase/client";

/**
 * Calculates student level based on active academic term and admission year.
 * Formula: (active_term_year - admission_year + 1) * 100
 * Used to determine which year students belong to (100=first year, 200=second year, etc.)
 */
function calculateStudentLevel(
  activeTermYear: number,
  admissionYear: number,
): number {
  return (activeTermYear - admissionYear + 1) * 100;
}

/**
 * Fetches comprehensive dashboard statistics for an advisor.
 * Returns counts for: total students, new students, uploaded results, recent results,
 * active sessions, and pending reviews.
 *
 * Business Logic:
 * - totalStudents: Count of verified students in advisor's department and assigned admission year
 * - newStudents: Count of students who joined in the current academic session
 * - uploadedResults: Total count of published result batches for advisor's courses
 * - recentResults: Count of result batches uploaded in the current month
 * - activeSessions: Count of active academic terms (is_active = true)
 * - pendingReviews: Count of draft result batches waiting for advisor review
 *
 * @param advisorId - UUID of the advisor
 * @param departmentId - UUID of the advisor's department
 * @param admissionYear - The admission year this advisor is assigned to
 * @returns Object containing all dashboard statistics
 * @throws Error if Supabase query fails
 */
export async function fetchAdvisorDashboardStats(
  advisorProfileId: string,
  advisorId: string,
  departmentId: string,
  admissionYear: number,
) {
  const supabase = createSupabaseClient();

  // Get the current active academic term to calculate new students and recent activity
  const { data: activeTerm, error: termError } = await supabase
    .from("academic_terms")
    .select("id, session, semester, is_active")
    .eq("is_active", true)
    .single();

  if (termError) throw termError;

  // Extract year from session string (e.g., "2024/2025" -> 2024)
  const activeTermYear = activeTerm
    ? parseInt(activeTerm.session.split("/")[0])
    : 0;
  const targetLevel = calculateStudentLevel(activeTermYear, admissionYear);

  // 1. Count total verified students in advisor's department for their assigned admission year
  const { count: totalStudentsCountFromStudents, error: totalError } =
    await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId)
      .eq("admission_year", admissionYear)
      .is("deleted_at", null);

  const { count: studentsFromPreregistration, error: preError } = await supabase
    .from("student_preregistrations")
    .select("id", { count: "exact", head: true })
    .eq("department_id", departmentId)
    .eq("created_by", advisorId)
    .eq("claimed", false);

  if (totalError || preError) throw totalError;

  const totalStudents =
    totalStudentsCountFromStudents + studentsFromPreregistration || 0;

  // 2. Count new students (joined this academic session) on the main students table
  const { count: newStudentsCount, error: newError } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("department_id", departmentId)
    .eq("admission_year", admissionYear)
    .gte(
      "join_date",
      activeTerm
        ? new Date(activeTerm.session.split("/")[0]).toISOString()
        : "",
    ).is("deleted_at", null)

  const newStudents = newStudentsCount || 0;

  // 3. Count published result batches (uploaded results) for this advisor
  const { count: uploadedCount, error: uploadedError } = await supabase
    .from("result_batches")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", advisorProfileId)
    .eq("status", "published");

  if (uploadedError) throw uploadedError;
  const uploadedResults = uploadedCount || 0;

  // 4. Count recent result batches (uploaded this month)
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const { count: recentCount, error: recentError } = await supabase
    .from("result_batches")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", advisorId)
    .eq("status", "published")
    .gte("created_at", monthStart);

  if (recentError) throw recentError;
  const recentResults = recentCount || 0;

  // 5. Count active academic sessions (is_active = true)
  const { count: activeSessionsCount, error: sessionsError } = await supabase
    .from("academic_terms")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (sessionsError) throw sessionsError;
  const activeSessions = activeSessionsCount || 0;

  // 6. Count pending reviews (draft result batches for this advisor's courses)
  const { count: pendingCount, error: pendingError } = await supabase
    .from("result_batches")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft")
    .eq("uploaded_by", advisorId);

  if (pendingError) throw pendingError;
  const pendingReviews = pendingCount || 0;

  return {
    totalStudents,
    newStudents,
    uploadedResults,
    recentResults,
    targetLevel,
    pendingReviews,
    activeTerm,
  };
}

/**
 * Fetches upload activity aggregated by month for the last 5 months.
 * Used for the "Recent Upload Activity" chart on the dashboard.
 *
 * Business Logic:
 * - Groups result_batches by month and semester
 * - Counts total uploaded (published status) and pending (draft status) batches
 * - Returns last 5 months of data in chronological order
 *
 * @param advisorId - UUID of the advisor
 * @returns Array of monthly upload activity with uploaded/pending counts
 * @throws Error if Supabase query fails
 */
export async function fetchUploadActivity(advisorProfileId: string) {
  const supabase = createSupabaseClient();
  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

  // Fetch all result batches for this advisor (all time, we'll filter in JS)
  const { data: batches, error } = await supabase
    .from("result_batches")
    .select("id, created_at, status, offering_id")
    .eq("uploaded_by", advisorProfileId)
    .order("created_at", { ascending: false })
    .gte("created_at", fiveMonthsAgo.toISOString());

  if (error) throw error;
  let totalUploaded = 0;

  // Group by month and count uploaded vs total
  const monthlyStats: Record<
    string,
    { uploaded: number; total: number; month: string; date: Date }
  > = {};

  const now = new Date();

  // Initialize last 5 months
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyStats[monthKey] = {
      uploaded: 0,
      total: 0,
      month: date.toLocaleDateString("en-US", { month: "long" }),
      date,
    };
  }

  // Count batches in each month
  (batches || []).forEach((batch) => {
    const batchDate = new Date(batch.created_at);
    const monthKey = `${batchDate.getFullYear()}-${String(batchDate.getMonth() + 1).padStart(2, "0")}`;

    if (monthlyStats[monthKey]) {
      if (batch.status === "published") {
        monthlyStats[monthKey].uploaded++;

        if (monthlyStats[monthKey].uploaded > totalUploaded) {
          totalUploaded = monthlyStats[monthKey].uploaded;
        }
      }
      monthlyStats[monthKey].total = totalUploaded;
    }
  });

  // set total to highest uploads
  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyStats[monthKey]) {
      monthlyStats[monthKey].total = totalUploaded;
    }
  }

  return Object.values(monthlyStats).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

/**
 * Fetches recent result batches with course details for the "Last Upload Summary" section.
 * Returns the most recent batches with their status, course info, and batch metadata.
 *
 * Business Logic:
 * - Fetches published and draft result batches for the advisor
 * - Joins with course_offerings to get course titles and metadata
 * - Orders by most recent first
 * - Limits to a reasonable number for UI display (typically 3-5)
 *
 * @param advisorId - UUID of the advisor
 * @param limit - Maximum number of recent batches to fetch (default: 5)
 * @returns Array of recent batches with course and term information
 * @throws Error if Supabase query fails
 */
export async function fetchRecentBatches(
  advisorProfileId: string,
  limit: number = 3,
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("result_batches")
    .select(
      `
      id,
      status,
      created_at,
      published_at,
      offering_id,
      course_offerings!inner (
        id,
        course_id,
        term_id,
        courses!inner (course_title, course_code, unit),
        academic_terms!inner (session, semester)
      )
    `,
    )
    .eq("uploaded_by", advisorProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Transform and enrich the data for easier UI consumption
  return (data || []).map((batch: any) => ({
    id: batch.id,
    status: batch.status,
    createdAt: batch.created_at,
    publishedAt: batch.published_at,
    title: `${batch.course_offerings.academic_terms.session} - ${batch.course_offerings.academic_terms.semester}`,
    courseTitle: batch.course_offerings.courses.course_title,
    courseCode: batch.course_offerings.courses.course_code,
    items: `${batch.course_offerings.courses.unit} units`,
    statusLabel:
      batch.status === "published"
        ? "Completed"
        : batch.status === "reviewed"
          ? "In Progress"
          : "Failed",
    color:
      batch.status === "published"
        ? "green"
        : batch.status === "reviewed"
          ? "brown"
          : "red",
  }));
}

/**
 * Fetches all course offerings for a specific academic term.
 * Includes course details, offering metadata, and upload status.
 *
 * Business Logic:
 * - Filters course_offerings by term_id and optional advisor_id
 * - Joins with courses table to get course details (title, code, units)
 * - Orders by course code for consistent display
 *
 * @param termId - UUID of the academic term
 * @param advisorId - Optional: Filter to courses offered by this advisor
 * @returns Array of course offerings with course and term details
 * @throws Error if Supabase query fails
 */
export async function fetchCourseOfferingsByTerm(
  termId: string,
  advisorId?: string,
) {
  const supabase = createSupabaseClient();

  let query = supabase
    .from("course_offerings")
    .select(
      `
      id,
      course_id,
      term_id,
      advisor_id,
      courses!inner (id, course_code, course_title, unit),
      academic_terms!inner (id, session, semester, is_active)
    `,
    )
    .eq("term_id", termId);

  if (advisorId) {
    query = query.eq("advisor_id", advisorId);
  }

  const { data, error } = await query.order("courses.course_code", {
    ascending: true,
  });

  if (error) throw error;

  return data || [];
}

/**
 * Fetches all courses (global master records).
 * Used for dropdowns when adding new course offerings.
 *
 * Business Logic:
 * - Returns all courses available in the system
 * - Courses are NOT department-specific
 * - Ordered by course code
 *
 * @returns Array of all available courses
 * @throws Error if Supabase query fails
 */
export async function fetchAllCourses() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, course_code, course_title, unit")
    .order("course_code", { ascending: true });

  if (error) throw error;

  return data || [];
}

/**
 * Fetches active academic terms for filtering/selection purposes.
 *
 * Business Logic:
 * - Returns all active academic terms (is_active = true)
 * - Typically there's only one active term at a time
 * - Ordered by session year (newest first)
 *
 * @returns Array of active academic terms
 * @throws Error if Supabase query fails
 */
export async function fetchActiveTerms() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("academic_terms")
    .select("id, session, semester, is_active")
    .eq("is_active", true)
    .order("session", { ascending: false });

  if (error) throw error;

  return data || [];
}
