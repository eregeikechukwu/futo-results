import sharp from "sharp";

export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  console.log(`[preprocess] ${meta.width}x${meta.height} ${meta.format}`);

  let pipeline = sharp(buffer);
  if ((meta.width ?? 0) > 2400) pipeline = pipeline.resize({ width: 2400 });

  return pipeline.grayscale().normalize().sharpen().png().toBuffer();
}
