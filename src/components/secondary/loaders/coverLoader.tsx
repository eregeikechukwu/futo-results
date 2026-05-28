import { LoaderSpinner3 } from "./loaders";

export function CoverLoader() {
  return (
    <div className="center-child fade-in absolute inset-0 bg-[#ffffffd7]">
      <LoaderSpinner3 size={60} color="#cbcbcbd0" />
    </div>
  );
}
