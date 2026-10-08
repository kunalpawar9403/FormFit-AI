// FormFit AI — Real Client-Side Image Processing & Compression Engine
// Uses HTML5 Canvas2D, binary search quality optimization, and real Blob size validation.

/**
 * Loads an image file or URL into an HTMLImageElement
 * @param {File|Blob|string} source
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image file. It may be corrupted or unsupported.'));

    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof Blob) {
      const url = URL.createObjectURL(source);
      img.src = url;
      // Cleanup created URL after loading
      const cleanup = () => {
        URL.revokeObjectURL(url);
        img.removeEventListener('load', cleanup);
        img.removeEventListener('error', cleanup);
      };
      img.addEventListener('load', cleanup);
      img.addEventListener('error', cleanup);
    } else {
      reject(new Error('Invalid image source provided.'));
    }
  });
}

/**
 * Normalizes format input to MIME type and extension
 * @param {string} format
 * @returns {{mimeType: string, extension: string, formatLabel: string}}
 */
export function normalizeFormat(format = 'JPG') {
  const upper = String(format || '').toUpperCase();
  if (upper === 'PNG' || upper === 'IMAGE/PNG') {
    return { mimeType: 'image/png', extension: 'png', formatLabel: 'PNG' };
  }
  if (upper === 'WEBP' || upper === 'IMAGE/WEBP') {
    return { mimeType: 'image/webp', extension: 'webp', formatLabel: 'WEBP' };
  }
  return { mimeType: 'image/jpeg', extension: 'jpg', formatLabel: 'JPG' };
}

/**
 * Validates file format and dimensions against specifications
 */
export function validateSpecs({ file, width, height, maxKb, minKb = 0, format = 'JPG' }) {
  const issues = [];
  const checks = [];

  const actualKb = file ? file.size / 1024 : 0;
  const { formatLabel } = normalizeFormat(format);

  // Format check
  const mime = (file?.type || '').toLowerCase();
  const isJpg = mime === 'image/jpeg' || mime === 'image/jpg';
  const isPng = mime === 'image/png';
  const isWebp = mime === 'image/webp';

  if (formatLabel === 'JPG' && !isJpg) {
    issues.push(`Format is ${mime || 'unknown'}, expected JPEG/JPG.`);
  } else if (formatLabel === 'PNG' && !isPng) {
    issues.push(`Format is ${mime || 'unknown'}, expected PNG.`);
  } else if (formatLabel === 'WEBP' && !isWebp) {
    issues.push(`Format is ${mime || 'unknown'}, expected WEBP.`);
  } else {
    checks.push(`Format valid (${formatLabel})`);
  }

  // File size check
  if (actualKb > maxKb) {
    issues.push(`File size ${actualKb.toFixed(1)} KB exceeds maximum limit of ${maxKb} KB.`);
  } else if (minKb > 0 && actualKb < minKb) {
    issues.push(`File size ${actualKb.toFixed(1)} KB is below minimum limit of ${minKb} KB.`);
  } else {
    checks.push(`File size valid (${actualKb.toFixed(1)} KB ≤ ${maxKb} KB)`);
  }

  // Dimension check
  if (width && height) {
    checks.push(`Target dimensions: ${width} × ${height} px`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    checks,
  };
}

/**
 * Generates a lightweight persistent thumbnail DataURL from a canvas
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {number} [maxDim=96]
 * @returns {string}
 */
export function createThumbnailDataUrl(sourceCanvas, maxDim = 96) {
  try {
    const thumbCanvas = document.createElement('canvas');
    const scale = Math.min(maxDim / sourceCanvas.width, maxDim / sourceCanvas.height, 1);
    thumbCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
    thumbCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));
    const ctx = thumbCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      return thumbCanvas.toDataURL('image/jpeg', 0.7);
    }
  } catch (e) {}
  return '';
}

