import { SelectedOffering } from "@/app/types/advisor";
import { Error as ErrorComponent } from "./common";

export function SelectCourse({
  courseOfferings,
  isPending,
  advisorOfferingsError,
  setCourse,
}: {
  courseOfferings: SelectedOffering[];
  isPending: boolean;
  advisorOfferingsError: Error;
  setCourse: React.Dispatch<React.SetStateAction<string>>;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value;

    const offering = courseOfferings.find(
      (o) => o.courses.course_code === code,
    );

    if (offering) {
      setCourse(offering.id);
    } else {
      setCourse("");
    }
  }

  return (
    <div>
      <input
        className="modal-input"
        list="courseList"
        placeholder="Select a course"
        // value={course}
        onChange={handleChange}
      />
      {isPending ? (
        <div>loading...</div>
      ) : !advisorOfferingsError ? (
        <datalist id="courseList">
          {courseOfferings.map((offering) => (
            <option key={offering.id} value={offering.courses.course_code}>
              {offering.courses.course_code}
            </option>
          ))}
        </datalist>
      ) : (
        <ErrorComponent>Failed to load courses</ErrorComponent>
      )}
    </div>
  );
}
