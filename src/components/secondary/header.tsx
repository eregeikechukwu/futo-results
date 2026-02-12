"use client";

import React, { RefAttributes } from "react";

export function Header({
  heading,
  subHeading,
  button,
  icon,
  onClick,
  extraButton,
}: {
  heading: string;
  subHeading: string;
  button?: string;
  icon?: string;
  onClick?: () => void;
  extraButton?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-large block font-bold">{heading}</h2>
        <p className="mt-4 text-[var(--color-text-link)]">{subHeading}</p>
      </div>
     <div className="flex gap-12">
       {button && icon && (
        <button onClick={onClick} className="gap-8 button-primary">
          {React.createElement(require("../../utils/iconMap").iconMap[icon], {
            size: 17,
          } as RefAttributes<SVGElement>)}{" "}
          {button}
        </button>
      )}

      {/* Extra button */}
      {extraButton}
     </div>
    </div>
  );
}

//  {/* Dynamically render icon based on string name */}
//               {/* @ts-ignore */}
//               {React.createElement(
//                 require("../../utils/iconMap").iconMap[link.icon],
//                 { size: 17 } as RefAttributes<SVGSVGElement>
//               )}
