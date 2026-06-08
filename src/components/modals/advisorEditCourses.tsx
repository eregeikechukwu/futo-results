"use client";

import { useState } from "react";
import { Label } from "./reUsables";
import { AdvisorCourse } from "@/app/types/advisor";

export function EditCourse({
  course,
  toggleModal,
}: {
  course: AdvisorCourse;
  toggleModal: () => void;
}) {
  const [courseState, setCourseState] = useState(course);
  const units = [1, 2, 3, 4, 5, 6];
  const semesters = ["Harmattan", "Rain"];

  return (
    <form onSubmit={() => alert("fuck")}>
      <div className="flex flex-col gap-16">
        {/* Course code */}
        <div>
          <Label htmlFor="course-code">Course Code</Label>
          <input
            id="course-code"
            type="text"
            required
            value={courseState.courseCode}
            className="modal-input"
            onChange={(e) =>
              setCourseState({ ...courseState, courseCode: e.target.value })
            }
          />
        </div>

        {/* Course title */}
        <div>
          <Label htmlFor="course-title">Course Title</Label>
          <input
            id="course-title"
            type="text"
            required
            value={courseState.courseTitle}
            className="modal-input"
            onChange={(e) =>
              setCourseState({ ...courseState, courseTitle: e.target.value })
            }
          />
        </div>

        {/* Credit Units */}
        <div>
          <Label htmlFor="credit-unit">Credit Unit</Label>
          <select
            id="credit-unit"
            value={courseState.unit}
            required
            className="modal-input"
            onChange={(e) =>
              setCourseState({ ...courseState, unit: e.target.value })
            }
          >
            {units.map((unit) => (
              <option value={unit} key={unit}>
                {unit} Units
              </option>
            ))}
          </select>
        </div>

        {/* Semester*/}
        <div>
          <Label htmlFor="semester">Semester</Label>
          <select
            id="semester"
            value={courseState.semester}
            required
            className="modal-input"
            onChange={(e) =>
              setCourseState({
                ...courseState,
                semester: e.target.value as "Rain" | "Harmattan",
              })
            }
          >
            {semesters.map((semester) => (
              <option value={semester} key={semester}>
                {semester} Semester
              </option>
            ))}
          </select>
        </div>

        {/* Session*/}
        <div>
          <Label htmlFor="session">Session</Label>
          <input
            id="session"
            type="text"
            required
            value={courseState.session}
            className="modal-input"
            onChange={(e) =>
              setCourseState({ ...courseState, session: e.target.value })
            }
          />
        </div>
      </div>

      <div className="justify-end w-full flex gap-8 mt-16">
        <button type="button" className="cancel-btn" onClick={toggleModal}>
          Cancel
        </button>
        <button type="submit" className="button-primary">Update Course</button>
      </div>
    </form>
  );
}

// className="p-24 bg-[var(--color-white)] rounded-[1rem]"
