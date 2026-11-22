// Turns an uploaded image into a compact JPEG data: URL so it can be stored
// with the listing in localStorage (no file storage without a backend).
// Downscaling keeps each photo around 100-200 KB; localStorage holds ~5 MB in
// total, so PropertyForm also caps the number of uploads per listing.

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} isn't an image.`);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser can't process images.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
