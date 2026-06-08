import React, { Dispatch } from "react";
import styles from "./styles.module.scss";

function ConfirmInput({
  value,
  deleteConfirmValue,
  deleteConfirmInput,
  setDeleteConfirmInput,
}: {
  value: string;
  deleteConfirmInput: string;
  deleteConfirmValue: string;
  setDeleteConfirmInput: Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className={`${styles.deleteConfirmContent} field`}>
      <p>
        To confirm deletion of <strong>{deleteConfirmValue}</strong>&apos;s{" "}
        {value === "result"
          ? "result entry"
          : value === "student"
            ? "student record"
            : "course offering"}
        , please type the{" "}
        {value === "result" || value === "student"
          ? "registration number"
          : "course code"}{" "}
        below:
      </p>
      <input
        type="text"
        value={deleteConfirmInput}
        onChange={(e) => setDeleteConfirmInput(e.target.value)}
        placeholder={`Enter ${value === "result" ? "reg number" : "course code"}`}
        className={styles.confirmInput}
      />
      {deleteConfirmInput && deleteConfirmInput !== deleteConfirmValue && (
        <p
          className={styles.errorText}
        >{`${value === "result" ? "Reg number" : "Course code"} doesn&apos;t match`}</p>
      )}
    </div>
  );
}

export default React.memo(ConfirmInput);
