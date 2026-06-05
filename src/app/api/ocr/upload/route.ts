import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const batchId = formData.get("batch_id") as string;

  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024)
    return NextResponse.json(
      { error: "File size too large (max 8MB)" },
      { status: 400 },
    );

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `jobs/${crypto.randomUUID()}-${file.name}`;

  //   1. upload image to supabase storage
  const { data, error: uploadError } = await supabase.storage
    .from("ocr-images")
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  //   2. Create job record
  const { data: jobData, error: dbError } = await supabase
    .from("ocr_jobs")
    .insert({ image_url: storagePath, batch_id: batchId, status: "pending" })
    .select("id")
    .single();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ jobId: jobData.id });
}
