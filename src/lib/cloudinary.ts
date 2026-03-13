import { v2 as cloudinary } from "cloudinary";

// Configure on first import
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Get a Cloudinary fetch URL that proxies and optimizes an external image.
 * This avoids re-uploading - Cloudinary fetches, optimizes, and caches the original.
 */
export function getOptimizedUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !originalUrl) return originalUrl;

  const transforms: string[] = ["f_auto", options.quality || "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.format) transforms.push(`f_${options.format}`);

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms.join(",")}/${encodeURIComponent(originalUrl)}`;
}

/**
 * Get responsive srcSet for an image URL via Cloudinary fetch.
 */
export function getResponsiveSrcSet(originalUrl: string): string {
  const widths = [320, 640, 768, 1024, 1280];
  return widths
    .map((w) => `${getOptimizedUrl(originalUrl, { width: w })} ${w}w`)
    .join(", ");
}

/**
 * Upload a buffer directly to Cloudinary (server-side only).
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; public_id?: string } = {}
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder || "salama",
          public_id: options.public_id,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve({ url: result.secure_url, public_id: result.public_id });
          }
        }
      )
      .end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
