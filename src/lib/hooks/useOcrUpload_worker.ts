import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  createResultBatch,
  deleteBatch,
} from "../queries/advisorResultsDownload";
import toast from "react-hot-toast";
import { ParsedResult } from "@/app/types/resultsUpload";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// How often we ask the server "is the job done yet?"
const POLL_INTERVAL = 2000; // ms

// Maximum number of poll attempts before we give up.
// 60 polls × 2000ms = 2 minutes total wait time.
const MAX_POLLS = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Progress {
  percent: number;
  phase: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
//
// Orchestrates the full OCR upload lifecycle:
//   1. Create a batch record in Supabase  (createResultBatch)
//   2. POST the image to the Next.js upload route  (/api/ocr/upload)
//   3. Poll /api/ocr/jobs/:id until the Edge Function marks the job done
//   4. Return the parsed rows so the component can render an editable table
//
// If any step fails, the orphaned Supabase batch is deleted silently so the
// advisor's batch list does not fill up with ghost records.
// ─────────────────────────────────────────────────────────────────────────────

export function useOcrUpload(
  // Caller passes their own setProgress so the progress bar in the modal
  // updates in real time without this hook needing to own that UI state.
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
) {
  // ── State ──────────────────────────────────────────────────────────────────

  // Mirrors the job status string returned by the server:
  // null → idle, "uploading" → image on the way up,
  // "pending" → queued in ocr_jobs, "processing" → worker claimed it,
  // "done" → rows ready, "failed" → unrecoverable error
  const [status, setStatus]   = useState<string | null>(null);

  // The final parsed rows from parseSpatialTable — populated on "done".
  // The component maps this directly into the editable results table.
  const [result, setResult]   = useState<ParsedResult[] | null>(null);

  // Human-readable error message shown in the modal on failure.
  const [error,  setError]    = useState<string | null>(null);

  // Controls the loading spinner / disabled states in the UI.
  const [loading, setLoading] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────

  // Guards all setState calls inside the async polling loop.
  // If the advisor navigates away while a poll is in flight, React will warn
  // about state updates on unmounted components — this ref prevents that.
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      // Mark as unmounted when the component that owns this hook tears down.
      mountedRef.current = false;
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────────────────

  // Silent cleanup — never throws, never shows a toast.
  // Called whenever an upload or poll step fails so the half-created Supabase
  // batch does not remain as a ghost record in the advisor's history.
  const deleteOrphanedBatch = useCallback(async (batchId: string) => {
    try {
      await deleteBatch(batchId);
    } catch (err) {
      // Log but swallow — the advisor doesn't need to know about this,
      // and we don't want a cleanup failure to mask the original error.
      console.error("Failed to clean up orphaned batch:", err);
    }
  }, []);

  // Creates a Supabase batch record before the image is uploaded so that
  // the ocr_jobs row can reference it via batch_id (FK in the DB schema).
  const createBatch = useCallback(
    async (courseOffering: string, advisorProfileId: string) => {
      const data = await createResultBatch(courseOffering, advisorProfileId, "ocr");

      // If the DB insert succeeded but returned no ID, something is wrong
      // with the RLS policy or the batch table schema — surface it clearly.
      if (!data?.id) throw new Error("No batch ID returned from server.");

      return data.id as string;
    },
    [],
  );

  // POSTs the image file to our Next.js route, which:
  //   - validates the file
  //   - uploads it to Supabase Storage (ocr-images bucket)
  //   - inserts a row into ocr_jobs with status = "pending"
  //   - returns { jobId }
  const uploadImage = useCallback(async (batchId: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    // batch_id is stored on the job row so results can be linked back
    // to the correct batch in the advisor's history.
    fd.append("batch_id", batchId);

    const res = await fetch("/api/ocr/upload", { method: "POST", body: fd });

    // Non-2xx means the route handler itself failed (file too large, storage
    // error, DB error, etc.) — the response body has the detail.
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

    const { jobId, error: uploadErr } = await res.json();

    // The route can return HTTP 200 but still carry an error payload
    // (e.g. Supabase returned an error after the file was already stored).
    if (uploadErr) throw new Error(uploadErr);
    if (!jobId)    throw new Error("No job ID returned from upload.");

    return jobId as string;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Main upload function — called by the component's onFileSelected handler
  // ─────────────────────────────────────────────────────────────────────────

  const upload = useCallback(
    async (file: File, courseOffering: string, advisorProfileId: string) => {
      // Guard first — before touching any state — so we never enter a broken
      // loading state if the caller forgot to check for a file.
      if (!file) return;

      // Reset all state from any previous run before starting a new one.
      setLoading(true);
      setError(null);
      setResult(null);
      setStatus("uploading");
      setProgress({ percent: 10, phase: "uploading", message: "Creating batch..." });

      // Single persistent toast that updates in place through each phase
      // rather than firing a new toast per step.
      const toastId = toast.loading("Starting OCR upload...");

      // Declared outside the try block so the catch block can always reach it
      // for cleanup, even if the batch was created before the error occurred.
      let batchId: string | null = null;

      try {

        // ── Step 1: Create a Supabase batch record ──────────────────────────
        // This must happen before the image upload so the job row has a
        // valid batch_id FK to reference.
        batchId = await createBatch(courseOffering, advisorProfileId);

        // ── Step 2: Upload the image to Supabase Storage via Next.js route ──
        setProgress({ percent: 20, phase: "uploading", message: "Uploading image..." });
        toast.loading("Uploading image...", { id: toastId });

        let jobId: string;
        try {
          jobId = await uploadImage(batchId, file);
        } catch (uploadErr) {
          // Image upload failed — the batch record exists in Supabase but has
          // no associated job, so clean it up before surfacing the error.
          await deleteOrphanedBatch(batchId);
          throw uploadErr; // re-throw so the outer catch shows the error
        }

        // ── Step 3: Poll the job status endpoint until done or failed ────────
        //
        // The Supabase Cron job triggers the Edge Function every 30 seconds.
        // The Edge Function claims the job, calls Google Vision, runs the
        // spatial parser, and writes parsed_result back to ocr_jobs.
        // We poll /api/ocr/jobs/:id to detect when that write lands.
        //
        // FIX: Using a while loop instead of setInterval so that errors thrown
        // inside the loop propagate to the outer try/catch correctly.
        // setInterval swallows thrown errors — they go nowhere.
        setStatus("pending");
        setProgress({ percent: 40, phase: "processing", message: "AI processing..." });
        toast.loading("AI processing your file...", { id: toastId });

        let polls = 0;

        while (polls < MAX_POLLS) {
          // Wait before polling — the job won't be done instantly.
          await new Promise(r => setTimeout(r, POLL_INTERVAL));
          polls++;

          // If the advisor navigated away during a long poll, bail out
          // without updating any state to avoid the React warning.
          if (!mountedRef.current) return;

          // Type the minimum shape we need from the poll response.
          let data: {
            status: string;
            // result is the full parseSpatialTable output:
            //   { headers, headerMapping, data: ParsedRow[], rawText, metadata }
            // We only need the data array, which maps to ParsedResult[].
            result?: { data: ParsedResult[] } | null;
            error?: string | null;
          };

          try {
            const r = await fetch(`/api/ocr/jobs/${jobId}`);
            data = await r.json();
          } catch {
            // Transient network blip during polling — don't fail the whole job,
            // just skip this tick and try again on the next interval.
            console.warn(`Poll ${polls} failed due to network error, retrying...`);
            continue;
          }

          // Keep the status state in sync with what the server reports
          // so the component can reflect the current phase accurately.
          setStatus(data.status);

          // Smooth progress animation based on how many polls have elapsed.
          // We occupy the 40–88% band during processing so there is always
          // visible movement, then jump to 100% on completion.
          const pollProgress = Math.min(40 + (polls / MAX_POLLS) * 50, 88);
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
            // FIX: data.result is the full parseSpatialTable output object —
            // { headers, headerMapping, data: ParsedRow[], rawText, metadata }.
            // The ParsedResult[] array lives at data.result.data, NOT at
            // data.result directly. Storing data.result would give the component
            // an object instead of an array, breaking the table render.
            const rows = (data.result?.data ?? []) as ParsedResult[];

            setResult(rows);
            setStatus("done");
            setProgress({ percent: 100, phase: "done", message: "Processing complete!" });
            toast.success("OCR complete! Review your results.", { id: toastId });
            return; // exit the while loop and the upload function cleanly
          }

          if (data.status === "failed") {
            // The Edge Function marked this job as permanently failed after
            // MAX_ATTEMPTS retries. Clean up the batch and surface the error.
            await deleteOrphanedBatch(batchId);
            throw new Error(data.error || "OCR processing failed.");
          }

          // Any other status ("pending", "processing") — keep polling.
        }

        // ── Timeout — exhausted MAX_POLLS without a terminal status ──────────
        // This usually means the Edge Function or Cron is not running.
        // Clean up and let the advisor know so they can try again.
        await deleteOrphanedBatch(batchId);
        throw new Error("Timed out waiting for OCR result.");

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";

        // Only update state if the component is still mounted —
        // the advisor may have closed the modal while we were polling.
        if (mountedRef.current) {
          setError(msg);
          setStatus("failed");
          setProgress({ percent: 0, phase: "failed", message: msg });
        }

        toast.error(msg, { id: toastId });

      } finally {
        // Always release the loading state so the UI is never permanently stuck
        // in a spinner — whether we succeeded, failed, or timed out.
        if (mountedRef.current) setLoading(false);
      }
    },
    [setProgress, createBatch, uploadImage, deleteOrphanedBatch],
  );

  return { upload, status, result, error, loading };
}