import { Loader, Loader2 } from "lucide-react";

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

export function LoaderSpinner3() {
  return (
    <span className="center-child">
      <span className="w-[1.2rem] h-[1.2rem] border-solid border-[2px] rounded-full bg-transparent border-[rgba(255,255,255,0.3)] border-r-white   border-t-white rotate  inline-block" />
    </span>
  );
}
