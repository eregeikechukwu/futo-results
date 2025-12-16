import { Loader, Loader2 } from "lucide-react";

export function LoaderSpinner1() {
  return (
    <span className="center-absolutely">
      <Loader size={30} color="white" className="rotate" />
    </span>
  );
}

export function LoaderSpinner2() {
  return (
    <span className="center-absolutely">
      <Loader2 size={30} color="white" className="rotate" />
    </span>
  );
}
