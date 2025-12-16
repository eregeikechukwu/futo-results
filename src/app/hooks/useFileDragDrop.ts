import { excelUploadFormats } from "@/utils/systemUtils";
import { RefObject } from "react";

export function useFileDragDrop(
  setDragging: React.Dispatch<React.SetStateAction<boolean>>,
  onFileSelected: (file: File) => void,
  setError: React.Dispatch<React.SetStateAction<boolean | null>>,
  mode: string,
  fileRef: RefObject<File | null>
) {
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function checkFileType(file: File) {
    const fileType = file.type;
    let isAllowed = false;

    if (mode === "Excel") {
      isAllowed = excelUploadFormats.includes(
        file.name.slice(file.name.lastIndexOf("."))
      );
    }

    if (mode === "OCR") {
      isAllowed = fileType.includes("image/") || fileType === "application/pdf";
    }

    setError(!isAllowed);
    return isAllowed;
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && checkFileType(file)) {
      fileRef.current = file;
      onFileSelected(file);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && checkFileType(file)) {
      onFileSelected(file);
      //reset the input file
      e.target.value = "";
      fileRef.current = file;
    }
  }
  return { handleDragLeave, handleDragOver, handleDrop, handleFileInput };
}
