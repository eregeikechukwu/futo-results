export interface OcrJob {
  id: string;
  batch_id: string;
  image_url: string;
  status: string;
  error_message: string | null;
  created_at: string;
  parsed_result: string | null;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
}
