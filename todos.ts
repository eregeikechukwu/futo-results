// lib/queries/students.ts
/*
// Fetch advisor students
export async function fetchAdvisorStudentList(
  departmentId: string,
  admissionYear: number
) {
  const supabase = createClient();

  // ── Pending students (unclaimed preregistrations) ──
  const { data: pending, error: pendingError } = await supabase
    .from('student_preregistrations')
    .select('id, reg_number, email, created_at')
    .eq('department_id', departmentId)
    .eq('admission_year', admissionYear)
    .eq('claimed', false);

  if (pendingError) throw pendingError;

  // ── Verified + flagged students (claimed, in students table) ──
  const { data: active, error: activeError } = await supabase
    .from('students')
    .select(`
      id,
      reg_number,
      status,
      admission_year,
      profiles!inner ( full_name, email )
    `)
    .eq('department_id', departmentId)
    .eq('admission_year', admissionYear);

  if (activeError) throw activeError;

  // ── Merge into one list with a derived status field ──
  const pendingList = (pending ?? []).map(p => ({
    id:          p.id,
    reg_number:  p.reg_number,
    email:       p.email,
    full_name:   null,           // not signed up yet — no name
    status:      'pending' as const,
    source:      'preregistration' as const,
  }));

  const activeList = (active ?? []).map(s => ({
    id:         s.id,
    reg_number: s.reg_number,
    email:      s.profiles.email,
    full_name:  s.profiles.full_name,
    status:     s.status as 'verified' | 'flagged',
    source:     'students' as const,
  }));

  return [...pendingList, ...activeList];
}
  */
