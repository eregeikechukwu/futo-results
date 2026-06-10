import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  createResultBatch,
  deleteBatch,
} from "../queries/advisorResultsDownload";
import toast from "react-hot-toast";
import { ParsedResult } from "@/app/types/resultsUpload";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 20;

interface Progress {
  percent: number;
  phase: string;
  message: string;
}

export function useOcrUpload(
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
) {
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Silent cleanup — never throws, never shows toast
  const deleteOrphanedBatch = useCallback(async (batchId: string) => {
    try {
      await deleteBatch(batchId);
    } catch (err) {
      console.error("Failed to clean up orphaned batch:", err);
    }
  }, []);

  const createBatch = useCallback(
    async (courseOffering: string, advisorProfileId: string) => {
      const data = await createResultBatch(
        courseOffering,
        advisorProfileId,
        "ocr",
      );
      if (!data?.id) throw new Error("No batch ID returned from server.");
      return data.id;
    },
    [],
  );

  const uploadImage = useCallback(async (batchId: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("batch_id", batchId);

    const res = await fetch("/api/ocr/upload", { method: "POST", body: fd });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    const { jobId, error: uploadErr } = await res.json();
    if (uploadErr) throw new Error(uploadErr);
    if (!jobId) throw new Error("No job ID returned from upload.");

    return jobId as string;
  }, []);

  const upload = useCallback(
    async (file: File, courseOffering: string, advisorProfileId: string) => {
      // Guard first — before touching any state
      if (!file) return;

      setLoading(true);
      setError(null);
      setResult(null);
      setStatus("batching");
      setProgress({
        percent: 10,
        phase: "batching",
        message: "Creating batch...",
      });

      const toastId = toast.loading("Starting OCR upload...");

      try {
        // ── Step 1: Create batch ──
        const batchId = await createBatch(courseOffering, advisorProfileId);

        // ── Step 2: Upload image ──
        setProgress({
          percent: 20,
          phase: "uploading",
          message: "Uploading image...",
        });
        toast.loading("Uploading image...", { id: toastId });

        let jobId: string;
        try {
          jobId = await uploadImage(batchId, file);
        } catch (uploadErr: unknown) {
          await deleteOrphanedBatch(batchId);
          throw uploadErr; // re-throw to outer catch
        }

        // ── Step 3: Poll for result ──
        setStatus("pending");
        setProgress({
          percent: 40,
          phase: "processing",
          message: "AI processing...",
        });
        toast.loading("AI processing your file...", { id: toastId });

        let polls = 0;

        intervalRef.current = setInterval(async () => {
          polls++;

          // Timeout
          if (polls > MAX_POLLS) {
            clearInterval(intervalRef.current!);
            await deleteOrphanedBatch(batchId);
            const msg = "Timed out waiting for OCR result.";
            setError(msg);
            setLoading(false);
            toast.error(msg, { id: toastId });
            throw new Error(msg);
          }

          try {
            const r = await fetch(`/api/ocr/jobs/${jobId}`);
            const data = await r.json();
            setStatus(data.status);
            if (data) alert("We got something");

            // Smooth progress increment
            const pollProgress = Math.min(40 + (polls / MAX_POLLS) * 45, 85);
            setProgress({
              percent: pollProgress,
              phase: "processing",
              message: `AI processing... (${polls * (POLL_INTERVAL / 1000)}s)`,
            });
            toast.loading(
              `AI processing... (${polls * (POLL_INTERVAL / 1000)}s)`,
              { id: toastId },
            );

            if (data.status === "done") {
              clearInterval(intervalRef.current!);
              setResult(data.result);
              setProgress({
                percent: 100,
                phase: "done",
                message: "Processing complete!",
              });
              setLoading(false);
              toast.success("OCR complete! Review your results.", {
                id: toastId,
              });
            } else if (data.status === "failed") {
              clearInterval(intervalRef.current!);
              await deleteOrphanedBatch(batchId);
              const msg = data.error || "OCR processing failed.";
              setError(msg);
              setLoading(false);
              toast.error(msg, { id: toastId });
            }
          } catch (pollErr: unknown) {
            if (pollErr instanceof Error) {
              // Network error during polling — don't stop, try again next tick
              console.warn("Poll request failed, retrying...", pollErr.message);
            }
          }
        }, POLL_INTERVAL);
      } catch (err: unknown) {
        let msg = "An unexpected error occurred.";
        if (err instanceof Error) {
          msg = err?.message;
        }
        setError(msg);
        setLoading(false);
        toast.error(msg, { id: toastId });
      }
    },
    [setProgress, createBatch, uploadImage, deleteOrphanedBatch],
  );

  return { upload, status, result, error, loading };
}
