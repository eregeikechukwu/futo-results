import React, { Dispatch } from "react";
import styles from "./styles.module.scss";
import { Error } from "./common";

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
    <div className={`${styles.deleteConfirmContent} field relative`}>
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
        <Error>{`${value === "result" ? "Reg number" : "Course code"} doesn't match`}</Error>
      )}
    </div>
  );
}

export default React.memo(ConfirmInput);
