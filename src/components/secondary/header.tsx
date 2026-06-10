"use client";

import React from "react";
import styles from "./header.module.scss";
import { LoaderSpinner3 } from "./loaders/loaders";
import { iconMap } from "@/utils/iconMap";

type HeaderProps = {
  heading: string;
  subHeading: string;
  button?: string;
  icon?: string;
  onClick?: () => void;
  buttonLoading?: boolean;
  extraComponent?: React.ReactNode;
};

export function Header({
  heading,
  subHeading,
  button,
  icon,
  onClick,
  buttonLoading,
  extraComponent,
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
            className={`button-primary ${styles.actionButton} ${buttonLoading && "opacity-30 pointer-events-none"}`}
          >
            {React.createElement(iconMap[icon], {
              size: 17,
            })}{" "}
            {button}
            {buttonLoading && <LoaderSpinner3 size={15} />}
          </button>
        )}

        {/* Extra button */}
        {extraComponent}
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
