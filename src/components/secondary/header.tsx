"use client";

import React, { RefAttributes } from "react";

export function Header({
  heading,
  subHeading,
  button,
  icon,
  toggleModal,
}: {
  heading: string;
  subHeading: string;
  button?: string;
  icon?: string;
  toggleModal?: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-large block font-bold">{heading}</h2>
        <p className="mt-4 text-[var(--color-text-link)]">{subHeading}</p>
      </div>
      {button && icon && (
        <button onClick={toggleModal} className="gap-8 button-primary">
          {React.createElement(require("../../utils/iconMap").iconMap[icon], {
            size: 17,
          } as RefAttributes<SVGElement>)}{" "}
          {button}
        </button>
      )}
    </div>
  );
}

//  {/* Dynamically render icon based on string name */}
//               {/* @ts-ignore */}
//               {React.createElement(
//                 require("../../utils/iconMap").iconMap[link.icon],
//                 { size: 17 } as RefAttributes<SVGSVGElement>
//               )}
