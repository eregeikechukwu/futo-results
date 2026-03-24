import { GradeLetter, gradeToneMap } from "@/utils/systemUtils";

export function GradeBadge({ grade }: { grade: GradeLetter }) {
  // Uses centralized grade->color tokens from system utils to keep UI consistent.
  const tone = gradeToneMap[grade];

  return (
    <span
      className="inline-flex items-center justify-center rounded-[999px] px-4 py-4 text-12 lh-16 font-bold min-w-8"
      style={{ backgroundColor: tone.bg, color: tone.text }}
    >
      {grade}
    </span>
  );
}
