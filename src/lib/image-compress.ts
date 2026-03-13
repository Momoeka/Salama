const MAX_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Compress an image file to be under 2MB.
 * Uses canvas to progressively reduce quality and dimensions.
 * Videos are returned as-is (with a size warning logged).
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-images
  if (!file.type.startsWith("image/")) {
    if (file.size > 10 * 1024 * 1024) {
      console.warn("Video file is over 10MB:", (file.size / 1024 / 1024).toFixed(1) + "MB");
    }
    return file;
  }

  // Already under limit
  if (file.size <= MAX_SIZE) return file;

  const img = await loadImage(file);
  const qualities = [0.8, 0.6, 0.4, 0.3];
  const scaleFactors = [1, 0.75, 0.5, 0.35];

  for (const scale of scaleFactors) {
    for (const quality of qualities) {
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const blob = await canvasToBlob(img, w, h, quality);
      if (blob.size <= MAX_SIZE) {
        return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
          type: "image/jpeg",
        });
      }
    }
  }

  // Last resort: very small
  const blob = await canvasToBlob(
    img,
    Math.round(img.naturalWidth * 0.25),
    Math.round(img.naturalHeight * 0.25),
    0.3
  );
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("No canvas context"));
      return;
    }
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to blob failed"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}
