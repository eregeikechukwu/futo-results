import { useState, useCallback } from "react";
import { ParsedResult } from "@/app/types/resultsUpload";
import { createSupabaseClient } from "../supabase/client";
import { Progress } from "@/app/types/advisor";

// Shape the progress bar component expects


type Status = "uploading" | "processing" | "complete" | "error" | null;

export function useOcrUpload(
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [result, setResult] = useState<ParsedResult[] | null>(null);

  // batchId is no longer sent anywhere (the function doesn't store anything).
  // Kept in the signature so existing callers don't break.
  const uploadImage = useCallback(
    async ( file: File) => {
      const supabase = createSupabaseClient();

      // Reset everything from any previous upload
      setLoading(true);
      setError(null);
      setResult(null);
      setStatus("uploading");
      setProgress({ percent: 20, phase: "uploading", message: "Uploading image..." });

      // The function does upload + OCR in ONE request and we can't see inside it,
      // so we fake a slowly-moving bar (capped at 95%) until it responds.
      let percent = 20;
      const fakeProgress = setInterval(() => {
        percent = Math.floor(Math.min(percent + Math.random() * 10, 95));
        setStatus("processing");
        setProgress({ percent, phase: "processing", message: "Processing image..." });
      }, 1000);

      try {
        // Pack the image into form data - the field name "image" must match the function
        const form = new FormData();
        form.append("image", file);


        const { data, error: fnError } = await supabase.functions.invoke("ocr-worker", {
          body: form,
        });

        if (fnError) {
          // The function puts its real error message in the response body
          const body = await fnError.context?.json?.().catch(() => null);
          throw new Error(body?.error ?? fnError.message ?? "Unknown error during upload.");
        }


        console.log(data, 'data from ocr-worker', data.data, 'data.data from ocr-worker');

        // The function returns { headers, data: [...rows], metadata, ... }
        // so the rows are in data.data
        setResult(prev => [...(prev || []), ...(data.data  as ParsedResult[])]);
        setStatus("complete");
        setProgress({ percent: 100, phase: "done", message: "OCR processing complete!" });
        return data.data as ParsedResult[];
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error during upload.";
        setError(message);
        setStatus("error");
        setProgress({ percent: 0, phase: "error", message });
        throw err; // lets the caller catch it too (remove if your callers don't use try/catch)
      } finally {
        // Runs on success AND failure, so the timer never leaks
        clearInterval(fakeProgress);
        setLoading(false);
      }
    },
    [setProgress],
  );

  return { uploadImage, status, loading, error, result };
}


/*

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
  */