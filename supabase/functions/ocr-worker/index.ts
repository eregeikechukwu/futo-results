import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseSpatialTable } from './parser.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function callVisionApi(imageBase64: string): Promise<any> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY secret is not set');

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Vision API HTTP ${res.status}: ${await res.text()}`);

  const annotation = (await res.json()).responses?.[0];
  if (annotation?.error) throw new Error(`Vision API error: ${annotation.error.message}`);
  if (!annotation?.fullTextAnnotation?.text) {
    throw new Error('Vision returned no text - image may be too blurry or blank');
  }
  return annotation;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Only signed-in users may call this (the anon key alone is not enough)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
  );
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Not signed in' }, 401);

  try {
    const form = await req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return json({ error: 'No image uploaded' }, 400);
    if (file.size > 8 * 1024 * 1024) return json({ error: 'Image too large (max 8MB)' }, 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const vision = await callVisionApi(uint8ToBase64(bytes));
    return json(await parseSpatialTable(vision));
  } catch (err: any) {
    console.error('[ocr] failed:', err.message);
    return json({ error: err.message }, 500);
  }
});