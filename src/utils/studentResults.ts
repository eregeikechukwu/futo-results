import {
  calculateCgpaFromGrades,
  computeGrade,
  formatCgpa,
  GradeLetter,
  toGradeLetter,
} from "./systemUtils";
import {
  SemesterResult,
  StudentCourseResult,
} from "@/components/pages/student/types";

export type StudentResultEntry = {
  id: string;
  test_score: number | null;
  lab_score: number | null;
  exam_score: number | null;
  total_score: number | null;
  grade: string | null;
  remark: string | null;
  batch_id: string;
  result_batches: {
    id: string;
    status: string;
    published_at: string | null;
    offering_id: string;
    course_offerings: {
      id: string;
      unit: number;
      courses: {
        course_code: string;
        course_title: string;
      };
      academic_terms: {
        id: string;
        session: string;
        semester: string;
        academic_year: number;
      };
    };
  };
};

export type StudentTermResult = {
  id: string;
  label: string;
  session: string;
  semester: "Harmattan" | "Rain";
  courses: StudentCourseResult[];
  publishedAt?: string;
  student: SemesterResult["student"];
  gpa: number;
};

const semesterOrder: Record<string, number> = {
  Harmattan: 0,
  Rain: 1,
};

function normalizeSemester(semester: string): "Harmattan" | "Rain" {
  return semester === "Rain" ? "Rain" : "Harmattan";
}

function parseSessionYear(session: string) {
  const year = parseInt(session.split("/")[0], 10);
  return Number.isFinite(year) ? year : 0;
}

export function calculateStudentLevel(
  admissionYear: number,
  activeTermSession?: string,
) {
  if (!activeTermSession) return null;
  const activeTermYear = parseSessionYear(activeTermSession);
  if (!activeTermYear) return null;
  return (activeTermYear - admissionYear + 1) * 100;
}

export function normalizeCourseResult(
  entry: StudentResultEntry,
): StudentCourseResult {
  const test = Number(entry.test_score ?? 0);
  const lab = Number(entry.lab_score ?? 0);
  const exam = Number(entry.exam_score ?? 0);
  const total = Number(entry.total_score ?? test + lab + exam);
  const grade = entry.grade ? toGradeLetter(entry.grade) : computeGrade(total);

  return {
    courseCode: entry.result_batches.course_offerings.courses.course_code,
    courseTitle: entry.result_batches.course_offerings.courses.course_title,
    unit: Number(entry.result_batches.course_offerings.unit ?? 0),
    test,
    lab,
    exam,
    total,
    grade,
  };
}

export function groupStudentResultsByTerm(
  entries: StudentResultEntry[],
  studentName: string,
  regNumber: string,
  departmentName: string,
  admissionYear: number,
  activeTermSession?: string,
): StudentTermResult[] {
  const student = {
    name: studentName,
    regNumber,
    department: departmentName,
    level:
      calculateStudentLevel(admissionYear, activeTermSession) !== null
        ? `${calculateStudentLevel(admissionYear, activeTermSession)} Level`
        : "N/A",
  };

  const termMap = new Map<
    string,
    {
      session: string;
      semester: "Harmattan" | "Rain";
      courses: Map<string, StudentCourseResult>;
      publishedAt?: string;
    }
  >();

  for (const entry of entries) {
    const offering = entry.result_batches?.course_offerings;
    const term = offering?.academic_terms;
    if (!offering || !term?.session) continue;

    const semester = normalizeSemester(term.semester);
    const termKey = `${term.session}-${semester}`;
    const course = normalizeCourseResult(entry);
    const publishedAt = entry.result_batches.published_at ?? undefined;

    const existing = termMap.get(termKey);
    if (!existing) {
      const courses = new Map<string, StudentCourseResult>();
      courses.set(course.courseCode, course);
      termMap.set(termKey, {
        session: term.session,
        semester,
        courses,
        publishedAt,
      });
      continue;
    }

    const existingCourse = existing.courses.get(course.courseCode);
    if (!existingCourse) {
      existing.courses.set(course.courseCode, course);
    } else if (publishedAt && existing.publishedAt) {
      if (
        new Date(publishedAt).getTime() >
        new Date(existing.publishedAt).getTime()
      ) {
        existing.courses.set(course.courseCode, course);
      }
    }

    if (
      publishedAt &&
      (!existing.publishedAt ||
        new Date(publishedAt).getTime() >
          new Date(existing.publishedAt).getTime())
    ) {
      existing.publishedAt = publishedAt;
    }
  }

  return Array.from(termMap.entries())
    .sort(([aKey, aValue], [bKey, bValue]) => {
      const aYear = parseSessionYear(aValue.session);
      const bYear = parseSessionYear(bValue.session);
      if (aYear !== bYear) return bYear - aYear;
      return semesterOrder[aValue.semester] - semesterOrder[bValue.semester];
    })
    .map(([termKey, termValue]) => {
      const courses = Array.from(termValue.courses.values()).sort((a, b) =>
        a.courseCode.localeCompare(b.courseCode),
      );
      return {
        id: termKey,
        label: `${termValue.session} - ${termValue.semester}`,
        session: termValue.session,
        semester: termValue.semester,
        courses,
        publishedAt: termValue.publishedAt,
        student,
        gpa: calculateCgpaFromGrades(
          courses.map((course) => ({ unit: course.unit, grade: course.grade })),
        ),
      };
    });
}

export function buildStudentDashboardStats(
  terms: StudentTermResult[],
  admissionYear: number,
  activeTermSession?: string,
) {
  const courses = terms.flatMap((term) => term.courses);
  const totalUnits = courses.reduce((sum, course) => sum + course.unit, 0);
  const cumulativeGpa = calculateCgpaFromGrades(
    courses.map((course) => ({ unit: course.unit, grade: course.grade })),
  );
  const currentLevel = calculateStudentLevel(admissionYear, activeTermSession);
  const lastUpdated = terms
    .map((term) => term.publishedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime())[0];

  return {
    cumulativeGpa,
    totalUnits,
    completedSemesters: terms.length,
    currentLevel: currentLevel ? `${currentLevel} Level` : "N/A",
    lastUpdated: lastUpdated
      ? new Date(lastUpdated).toLocaleDateString()
      : "N/A",
  };
}

export function buildStudentChartData(terms: StudentTermResult[]) {
  return {
    labels: terms.map(
      (term) =>
        `${term.session.split("/")[0]} ${term.semester === "Harmattan" ? "1st" : "2nd"}`,
    ),
    values: terms.map((term) => term.gpa),
  };
}
