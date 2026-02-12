import { colorMap } from "@/utils/colorMaps";
import CountUp from "@/utils/countUp";
import { iconMap } from "@/utils/iconMap";
import React, { RefAttributes } from "react";

export function StudentStatCard({
  icon,
  color,
  title,
  count,
  value,
  subText,
}: {
  icon: string;
  color: string;
  title: string;
  value?: string;
  count?: number;
  subText?: string;
}) {
  const colors = colorMap[color as keyof typeof colorMap];
  const bg = `bg-[${colors?.bg}]`;
  const iconColor = `text-[${colors?.colour}]`;

  return (
    <div className="p-24 rounded-2xl shadow-lg hover:shadow-xl group transition-all duration-300 ease-in-out">
      {/* Icon */}
      <div
        className={`${bg} ${iconColor} h-53 w-53 center-child  rounded-xl !mb-[1rem] group-hover:scale-115 transition-all duration-300 ease-in-out`}
      >
        {React.createElement(iconMap[icon], {
          size: 22,
          stroke: colors.colour,
        })}
      </div>

      {/* TItle */}
      <h3 className="text-sm text-[var(--color-text-link)] font-[600] !mb-[4px]">
        {title}
      </h3>

      {/* count */}
      {count && <CountUp end={count} styles="text-extra-large font-bold" />}

      {value && <h3 className="text-medium font-bold">{value}</h3>}

      {/* subtext */}
      <p className="text-[var(--color-text-passive)] secondary-heading">
        {subText}
      </p>
    </div>
  );
}
