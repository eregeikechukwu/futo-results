import { useState, useCallback } from "react";
import { createResultBatch } from "../queries/results";

const POLL_INTERVAL = 2000; // ms
const MAX_POLLS = 60; // 2 min timeout

export function useOcrUpload() {
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  let batchId: string | null = null;
  //   const [batchId, setBatchId] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, courseOffering: string, advisorProfileId: string) => {
      setLoading(true);
      setStatus("uploading");
      setError(null);
      setResult(null);

      // Before upload, lets create a batch record
      const { id: batchId, error: batchError } = await createResultBatch(
        courseOffering,
        advisorProfileId,
        "ocr",
      );

      if (batchError) {throw new Error("Failed to create result batch" + batchError?.message)
      };

      // 1. Upload
      const fd = new FormData();
      fd.append("image", file);
      fd.append("batch_id", batchId);

      const res = await fetch("/api/ocr/upload", { method: "POST", body: fd });
      const { jobId, error: uploadErr } = await res.json();
      if (uploadErr) {
        // delete the created batch
        
        setError(uploadErr);
        setLoading(false);
        return;
      }

      setStatus("pending");

      // 2. Poll
      let polls = 0;
      const interval = setInterval(async () => {
        polls++;
        if (polls > MAX_POLLS) {
          clearInterval(interval);
          setError("Timed out waiting for OCR result");
          setLoading(false);
          return;
        }

        const r = await fetch(`/api/ocr/jobs/${jobId}`);
        const data = await r.json();
        setStatus(data.status);

        if (data.status === "done") {
          clearInterval(interval);
          setResult(data.result);
          setLoading(false);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError(data.error || "OCR failed");
          setLoading(false);
        }
      }, POLL_INTERVAL);
    },
    [],
  );

  return { upload, status, result, error, loading };
}
