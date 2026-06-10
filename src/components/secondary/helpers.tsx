import { SelectedOffering } from "@/app/types/advisor";
import { Error as ErrorComponent } from "./common";
import { RefreshCcw } from "lucide-react";
import { RefetchButton } from "./buttons";
import { LoadingMessage } from "./loaders/loaders";

export function SelectCourse({
  courseOfferings,
  isPending,
  isDisabled,
  advisorOfferingsError,
  refetch,
  setCourse,
}: {
  courseOfferings: SelectedOffering[];
  isPending: boolean;
  isDisabled: boolean;
  advisorOfferingsError: Error;
  setCourse: React.Dispatch<React.SetStateAction<SelectedOffering | null>>;
  refetch?: () => void;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value;

    const offering = courseOfferings.find(
      (o) => o.courses.course_code === code,
    );

    if (offering) {
      setCourse(offering);
    } else {
      setCourse(null);
    }
  }

  return (
    <div className="relative flex gap-4">
      <input
        className="modal-input"
        list="courseList"
        disabled={isDisabled}
        placeholder="Select a course"
        // value={course}
        onChange={handleChange}
      />
      {isPending ? (
        <LoadingMessage />
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
      {/* Refetch */}
      {advisorOfferingsError && refetch && <RefetchButton refetch={refetch} />}
    </div>
  );
}
