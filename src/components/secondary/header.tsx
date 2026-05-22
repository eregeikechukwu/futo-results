"use client";

import React, { RefAttributes } from "react";
import styles from "./header.module.scss";

type HeaderProps = {
  heading: string;
  subHeading: string;
  button?: string;
  icon?: string;
  onClick?: () => void;
  buttonLoading?: boolean;
  extraButton?: React.ReactNode;
};

export function Header({
  heading,
  subHeading,
  button,
  icon,
  onClick,
  buttonLoading,
  extraButton,
}: HeaderProps) {
  return (
    <div className={styles.root}>
      <div>
        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.subtitle}>{subHeading}</p>
      </div>
      <div className={styles.actions}>
        {button && icon && (
          <button
            onClick={onClick}
            disabled={buttonLoading}
            className={`button-primary ${styles.actionButton} ${buttonLoading && "opacity-30"}`}
          >
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
