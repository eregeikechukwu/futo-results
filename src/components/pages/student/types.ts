import { GradeLetter } from "@/utils/systemUtils";

export type StudentCourseResult = {
  courseCode: string;
  courseTitle: string;
  unit: number;
  test: number;
  lab: number;
  exam: number;
  total: number;
  grade: GradeLetter;
};

export type SemesterResult = {
  id: string;
  label: string;
  session: string;
  semester: "Harmattan" | "Rain";
  student: {
    name: string;
    regNumber: string;
    department: string;
    level: string;
  };
  courses: StudentCourseResult[];
};
