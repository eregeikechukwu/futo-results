import CountUp from "@/utils/countUp";
import { SquareDot } from "../utilities";

export default function ProgressBar({
  progress,
  total,
  color,
  title,
  withPercentage = false,
}: {
  progress: number;
  total: number;
  color?: string;
  title: string;
  withPercentage?: boolean;
}) {
  const percentage =
    Math.min(progress / total) * 100 > 0 ? Math.min(progress / total) * 100 : 0;
  const barColor = color || "var(--color-primary)";

  return (
    <div className="flex items-center">
      {withPercentage && <SquareDot color={barColor} />}
      <p
        className={`font-medium mr-16 ${
          withPercentage
            ? "lh-24"
            : "secondary-heading pr-4 text-[var(--color-text-link)]"
        }`}
      >
        {title}
      </p>
      <div className="progress-bar">
        <div
          className={`progress-bar-fill`}
          style={
            {
              ["--progress" as string]: `${percentage}%`,
              ["--progress-color" as string]: barColor,
            } as React.CSSProperties
          }
        />
      </div>
      <div className="flex flex-col  text-right items-end">
        <CountUp end={progress} styles="w-18  secondary-heading font-[600]" />
        {withPercentage && (
          <p className="text-small-passive">{percentage.toFixed(2)}%</p>
        )}
      </div>
    </div>
  );
}
