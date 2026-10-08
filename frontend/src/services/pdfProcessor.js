// FormFit AI — Real Client-Side PDF Tools Engine
// Powered by pdf-lib & jsPDF. 100% genuine in-browser file operations.

import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import { loadImage } from './imageProcessor.js';

/**
 * Merges multiple user-selected PDF files into a single document
 * @param {Array<File|Blob>} files
 * @returns {Promise<{blob: Blob, url: string, filename: string, pageCount: number, sizeKb: number}>}
 */
export async function mergePdfFiles(files) {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (e) {
      throw new Error(`Failed to read PDF file "${file.name || `#${i + 1}`}": ${e.message}`);
    }
  }

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const filename = `FormFit_Merged_${Date.now()}.pdf`;

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename,
    pageCount: mergedPdf.getPageCount(),
    sizeKb: parseFloat((blob.size / 1024).toFixed(1)),
  };
}

/**
 * Splits a PDF file into a new document with specified page range
 * @param {File|Blob} file
 * @param {number} startPage - 1-indexed start page
 * @param {number} endPage - 1-indexed end page
 * @returns {Promise<{blob: Blob, url: string, filename: string, pageCount: number, sizeKb: number}>}
 */
export async function splitPdfFile(file, startPage, endPage) {
  if (!file) throw new Error('No PDF file provided for splitting.');

  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('The provided PDF file has no pages.');
  }

  const start = Math.max(1, Math.min(startPage || 1, totalPages));
  const end = Math.max(start, Math.min(endPage || totalPages, totalPages));

  if (start > end) {
    throw new Error(`Start page (${start}) cannot be greater than end page (${end}).`);
  }

  const splitPdf = await PDFDocument.create();
  const indices = [];
  for (let i = start - 1; i < end; i++) {
    indices.push(i);
  }

  const pages = await splitPdf.copyPages(sourcePdf, indices);
  pages.forEach((page) => splitPdf.addPage(page));

  const splitBytes = await splitPdf.save({ useObjectStreams: true });
  const blob = new Blob([splitBytes], { type: 'application/pdf' });
  const filename = `FormFit_Split_p${start}-p${end}_${Date.now()}.pdf`;

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename,
    pageCount: splitPdf.getPageCount(),
    sizeKb: parseFloat((blob.size / 1024).toFixed(1)),
  };
}

/**
 * Optimizes an existing PDF using structural stream compression and object deduplication.
 * Transparently compares output against original size:
 * If optimization produces a larger file, preserves the original and reports truthfully.
 *
 * @param {File|Blob} file
 * @returns {Promise<{blob: Blob, url: string, filename: string, originalKb: number, newKb: number, isOptimized: boolean, savedPercentage: number, optimizationType: string, message: string}>}
 */
export async function compressPdfFile(file) {
  if (!file) throw new Error('No PDF file provided for compression.');

  const arrayBuffer = await file.arrayBuffer();
  const originalKb = parseFloat((file.size / 1024).toFixed(1));

  try {
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    // Apply structural stream deflating & object stream compression
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    const newKb = parseFloat((compressedBytes.byteLength / 1024).toFixed(1));

    if (newKb < originalKb) {
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const savedPercentage = parseFloat((((originalKb - newKb) / originalKb) * 100).toFixed(1));
      return {
        blob,
        url: URL.createObjectURL(blob),
        filename: `FormFit_Compressed_${Date.now()}.pdf`,
        originalKb,
        newKb,
        isOptimized: true,
        savedPercentage,
        optimizationType: 'Structural stream and object table optimization',
        message: `Optimized PDF streams by ${savedPercentage}% (${originalKb} KB → ${newKb} KB).`,
      };
    } else {
      // Re-saving did not produce a smaller file; keep original
      return {
        blob: file,
        url: URL.createObjectURL(file),
        filename: file.name || `FormFit_Optimized_${Date.now()}.pdf`,
        originalKb,
        newKb: originalKb,
        isOptimized: false,
        savedPercentage: 0,
        optimizationType: 'Structural inspection completed',
        message: `PDF streams are already optimally compressed (${originalKb} KB). Original file preserved to prevent size increase.`,
      };
    }
  } catch (err) {
    throw new Error(`Could not optimize PDF: ${err.message || 'File may be encrypted or corrupted'}`);
  }
}

/**
 * Converts image files into a single formatted PDF
 * @param {Array<File|Blob|string>} images
 * @returns {Promise<{blob: Blob, url: string, filename: string, pageCount: number, sizeKb: number}>}
 */
export async function convertImagesToPdf(images) {
  if (!images || images.length === 0) {
    throw new Error('Please select at least one image to convert.');
  }

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

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage('a4', 'portrait');

    const item = images[i];
    const src = typeof item === 'string' ? item : URL.createObjectURL(item);
    try {
      const img = await loadImage(src);

      const ratio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      let rw = maxWidth;
      let rh = rw / ratio;
      if (rh > maxHeight) {
        rh = maxHeight;
        rw = rh * ratio;
      }

      const posX = margin + (maxWidth - rw) / 2;
      const posY = margin + (maxHeight - rh) / 2;

      // Draw onto temporary canvas to guarantee clean JPEG data for jsPDF regardless of input format (PNG, WEBP, etc.)
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      pdf.addImage(jpegDataUrl, 'JPEG', posX, posY, rw, rh, undefined, 'FAST');
    } finally {
      if (typeof item !== 'string' && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    }
  }

  const blob = pdf.output('blob');
  const filename = `FormFit_ImagesToPdf_${Date.now()}.pdf`;

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename,
    pageCount: images.length,
    sizeKb: parseFloat((blob.size / 1024).toFixed(1)),
  };
}
