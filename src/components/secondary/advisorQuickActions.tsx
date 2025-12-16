import { FileBarChart2Icon, Upload, UserPlus2 } from "lucide-react";
import styles from "./styles.module.scss";

export function AdvisorQuickActions() {
  const iconSize = 22;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-16">
      <div
        className={`bg-blue-50 hover:bg-[var(--color-blue-background)] ${styles.quickAction}`}
      >
        <div className=" bg-[var(--color-primary)]">
          <Upload size={iconSize} />
        </div>

        <h4>Upload Results</h4>
        <p>Excel or OCR scan</p>
      </div>

      <div
        className={`bg-green-50 hover:bg-[var(--color-green-background)] ${styles.quickAction}`}
      >
        <div className=" bg-[var(--color-green)]">
          <UserPlus2 size={iconSize} />
        </div>

        <h4>Manage Students</h4>
        <p>Add or verify students</p>
      </div>

      <div
        className={`bg-purple-50 hover:bg-[var(--color-purple-background)] ${styles.quickAction}`}
      >
        <div className=" bg-[var(--color-purple)]">
          <FileBarChart2Icon size={iconSize} />
        </div>

        <h4>Generate Reports</h4>
        <p>Download summaries</p>
      </div>
    </div>
  );
}
