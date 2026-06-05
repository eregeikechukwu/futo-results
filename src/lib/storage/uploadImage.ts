import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — never expose to browser
);

async function storeImage(fileBuffer: Buffer, filename: string) {
  const path = `jobs/${Date.now()}-${filename}`;
  const { error } = await supabase.storage
    .from("ocr-images")
    .upload(path, fileBuffer, { contentType: "image/jpeg", upsert: false });

  if (error) throw error;

  // Return the signed URL (valid 1 hour — worker uses this to fetch the image)
  const { data } = await supabase.storage
    .from("ocr-images")
    .createSignedUrl(path, 3600);

  return { path, signedUrl: data!.signedUrl };
}
