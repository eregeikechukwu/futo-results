import { createClient } from "@supabase/supabase-js";
import { preprocessImage } from "./preprocess";
import { callVisionApi } from "./vision";
import { parseSpatialTable } from "./parser";
import { claimNextJob } from "./db";
import { OcrJob } from "./types";

const MAX_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 2000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — never expose to browser
);

async function processJob(job: OcrJob) {
  try {
    alert("We got here");
    // 1. DOwnload image from supabase storage
    const { data, error } = await supabase.storage
      .from("ocr-images")
      .download(job.image_url);
    if (error || !data)
      throw new Error("Image download failed: " + error?.message);

    const buffer = Buffer.from(await data.arrayBuffer());

    // 2.  Preprocess with sharp
    const processed = await preprocessImage(buffer);

    // 3. Send to Google vision
    const visionResult = await callVisionApi(processed);

    // 4. spatial parse
    const parsed = await parseSpatialTable(visionResult);

    // 5. save Result
    await supabase
      .from("ocr_jobs")
      .update({
        status: "done",
        parsed_result: parsed,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(
      `[worker] Job ${job.id} done — ${parsed.data.length} rows parsed`,
    );
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (err: any) {
    console.error(`[worker] Job ${job.id} failed: ${err.message}`);

    const isFinal = job.attempts >= MAX_ATTEMPTS;
    await supabase
      .from("ocr_jobs")
      .update({
        status: isFinal ? "failed" : "pending",
        error_message: err.message,
        ...(isFinal && { completed_at: new Date().toISOString() }),
      })
      .eq("id", job.id);
  }
}

async function loop() {
  console.log("[worker] STarting processing loop...");
  while (true) {
    const job = await claimNextJob().catch(() => null);
    if (job) {
      await processJob(job);
    } else {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
}

// Call RPC at worker startup to restart te procesing of stuck jobs
await supabase.rpc("reset_stuck_ocr_jobs");

loop();
