"use client";

import { useFileDragDrop } from "@/app/hooks/useFileDragDrop";
import { excelUploadFormats } from "@/utils/systemUtils";
import { BrainCircuit, FileSpreadsheet } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { InfoCard } from "../utilities";
import { uploadImageForOCR } from "../../lib/api";
import { Modal } from "../modals/overlay";
import { ProgressBar } from "../ocrProgress";
import { OcrJob } from "@/app/types/advisor";
import { useExcelParser } from "../../lib/excelToJson";
import { parse } from "path";
import { ExcelParseResult, ParsedResult } from "@/app/types/resultsUpload";
import toast from "react-hot-toast";

export function AdvisorUploadFileSelect(
  setParsedJson: React.Dispatch<React.SetStateAction<ParsedResult[]>>,
) {
  const [mode, setMode] = useState<"excel" | "ocr">("excel");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<unknown | null>(false);
  const [progress, setProgress] = useState({
    percent: 0,
    phase: "idle",
    message: "Ready to upload",
  });
  const fileRef = useRef<File | null>(null);

  //Excel Processing hook
  const { isLoading, error: excelError, parseFile } = useExcelParser();

  //MOdal to display progress
  const [modalState, setModalState] = useState(false);
  const toggleLoader = useCallback(() => {
    setModalState((prev) => {
      if (!errorMessage) {
        return prev === false ? true : prev;
      } else return !prev;
    });
  }, [errorMessage, progress]);

  const onClose = () => {
    setModalState(false);
    fileRef.current = null;
    setError(null);
    setErrorMessage(null);
  };

  const onFileSelected = useCallback(async (file: File) => {
    toggleLoader();
    fileRef.current = file;
    setErrorMessage(null);
    setProgress({
      percent: 0,
      phase: "idle",
      message: "Ready to upload",
    });

    try {
      // Only call ONCE with progress callback

      if (
        excelUploadFormats.includes(file.name.slice(file.name.lastIndexOf(".")))
      ) {
        // Excel action
        const results = await parseFile(file);

        if (!results.success) {
          toast.error("Excel parsing failed: " + results.error);
          setErrorMessage(excelError);
          throw new Error(results.error);
        }
        setProgress({
          ...progress,
          percent: 100,
          phase: "done",
          message: "Excel parsing completed",
        });

        setTimeout(() => {
          //Make sure not to change ths order

          setModalState(false);
          console.log(results, "New loadss rf");
          setParsedJson((results.data as unknown as ParsedResult[]) || []);
        }, 1000);
      } else {
        // OCR action

        const job = await uploadImageForOCR(file, (progressUpdate) => {
          setProgress(progressUpdate);
          // console.log("Progress update:", progressUpdate); // Debug log
        });

        if (job.status !== "done") {
          console.error("Job did not complete:", job.status, job.error);
          return;
        }

        console.log("OCR Job completed successfully:", job);

        setTimeout(() => {
          //Make sure not to change ths order
          console.log(
            "Final results bbbbbbbbbbbooooooooooooooooooobbbbbbbbbbbbbbb:",
            errorMessage,
          );
          setModalState(false);
          setParsedJson(
            (job?.result?.parsedJson as ParsedResult[]) ||
              (job?.result?.parsedJson as ParsedResult[]),
          );
        }, 1000);
      }
    } catch (error) {
      toast.error(
        "Upload failed: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setErrorMessage(error);
      fileRef.current = null;
    } finally {
      // toggleLoader();
      fileRef.current = null;
    }
  }, []);

  const { handleDragLeave, handleDragOver, handleDrop, handleFileInput } =
    useFileDragDrop(setDragging, onFileSelected, setError, mode, fileRef);

  const modes = [
    {
      id: 1,
      name: "Excel",
      title: "Upload via Excel (Recommended)",
      fileType: ".xlsx, .xls, .csv",
      acceptedFormats: excelUploadFormats.join(","),
      title2: "Upload Excel Result sheet",
      instruction: "Drag and drop your Excel file here, or click to browse",
      colors: {
        borderActive: "border-blue-400",
        borderHover: "hover:border-blue-400",
        bg: "bg-blue-100",
        btnColor:
          "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
        iconColor: "text-[var(--color-primary)]",
      },
    },
    {
      id: 2,
      name: "OCR",
      title: "Upload via Scan (OCR Beta)",
      fileType: "PDF, JPEG, PNG",
      acceptedFormats: "image/*",
      title2: "Upload Scanned Result sheet",
      instruction: "AI will extract data from your scanned document",
      colors: {
        borderActive: "border-purple-400",
        borderHover: "hover:border-purple-400",
        bg: "bg-purple-100",
        btnColor: "bg-purple-600 hover:bg-purple-700",
        iconColor: "text-purple-600",
      },
    },
  ];
  const activeMode = modes.find((m) => m.name.toLowerCase() === mode);

  const buttonCommonClasses =
    "cursor-pointer basis-1/2 rounded-[8px] lh-24 py-14 px-16 font-medium transition-colors center-child gap-8 ";

  //toggle modal

  const FileSelectComponent = useMemo(
    function FileSelectComponent() {

      return (
        <>
          <div className="dashboard-container">
            {/* switch between OCR and Excel upload */}
            <div className="flex p-4 rounded-small bg-[var(--color-background-mild)]">
              {modes.map((m) => (
                <button
                  key={m.name}
                  className={`${buttonCommonClasses} ${
                    mode === m.name.toLowerCase()
                      ? "bg-white shadow-sm text-[var(--color-primary)]"
                      : "text-[var(--color-text-link)] hover:text-[var(--color-gray-800)]"
                  }`}
                  onClick={() =>
                    setMode(m.name.toLowerCase() as "excel" | "ocr")
                  }
                >
                  <span>
                    {m.name === "Excel" ? (
                      <FileSpreadsheet size={20} />
                    ) : (
                      <BrainCircuit size={20} />
                    )}
                  </span>
                  {m.title}
                </button>
              ))}
            </div>

            {/*File upload Dropzone */}
            <div
              className={`${!error && activeMode?.colors.borderHover} ${
                dragging && activeMode?.colors.borderActive
              } ${
                error ? "border-red-500" : ""
              } mt-28 p-48 border-dashed border-2 border-[#d1d5db] rounded-small center-child cursor-pointer transition-colors`}
            >
              <input
                type="file"
                className="hidden"
                id="fileInput"
                accept={activeMode?.acceptedFormats}
                onChange={handleFileInput}
              />
              <div
                className="flex flex-col items-center"
                onClick={() => document.getElementById("fileInput")?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={`rounded-medium center-child mb-16  p-16 h-64 w-64 ${
                    activeMode?.colors.bg
                  } ${activeMode?.colors.iconColor} ${
                    dragging && "animate-bounce"
                  }`}
                >
                  {mode === "excel" ? (
                    <FileSpreadsheet size={25} />
                  ) : (
                    <BrainCircuit size={25} />
                  )}
                </div>
                <h3 className="text-medium mb-8">{activeMode?.title2}</h3>
                <p className=" mb-24 text-[var(--color-text-link)]">
                  {dragging ? "Drop your file here" : activeMode?.instruction}
                </p>
                <button
                  className={`${activeMode?.colors.btnColor}  mb-16 cursor-pointer text-white rounded-small transition-all py-12 px-24`}
                >
                  Choose File
                </button>
                <p
                  className={`${
                    error ? "text-red-500" : "text-[var(--color-text-passive)]"
                  } text-14 mb-24`}
                >
                  {error
                    ? `Invalid file type. Please upload ${
                        mode === "excel"
                          ? "an Excel file (.xlsx, .xls, .csv)"
                          : "a PDF or image file (JPEG, PNG)."
                      }`
                    : ` Supported formats: ${activeMode?.fileType}`}
                </p>

                {/* OCR tips */}
                {mode === "ocr" && (
                  <InfoCard
                    type="info"
                    heading="OCR Tips for Best Results"
                    variant="medium"
                  >
                    <ul className="list-disc pl-20">
                      <li className="mb-8">
                        Use clear, high-resolution cameras
                      </li>
                      <li className="mb-8">
                        Ensure text is clearly visible and not blurry
                      </li>
                      <li className="mb-8">Avoid shadows or poor lighting</li>
                      <li className="mb-8">
                        Focus your camera on just the table, and capture long
                        sheets in batches for improved OCR precision.
                      </li>
                    </ul>
                  </InfoCard>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Display progress as MOdal --------- */}
          {progress.percent > 0 && (
            <Modal
              toggleModal={onClose}
              withTemplate={false}
              stall={!errorMessage}
              state={modalState}
            >
              <ProgressBar
                mode={mode}
                file={fileRef}
                retry={onFileSelected}
                errorMessage={errorMessage}
                progress={progress}
              />
            </Modal>
          )}
        </>
      );
    },

    [mode, error, dragging, progress, toggleLoader, errorMessage, modalState],
  );

  return { FileSelectComponent, mode };
}
