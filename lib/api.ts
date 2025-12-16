// Types for better type safety

import { OcrJob, UploadResponse } from "@/app/types/advisor";

// Upload image and automatically poll until completion
export async function uploadImageForOCR(
  file: File,
  onProgress?: (progress: {
    phase: string;
    percent: number;
    message: string;
  }) => void
): Promise<OcrJob> {
  // Step 1: Submit the image
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:3030/api/ocr", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  const data: UploadResponse = await res.json();
  const jobId = data.jobs[0].jobId;

  // Step 2: Poll until job is complete
  return pollUntilComplete(jobId, onProgress);
}

// Poll a specific job until it's done or failed
export async function pollUntilComplete(
  jobId: string,
  onProgress?: (progress: {
    phase: string;
    percent: number;
    message: string;
  }) => void
): Promise<OcrJob> {
  const POLL_INTERVAL = 500; // Poll every 500ms
  const MAX_ATTEMPTS = 240; // 2 minutes max (240 * 500ms)
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    const job = await pollJobStatus(jobId);

    // Update progress callback if provided
    if (onProgress && job.progress) {
      onProgress({
        phase: job.progress.phase,
        percent: job.progress.percent,
        message: job.progress.message,
      });
    }

    // Job completed successfully
    if (job.status === "done") {
      return job;
    }

    // Job failed
    if (job.status === "failed") {
      throw new Error(job.error || "OCR processing failed");
    }

    // Still processing, wait and try again
    await sleep(POLL_INTERVAL);
    attempts++;
  }

  throw new Error("Polling timeout: Job took too long to complete");
}

// Get current status of a job (single poll)
export async function pollJobStatus(jobId: string): Promise<OcrJob> {
  const res = await fetch(`http://localhost:3030/api/ocr/${jobId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Job not found");
    }
    throw new Error("Polling failed");
  }

  return res.json();
}

// Cancel a queued job
export async function cancelJob(jobId: string): Promise<void> {
  const res = await fetch(`http://localhost:3030/api/ocr/${jobId}/cancel`, {
    method: "POST",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Cancel failed" }));
    throw new Error(error.error || "Failed to cancel job");
  }
}

// List all recent jobs
export async function listJobs(): Promise<{ jobs: Partial<OcrJob>[] }> {
  const res = await fetch("http://localhost:3030/api/ocr");

  if (!res.ok) {
    throw new Error("Failed to list jobs");
  }

  return res.json();
}

// Helper sleep function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
