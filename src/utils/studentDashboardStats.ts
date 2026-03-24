import { resultData } from "@/mock/resultsData";
import { calculateCgpaFromGrades } from "./systemUtils";
import { StudentCourseResult } from "@/components/pages/student/types";

export const gpas = resultData
  .map((semester) => semester.courses)
  .map((result) => {
    const arrayOfResults = result.map((course: StudentCourseResult) => ({
      unit: course.unit,
      grade: course.grade,
    }));

    return calculateCgpaFromGrades(arrayOfResults);
  });

const CGPA = gpas.reduce((gpa, sum) => sum + gpa) / gpas.length;

const units = resultData
  .map((semester) => semester.courses)
  .map((result) =>
    result.map((grades) => grades.unit).reduce((unit, sum) => sum + unit),
  )
  .reduce((units, sum) => sum + units);

export const studentsDashboardStats = [
  {
    title: "Current CGPA",
    count: CGPA,
    subText: "/ 5.00",
    icon: "Trophy",
    color: "blue",
  },
  {
    title: "Total Credits",
    count: units,
    subText: "units completed",
    icon: "Book",
    color: "green",
  },
  {
    title: "Semesters",
    count: resultData.length,
    subText: "Completed",
    icon: "Calendar",
    color: "purple",
  },
  {
    title: "Last Updated",
    value: "March 16th 2023",
    icon: "RefreshCcwIcon",
    color: "brown",
  },
];
