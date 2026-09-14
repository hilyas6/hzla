export function resizeImageToJpegDataUrl(
  file: File,
  size = 256,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported."));
        return;
      }

      // Center-crop to a square before scaling, so non-square photos aren't squashed.
      const cropSize = Math.min(img.width, img.height);
      const sx = (img.width - cropSize) / 2;
      const sy = (img.height - cropSize) / 2;
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image."));
    };
    img.src = objectUrl;
  });
}
