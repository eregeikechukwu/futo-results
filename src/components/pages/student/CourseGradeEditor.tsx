"use client";

import { formatCgpa, GradeLetter, toGradeLetter } from "@/utils/systemUtils";
import styles from "./CourseGradeEditor.module.scss";

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
    // Dont allow deletion of last course.
  };

  return (
    <div
      className={`dashboard-container ${styles.editorRoot} ${theme === "green" ? styles.editorGreen : ""}`}
    >
      <div className="mb-16">
        <h2 className="text-medium font-bold">{title}</h2>
        <p className="secondary-heading text-[var(--color-text-link)] mt-4">
          {hint}
        </p>
      </div>

      <div className={styles.tableWrap}>
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
                    className={`${styles.courseInput} input`}
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
                    className={`${styles.courseInput} input`}
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
                    className={`${styles.courseInput} input`}
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

      <div className={styles.actions}>
        <button
          type="button"
          onClick={addCourse}
          className={` button-primary ${theme === "green" && "button-green"}`}
        >
          Add Course
        </button>

        {/* REsults */}
        {theme === "default" && (
          <div className={styles.resultCard}>
            <p className={styles.resultTitle}>Current Calculated CGPA</p>
            <h3 className={styles.resultValue}>{formatCgpa(result)} / 5.00</h3>
          </div>
        )}
      </div>
    </div>
  );
}
