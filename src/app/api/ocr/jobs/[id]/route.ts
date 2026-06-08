import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  alert("We got to the data first");
  const { data, error } = await supabase
    .from("ocr_jobs")
    .select("id, status, parsed_result, error_message")
    .eq("id", id)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  alert("We got to the data");

  return NextResponse.json({
    status: data.status,
    ...(data.status === "done" && { result: data.parsed_result }),
    ...(data.status === "failed" && { error: data.error_message }),
  });
}
