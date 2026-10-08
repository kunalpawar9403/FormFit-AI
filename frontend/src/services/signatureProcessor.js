// FormFit AI — Real Signature Processing & Ink Extraction Engine
// Cleans paper backgrounds, boosts pen ink contrast, and outputs transparent PNG or pure white JPG.

import { loadImage, normalizeFormat, createThumbnailDataUrl } from './imageProcessor.js';

/**
 * Removes paper shadows/yellow cast and isolates ink lines
 * @param {HTMLCanvasElement} canvas
 * @param {number} threshold - Luminance threshold (0 to 255)
 * @param {boolean} transparentBg - True for alpha transparency, false for pure white
 */
export function removePaperBackground(canvas, threshold = 215, transparentBg = true) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Perceived luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > threshold) {
      // Paper background
      if (transparentBg) {
        data[i + 3] = 0; // Alpha 0
      } else {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    } else {
      // Dark ink: boost ink contrast
      const inkFactor = Math.max(0, (threshold - lum) / threshold);
      const enhancedAlpha = Math.min(255, Math.floor(data[i + 3] * (0.8 + 0.4 * inkFactor)));

      // Keep ink color (blue/black) but deepen it slightly
      data[i] = Math.max(0, Math.floor(r * 0.7));
      data[i + 1] = Math.max(0, Math.floor(g * 0.7));
      data[i + 2] = Math.max(0, Math.floor(b * 0.7));
      data[i + 3] = enhancedAlpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Processes an uploaded or drawn signature
 */
export async function processSignature({
  source,
  targetWidth = 300,
  targetHeight = 100,
  maxKb = 50,
  removeBg = true,
  format = 'PNG',
}) {
  const { mimeType, extension, formatLabel } = normalizeFormat(format);
  const img = await loadImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: mimeType === 'image/png' });

  if (!ctx) throw new Error('Could not initialize canvas context');

  // Background initialization
  if (mimeType === 'image/jpeg' || !removeBg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw scaled and centered with aspect preservation
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(targetWidth / sw, targetHeight / sh) * 0.9;
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (targetWidth - dw) / 2;
  const dy = (targetHeight - dh) / 2;

  ctx.drawImage(img, dx, dy, dw, dh);

  if (removeBg) {
    removePaperBackground(canvas, 215, mimeType === 'image/png');
  }

  const blob = await new Promise((res) => canvas.toBlob(res, mimeType, 0.92));
  if (!blob) throw new Error('Failed to generate signature blob');

  const sizeKb = parseFloat((blob.size / 1024).toFixed(1));
  const thumbnailDataUrl = createThumbnailDataUrl(canvas);

  return {
    blob,
    url: URL.createObjectURL(blob),
    thumbnailDataUrl,
    width: targetWidth,
    height: targetHeight,
    sizeKb,
    format: formatLabel,
    mimeType,
    extension,
    meetsTarget: sizeKb <= maxKb,
  };
}
