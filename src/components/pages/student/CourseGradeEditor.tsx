"use client";

import { formatCgpa, GradeLetter, toGradeLetter } from "@/utils/systemUtils";

export type CalculatorCourse = {
  id: string;
  code: string;
  unit: number;
  grade: GradeLetter;
};

type CourseGradeEditorProps = {
  title: string;
  hint: string;
  courses: CalculatorCourse[];
  onChange: (courses: CalculatorCourse[]) => void;
  result: number;
  theme?: "default" | "green";
};

const gradeOptions: GradeLetter[] = ["A", "B", "C", "D", "E", "F"];

export function CourseGradeEditor({
  title,
  hint,
  courses,
  onChange,
  result,
  theme = "default",
}: CourseGradeEditorProps) {
  // Keeps row updates immutable and reusable for both calculator blocks.
  const updateCourse = (id: string, patch: Partial<CalculatorCourse>) => {
    const nextCourses = courses.map((course) =>
      course.id === id ? { ...course, ...patch } : course,
    );
    onChange(nextCourses);
  };

  const addCourse = () => {
    onChange([
      ...courses,
      {
        id: crypto.randomUUID(),
        code: "",
        unit: 1,
        grade: "A",
      },
    ]);
  };

  const removeCourse = (id: string) => {
    const nextCourses = courses.filter((course) => course.id !== id);
    onChange(nextCourses.length ? nextCourses : courses);
  };

  return (
    <div
      className={`dashboard-container ${theme === "green" ? "border !border-[var(--color-green)] bg-[var(--color-green-background)]" : ""}`}
    >
      <div className="mb-16">
        <h2 className="text-medium font-bold">{title}</h2>
        <p className="secondary-heading text-[var(--color-text-link)] mt-4">
          {hint}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Unit</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <input
                    value={course.code}
                    onChange={(event) =>
                      updateCourse(course.id, { code: event.target.value })
                    }
                    placeholder="eg. MEE401"
                    className="w-full py-8 px-12 rounded-small border-light secondary-heading input"
                  />
                </td>
                <td>
                  <select
                    value={course.unit}
                    onChange={(event) =>
                      updateCourse(course.id, {
                        unit: Number(event.target.value),
                      })
                    }
                    className="w-full py-8 px-12 rounded-small border-light secondary-heading input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={course.grade}
                    onChange={(event) =>
                      updateCourse(course.id, {
                        grade: toGradeLetter(event.target.value),
                      })
                    }
                    className="w-full py-8 px-12 rounded-small border-light secondary-heading input"
                  >
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    className="cancel-btn"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-16 flex justify-between gap-8">
        <button
          type="button"
          onClick={addCourse}
          className={` button-primary ${theme === "green" && "button-green"}`}
        >
          Add Course
        </button>

        {/* REsults */}
       {theme === "default" &&  <div>
          <p className="secondary-heading text-[var(--color-text-link)]">
            Current Calculated CGPA
          </p>
          <h3 className="text-extra-large font-bold mt-8">
            {formatCgpa(result)} / 5.00
          </h3>
        </div> }
      </div>
    </div>
  );
}
