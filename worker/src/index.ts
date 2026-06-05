import { createClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 2000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — never expose to browser
);

async function processJob(job: any) {
  try {
    // 1. DOwnload image from supabase storage
    const { data, error } = await supabase.storage
      .from("ocr-images")
      .download(job.image_url);
      if (error || !data) throw new Error('Image download failed: ' + error?.message);
      
      const buffer = Buffer.from(await data.arrayBuffer());

    //   Preprocess with sharp
  } catch {}
}