/**
 * Crops, resizes, rotates and compresses an image to target specifications.
 * Employs a robust search strategy to find the highest-quality encoding that meets maxKb.
 * NEVER silently claims target was achieved when it was not.
 *
 * @param {Object} options
 * @param {File|Blob|string} options.source - Image file or URL
 * @param {number} options.targetWidth - Target pixel width
 * @param {number} options.targetHeight - Target pixel height
 * @param {number} options.maxKb - Max file size in kilobytes
 * @param {number} [options.minKb=0] - Min file size in kilobytes
 * @param {number} [options.rotation=0] - Rotation angle in degrees (0, 90, 180, 270)
 * @param {string} [options.format='JPG'] - Target format ('JPG', 'PNG', 'WEBP' or MIME)
 * @param {Object} [options.cropBox] - Optional normalized crop area {x, y, width, height} (0 to 1)
 * @returns {Promise<{blob: Blob, url: string, thumbnailDataUrl: string, width: number, height: number, sizeKb: number, quality: number, format: string, mimeType: string, extension: string, meetsTarget: boolean, message: string}>}
 */
export async function processAndCompressImage(sourceOrOptions, maybeOptions = {}) {
  let source, targetWidth, targetHeight, maxKb, minKb, rotation, format, cropBox;

  if (
    sourceOrOptions &&
    (sourceOrOptions instanceof Blob ||
      sourceOrOptions instanceof File ||
      typeof sourceOrOptions === 'string' ||
      maybeOptions.targetWidth !== undefined ||
      maybeOptions.width !== undefined)
  ) {
    source = sourceOrOptions;
    ({
      targetWidth,
      width: targetWidth = targetWidth,
      targetHeight,
      height: targetHeight = targetHeight,
      maxKb,
      minKb = 0,
      rotation = 0,
      format = 'JPG',
      cropBox = null,
    } = maybeOptions);
  } else if (sourceOrOptions && typeof sourceOrOptions === 'object') {
    ({
      source,
      targetWidth,
      width: targetWidth = targetWidth,
      targetHeight,
      height: targetHeight = targetHeight,
      maxKb,
      minKb = 0,
      rotation = 0,
      format = 'JPG',
      cropBox = null,
    } = sourceOrOptions);
  }

  const numWidth = parseInt(targetWidth, 10);
  const numHeight = parseInt(targetHeight, 10);
  const numMaxKb = parseFloat(maxKb);
  const numMinKb = parseFloat(minKb) || 0;

  if (!numWidth || numWidth <= 0 || !numHeight || numHeight <= 0) {
    throw new Error('Target width and height must be positive numbers.');
  }
  if (!numMaxKb || numMaxKb <= 0) {
    throw new Error('Maximum file size (maxKb) must be greater than 0.');
  }

  targetWidth = numWidth;
  targetHeight = numHeight;
  maxKb = numMaxKb;
  minKb = numMinKb;

  const { mimeType, extension, formatLabel } = normalizeFormat(format);
  const img = await loadImage(source);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: mimeType !== 'image/jpeg' });

  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable on this device.');
  }

  // Smooth rendering setup
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White background for JPEG if transparency was present
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.save();

  // Center transformation
  ctx.translate(targetWidth / 2, targetHeight / 2);
  if (rotation) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Compute source cropping coordinates
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;

  let sx = 0, sy = 0, sWidth = sw, sHeight = sh;
  if (cropBox) {
    sx = cropBox.x * sw;
    sy = cropBox.y * sh;
    sWidth = cropBox.width * sw;
    sHeight = cropBox.height * sh;
  }

  const isRotatedQuarter = (Math.abs(rotation) % 180) === 90;
  const drawW = isRotatedQuarter ? targetHeight : targetWidth;
  const drawH = isRotatedQuarter ? targetWidth : targetHeight;

  ctx.drawImage(img, sx, sy, sWidth, sHeight, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  const thumbnailDataUrl = createThumbnailDataUrl(canvas);

  // ---------------------------------------------------------
  // Handle Lossless PNG Format
  // ---------------------------------------------------------
  if (mimeType === 'image/png') {
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('Failed to generate PNG blob from canvas.');

    const sizeKb = parseFloat((blob.size / 1024).toFixed(1));
    const meetsTarget = sizeKb <= maxKb && (minKb === 0 || sizeKb >= minKb);

    let message = '';
    if (meetsTarget) {
      message = `PNG rendered successfully (${sizeKb} KB ≤ ${maxKb} KB limit).`;
    } else {
      message = `PNG is a lossless format and at ${targetWidth}×${targetHeight} px produced ${sizeKb} KB (target: ≤ ${maxKb} KB). For smaller file size, select JPG format.`;
    }

    return {
      blob,
      url: URL.createObjectURL(blob),
      thumbnailDataUrl,
      width: targetWidth,
      height: targetHeight,
      sizeKb,
      quality: 1.0,
      format: 'PNG',
      mimeType: 'image/png',
      extension: 'png',
      meetsTarget,
      message,
    };
  }

  // ---------------------------------------------------------
  // Progressive Binary Search for JPEG / WebP quality
  // Tracks highest-quality blob satisfying maxKb AND smallest blob
  // ---------------------------------------------------------
  let low = 0.05;
  let high = 0.98;

  let bestFitBlob = null;
  let bestFitQuality = null;

  let smallestBlob = null;
  let smallestQuality = null;
  let smallestSizeKb = Infinity;

  const MAX_SEARCH_STEPS = 10;

  for (let step = 0; step < MAX_SEARCH_STEPS; step++) {
    const mid = (low + high) / 2;
    const currentBlob = await new Promise((res) => canvas.toBlob(res, mimeType, mid));
    if (!currentBlob) break;

    const currentKb = currentBlob.size / 1024;

    // Track the absolute smallest blob produced across all steps
    if (currentKb < smallestSizeKb) {
      smallestSizeKb = currentKb;
      smallestBlob = currentBlob;
      smallestQuality = mid;
    }

    if (currentKb <= maxKb) {
      // Satisfies target upper bound!
      bestFitBlob = currentBlob;
      bestFitQuality = mid;

      // Try higher quality to maximize visual sharpness
      low = mid;

      // Stop early if within 6% of target limit
      if (currentKb >= maxKb * 0.94) {
        break;
      }
    } else {
      // Exceeds target, decrease quality
      high = mid;
    }
  }

  let finalBlob = null;
  let finalQuality = null;
  let meetsTarget = false;
  let message = '';

  if (bestFitBlob) {
    finalBlob = bestFitBlob;
    finalQuality = bestFitQuality;
    const finalKb = parseFloat((finalBlob.size / 1024).toFixed(1));
    meetsTarget = minKb === 0 || finalKb >= minKb;
    message = meetsTarget
      ? `Optimized to ${finalKb} KB at quality ${(finalQuality * 100).toFixed(0)}% (meets ≤ ${maxKb} KB limit).`
      : `File size is ${finalKb} KB (below minimum ${minKb} KB).`;
  } else {
    // Target could not be achieved even at lowest tested quality
    finalBlob = smallestBlob;
    finalQuality = smallestQuality;
    meetsTarget = false;
    const smallestKb = parseFloat(((smallestBlob?.size || 0) / 1024).toFixed(1));
    message = `Target size ≤ ${maxKb} KB could not be achieved. Lowest achievable size for ${targetWidth}×${targetHeight} px is ${smallestKb} KB. Consider reducing dimensions or increasing limit.`;
  }

  if (!finalBlob) {
    throw new Error('Failed to encode image blob.');
  }

  const finalKb = parseFloat((finalBlob.size / 1024).toFixed(1));

  return {
    blob: finalBlob,
    url: URL.createObjectURL(finalBlob),
    thumbnailDataUrl,
    width: targetWidth,
    height: targetHeight,
    sizeKb: finalKb,
    quality: parseFloat((finalQuality || 0.8).toFixed(2)),
    format: formatLabel,
    mimeType,
    extension,
    meetsTarget,
    message,
  };
}
