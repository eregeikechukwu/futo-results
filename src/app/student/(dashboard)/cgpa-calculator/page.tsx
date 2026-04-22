"use client";

import {
  CourseGradeEditor,
  CalculatorCourse,
} from "@/components/pages/student/CourseGradeEditor";
import { DashboardContainer } from "@/components/secondary/common";
import { Header } from "@/components/secondary/header";
import { calculateCgpaFromGrades, formatCgpa } from "@/utils/systemUtils";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./cgpa.module.scss";

function createDefaultCourse(seed: string): CalculatorCourse {
  // Single factory keeps initial course row shape consistent in both sections.
  return {
    id: seed,
    code: "",
    unit: 1,
    grade: "A",
  };
}

const useUpdateEffect = function (
  effect: () => void,
  dependency: CalculatorCourse[][],
) {
  const ref = useRef(true);

  useEffect(() => {
    if (ref.current) {
      ref.current = false;
      return;
    }
    effect();
  }, dependency);
};

export default function CgpaCalculatorPage() {
  const [mainCourses, setMainCourses] = useState<CalculatorCourse[]>([
    createDefaultCourse("main-1"),
  ]);
  const [projectedCourses, setProjectedCourses] = useState<CalculatorCourse[]>([
    createDefaultCourse("projected-1"),
  ]);

  const [mainCgpa, setMainCgpa] = useState<number>(0);
  const [projectedCgpa, setProjectedCgpa] = useState<number>(0);

  // First render flag
  const isFirstRender = useRef(true);

  // Cumulative projected CGPA uses both current and projected course blocks.
  const cumulativeProjectedCgpa = useMemo(() => {
    const merged = [...mainCourses, ...projectedCourses].map((course) => ({
      unit: course.unit,
      grade: course.grade,
    }));

    return calculateCgpaFromGrades(merged);
  }, [mainCourses, projectedCourses]);

  // const handleCalculateMain = () => {
  //   const formattedCourses = mainCourses.map((course) => ({
  //     unit: course.unit,
  //     grade: course.grade,
  //   }));

  //   setMainCgpa(calculateCgpaFromGrades(formattedCourses));
  // };

  useUpdateEffect(() => {
    const formattedCourses = mainCourses.map((course) => ({
      unit: course.unit,
      grade: course.grade,
    }));

    setMainCgpa(calculateCgpaFromGrades(formattedCourses));
  }, [mainCourses]);

  const handleCalculateProjected = () => {
    const formattedCourses = projectedCourses.map((course) => ({
      unit: course.unit,
      grade: course.grade,
    }));

    setProjectedCgpa(calculateCgpaFromGrades(formattedCourses));
  };

  return (
    <DashboardContainer>
      <Header
        heading="CGPA Calculator"
        subHeading="Add courses, select grade letters, and calculate your CGPA on a 5-point scale."
      />

      <CourseGradeEditor
        title="Main CGPA Calculator"
        hint="Use this section for your current completed semester courses."
        courses={mainCourses}
        onChange={setMainCourses}
        result={mainCgpa}
      />

      {/* <div className="dashboard-container flex items-center justify-between">
        <div>
          <p className="secondary-heading text-[var(--color-text-link)]">
            Current Calculated CGPA
          </p>
          <h3 className="text-extra-large font-bold mt-8">
            {formatCgpa(mainCgpa)} / 5.00
          </h3>
        </div>
        <button
          type="button"
          className="button-primary"
          onClick={handleCalculateMain}
        >
          Calculate Main CGPA
        </button>
      </div> */}

      <CourseGradeEditor
        title="Projected CGPA Calculator"
        hint="Add expected courses/grades to estimate your future cumulative CGPA."
        courses={projectedCourses}
        onChange={setProjectedCourses}
        result={projectedCgpa}
        theme="green"
      />

      <div className={`dashboard-container ${styles.summaryCard}`}>
        <div>
          <p className={styles.summaryTitle}>Projected Section CGPA</p>
          <h3 className={styles.summaryValue}>
            {formatCgpa(projectedCgpa)} / 5.00
          </h3>
          <p className={styles.summaryHint}>
            Cumulative Projected CGPA (Main + Projected):
            <strong>
              {formatCgpa(cumulativeProjectedCgpa)} / 5.00
            </strong>
          </p>
        </div>
        <button
          type="button"
          className="button-primary button-green"
          onClick={handleCalculateProjected}
        >
          Calculate Projected CGPA
        </button>
      </div>
    </DashboardContainer>
  );
}
