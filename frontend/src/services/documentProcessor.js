// FormFit AI — Real Document Scanning & PDF Compilation Service
import { jsPDF } from 'jspdf';
import { loadImage } from './imageProcessor.js';

/**
 * Applies brightness, contrast, grayscale and sharpen to a document page
 * @param {HTMLImageElement|string} source
 * @param {Object} filters
 * @returns {Promise<string>} Data URL of the filtered page
 */
export async function renderFilteredPage(source, filters) {
  const img = await loadImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return typeof source === 'string' ? source : '';

  // Apply filters via CSS filter string
  const { brightness = 100, contrast = 100, grayscale = false } = filters;
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Generates an actual multi-page PDF from user's pages
 * @param {Array<{id: string, src: string, name?: string, filters?: Object}>} pages
 * @param {string} [title='FormFit AI Document']
 * @returns {Promise<{blob: Blob, url: string, filename: string}>}
 */
export async function generateDocumentPdf(pages, title = 'FormFit AI Scanned Document') {
  if (!pages || pages.length === 0) {
    throw new Error('No document pages provided.');
  }

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const page = pages[i];
    const processedSrc = page.filters
      ? await renderFilteredPage(page.src, page.filters)
      : page.src;

    const img = await loadImage(processedSrc);
    const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);

    let renderW = maxWidth;
    let renderH = renderW / imgRatio;

    if (renderH > maxHeight) {
      renderH = maxHeight;
      renderW = renderH * imgRatio;
    }

    const posX = margin + (maxWidth - renderW) / 2;
    const posY = margin + (maxHeight - renderH) / 2;

    pdf.addImage(processedSrc, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
  }

  const blob = pdf.output('blob');
  const filename = `FormFit_Document_${Date.now()}.pdf`;

  // Generate lightweight thumbnail from first page
  let thumbnailDataUrl = '';
  try {
    const firstSrc = pages[0]?.filters ? await renderFilteredPage(pages[0].src, pages[0].filters) : pages[0]?.src;
    if (firstSrc) {
      const firstImg = await loadImage(firstSrc);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 72;
      thumbCanvas.height = 96;
      const ctx = thumbCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(firstImg, 0, 0, 72, 96);
        thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.65);
      }
    }
  } catch (e) {}

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename,
    pagesCount: pages.length,
    sizeKb: parseFloat((blob.size / 1024).toFixed(1)),
    thumbnailDataUrl,
  };
}
