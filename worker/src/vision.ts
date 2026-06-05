import { ImageAnnotatorClient } from "@google-cloud/vision";

let client: ImageAnnotatorClient | null = null;

function getClient() {
  if (!client) {
    client = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return client;
}

export async function callVisionApi(imageBuffer: Buffer) {
  const [result] = await getClient().annotateImage({
    image: { content: imageBuffer.toString("base64") },
    features: [{ type: "DOCUMENT_TEXT_DETECTION" }, { type: "TEXT_DETECTION" }],
  });
  if (!result.fullTextAnnotation?.text) throw new Error("No text detected");
  return result;
}
