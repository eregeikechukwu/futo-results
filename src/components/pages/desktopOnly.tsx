import { Laptop2 } from "lucide-react";
import styles from "../utilities.module.scss";

export function DesktopOnly() {
  return (
    <div className={styles.desktopOnly}>
      <Laptop2 size={64} className="text-gray-500 mb-4 animate-bounce" />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Desktop Only
      </h1>
      <p className="text-gray-600">
        This dashboard is designed for desktop screens.
      </p>
    </div>
  );
}
