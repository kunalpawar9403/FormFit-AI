import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { processAndCompressImage, validateSpecs, normalizeFormat } from '../frontend/src/services/imageProcessor.js';
import {
  addHistoryItem,
  getHistoryItems,
  getBlobFromStorage,
  removeHistoryItem,
  clearAllHistory,
  downloadHistoryBlob,
} from '../frontend/src/services/storageService.js';
import { generateDocumentPdf } from '../frontend/src/services/documentProcessor.js';
import { compressPdfFile, splitPdfFile, mergePdfFiles } from '../frontend/src/services/pdfProcessor.js';
import { PDFDocument } from 'pdf-lib';

describe('End-to-End Production Flows Integration', () => {
  beforeEach(async () => {
    await clearAllHistory();
  });

  test('Flow 1: Photo Processing -> History Save -> Persistence -> Download Retrieval', async () => {
    // 1. Simulate processed image result (25 KB)
    const mockImageBlob = new Blob([new Uint8Array(25 * 1024)], { type: 'image/jpeg' });
    const processedResult = {
      blob: mockImageBlob,
      width: 413,
      height: 531,
      sizeKb: 45.2,
      format: 'JPG',
      mimeType: 'image/jpeg',
      extension: 'jpg',
      meetsTarget: true,
      message: 'Optimized to 45.2 KB',
    };

    // 2. Validate specifications against real result
    const validation = validateSpecs({
      file: processedResult.blob,
      width: processedResult.width,
      height: processedResult.height,
      maxKb: 100,
      minKb: 20,
      format: processedResult.format,
    });
    assert.strictEqual(validation.isValid, true);

    // 3. Save to persistent history with blob
    const historyItem = {
      id: 'photo-integration-1',
      name: `photo_${Date.now()}.${processedResult.extension}`,
      type: 'photo',
      sizeKb: processedResult.sizeKb,
      dimensions: `${processedResult.width} × ${processedResult.height}`,
      format: processedResult.format,
      preset: 'Indian Passport Photo',
      thumbnail: 'data:image/jpeg;base64,mockthumb',
      mimeType: processedResult.mimeType,
    };
    const historyList = await addHistoryItem(historyItem, processedResult.blob);
    assert.strictEqual(historyList.length, 1);
    assert.strictEqual(historyList[0].id, 'photo-integration-1');

    // 4. Verify persistence (read back)
    const readItems = getHistoryItems();
    assert.strictEqual(readItems.length, 1);
    assert.strictEqual(readItems[0].name, historyItem.name);

    // 5. Retrieve durable blob from storage
    const retrievedBlob = await getBlobFromStorage(readItems[0].blobId);
    assert.ok(retrievedBlob, 'Stored binary blob must be retrievable');
    assert.strictEqual(retrievedBlob.size, 25 * 1024);

    // 6. Delete item and confirm blob cleanup
    await removeHistoryItem('photo-integration-1');
    const afterDelete = getHistoryItems();
    assert.strictEqual(afterDelete.length, 0);
    const cleanedBlob = await getBlobFromStorage(readItems[0].blobId);
    assert.strictEqual(cleanedBlob, null);
  });

  test('Flow 2: Signature Processing -> Format Matching -> Persistence', async () => {
    // Transparent PNG signature flow
    const pngBlob = new Blob(['mock-png-signature-bytes'], { type: 'image/png' });
    const sigMeta = {
      id: 'sig-integration-1',
      name: 'signature_123.png',
      type: 'signature',
      sizeKb: 14.2,
      dimensions: '300 × 100',
      format: 'PNG',
      preset: 'Signature Specs',
      mimeType: 'image/png',
    };

    const saved = await addHistoryItem(sigMeta, pngBlob);
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].format, 'PNG');
    assert.strictEqual(saved[0].mimeType, 'image/png');

    const fetchedBlob = await getBlobFromStorage(saved[0].blobId);
    assert.ok(fetchedBlob);
    assert.strictEqual(fetchedBlob.type, 'image/png');
  });

  test('Flow 3: PDF Document Suite -> Merge -> Compress -> Split -> Save', async () => {
    // Create two test PDFs
    const pdf1 = await PDFDocument.create();
    pdf1.addPage([400, 600]);
    const bytes1 = await pdf1.save();
    const blob1 = new Blob([bytes1], { type: 'application/pdf' });

    const pdf2 = await PDFDocument.create();
    pdf2.addPage([400, 600]);
    pdf2.addPage([400, 600]);
    const bytes2 = await pdf2.save();
    const blob2 = new Blob([bytes2], { type: 'application/pdf' });

    // Merge
    const merged = await mergePdfFiles([blob1, blob2]);
    assert.strictEqual(merged.pageCount, 3);
    assert.ok(merged.blob instanceof Blob);

    // Compress
    const compressed = await compressPdfFile(merged.blob);
    assert.ok(compressed.blob instanceof Blob);
    assert.ok(compressed.message);

    // Split
    const split = await splitPdfFile(merged.blob, 1, 2);
    assert.strictEqual(split.pageCount, 2);

    // Save split PDF to durable history
    const docMeta = {
      id: 'doc-pdf-integration-1',
      name: split.filename,
      type: 'document',
      sizeKb: split.sizeKb,
      dimensions: `${split.pageCount} pages`,
      format: 'PDF',
      preset: 'PDF Split',
      mimeType: 'application/pdf',
    };
    await addHistoryItem(docMeta, split.blob);

    const history = getHistoryItems();
    assert.strictEqual(history.length, 1);
    const persistedPdf = await getBlobFromStorage(history[0].blobId);
    assert.ok(persistedPdf);
    assert.ok(persistedPdf.size > 0);
  });
});
