import { Loader, Loader2 } from "lucide-react";
import styles from "./loaders.module.scss";

export function LoaderSpinner1({ size = 30, color = "white" }) {
  return (
    <span className="center-absolutely">
      <Loader size={size} color={color} className="rotate" />
    </span>
  );
}

export function LoaderSpinner2({ size = 30 }) {
  return (
    <span className="center-absolutely">
      <Loader2 size={size} color="white" className="rotate" />
    </span>
  );
}

interface LoaderSpinner3Props {
  size?: number;
  color?: string;
  thickness?: number;
}

export function LoaderSpinner3({
  size = 20,
  color = "#ffffff",
  thickness = 2,
}: LoaderSpinner3Props) {
  return (
    <span className="center-child">
      <span
        className="rotate inline-block rounded-full bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderWidth: `${thickness}px`,
          borderStyle: "solid",

          // faded ring
          borderColor: `${color}33`,

          // highlighted spinning edges
          borderTopColor: color,
          borderRightColor: color,
        }}
      />
    </span>
  );
}

export function BigLoader() {
  return (
    <div className={styles.loader_container}>
      <div className={styles.loader}></div>
      <div className={styles.loader_text}>One moment...</div>
    </div>
  );
}

export function LoadingMessage({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div>
      <p className="loading">{message}</p>
    </div>
  );
}
