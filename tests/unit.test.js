import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { validateSpecs, normalizeFormat, processAndCompressImage } from '../frontend/src/services/imageProcessor.js';
import {
  getSavedPresets,
  saveCustomPreset,
  deleteCustomPreset,
  getHistoryItems,
  addHistoryItem,
  removeHistoryItem,
  clearAllHistory,
  getBlobFromStorage,
  saveBlobToStorage,
} from '../frontend/src/services/storageService.js';
import { compressPdfFile, splitPdfFile, mergePdfFiles } from '../frontend/src/services/pdfProcessor.js';
import { OFFICIAL_PRESETS } from '../frontend/src/constants/presetsData.js';
import { translations } from '../frontend/src/constants/translations.js';
import { PDFDocument } from 'pdf-lib';

describe('Specification Validation Engine', () => {
  test('validates correct JPEG file within size limit', () => {
    const mockFile = { size: 45 * 1024, type: 'image/jpeg' };
    const result = validateSpecs({
      file: mockFile,
      width: 200,
      height: 230,
      maxKb: 50,
      format: 'JPG',
    });
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.issues.length, 0);
  });

  test('flags file exceeding size limit', () => {
    const mockFile = { size: 65 * 1024, type: 'image/jpeg' };
    const result = validateSpecs({
      file: mockFile,
      width: 200,
      height: 230,
      maxKb: 50,
      format: 'JPG',
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.issues.some((i) => i.includes('exceeds maximum limit')));
  });

  test('flags format mismatch when PNG provided instead of JPG', () => {
    const mockFile = { size: 30 * 1024, type: 'image/png' };
    const result = validateSpecs({
      file: mockFile,
      width: 200,
      height: 230,
      maxKb: 50,
      format: 'JPG',
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.issues.some((i) => i.includes('expected JPEG/JPG')));
  });

  test('flags file falling below minimum size limit', () => {
    const mockFile = { size: 10 * 1024, type: 'image/jpeg' };
    const result = validateSpecs({
      file: mockFile,
      width: 200,
      height: 230,
      maxKb: 50,
      minKb: 20,
      format: 'JPG',
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.issues.some((i) => i.includes('below minimum limit')));
  });

  test('processAndCompressImage validates positive width and height for both argument formats', async () => {
    await assert.rejects(
      async () => {
        await processAndCompressImage('mock-source', { targetWidth: 0, targetHeight: 500, maxKb: 100 });
      },
      { message: 'Target width and height must be positive numbers.' }
    );

    await assert.rejects(
      async () => {
        await processAndCompressImage({ source: 'mock-source', targetWidth: null, targetHeight: 500, maxKb: 100 });
      },
      { message: 'Target width and height must be positive numbers.' }
    );

    await assert.rejects(
      async () => {
        await processAndCompressImage('mock-source', { targetWidth: 300, targetHeight: 300, maxKb: 0 });
      },
      { message: 'Maximum file size (maxKb) must be greater than 0.' }
    );
  });
});

describe('Format Normalization Engine', () => {
  test('normalizes JPG / JPEG aliases correctly', () => {
    const r1 = normalizeFormat('JPG');
    assert.strictEqual(r1.mimeType, 'image/jpeg');
    assert.strictEqual(r1.extension, 'jpg');
    assert.strictEqual(r1.formatLabel, 'JPG');

    const r2 = normalizeFormat('image/jpeg');
    assert.strictEqual(r2.mimeType, 'image/jpeg');
    assert.strictEqual(r2.extension, 'jpg');
  });

  test('normalizes PNG aliases correctly', () => {
    const r = normalizeFormat('PNG');
    assert.strictEqual(r.mimeType, 'image/png');
    assert.strictEqual(r.extension, 'png');
    assert.strictEqual(r.formatLabel, 'PNG');
  });

  test('normalizes WEBP aliases correctly', () => {
    const r = normalizeFormat('WEBP');
    assert.strictEqual(r.mimeType, 'image/webp');
    assert.strictEqual(r.extension, 'webp');
    assert.strictEqual(r.formatLabel, 'WEBP');
  });
});

describe('Official Presets Catalog Verification', () => {
  test('all official presets have required fields and valid dimensions', () => {
    assert.ok(OFFICIAL_PRESETS.length >= 8);
    for (const p of OFFICIAL_PRESETS) {
      assert.ok(p.id, 'Preset must have id');
      assert.ok(p.name, 'Preset must have name');
      assert.ok(p.targetWidth > 0, 'Preset must have positive width');
      assert.ok(p.targetHeight > 0, 'Preset must have positive height');
      assert.ok(p.maxKb > 0, 'Preset must have positive maxKb');
      assert.ok(p.category, 'Preset must have category');
      assert.ok(p.source, 'Preset must have source attribution');
    }
  });

  test('Indian Passport photo specification is present and accurate', () => {
    const passport = OFFICIAL_PRESETS.find((p) => p.id === 'passport-in');
    assert.ok(passport);
    assert.strictEqual(passport.targetWidth, 413);
    assert.strictEqual(passport.targetHeight, 531);
    assert.strictEqual(passport.maxKb, 100);
  });

  test('US Visa DS-160 specification is present and accurate', () => {
    const visa = OFFICIAL_PRESETS.find((p) => p.id === 'us-visa');
    assert.ok(visa);
    assert.strictEqual(visa.targetWidth, 600);
    assert.strictEqual(visa.targetHeight, 600);
    assert.strictEqual(visa.maxKb, 240);
  });
});

describe('Multilingual i18n Dictionary Integrity', () => {
  test('all supported languages have complete key coverage', () => {
    const requiredKeys = [
      'brandName',
      'navTools',
      'navPresets',
      'navHelp',
      'photoToolName',
      'sigToolName',
      'docToolName',
      'pdfToolName',
      'home',
      'history',
      'settings',
      'download',
    ];

    for (const lang of ['en', 'hi', 'mr']) {
      assert.ok(translations[lang], `Language ${lang} must exist`);
      for (const key of requiredKeys) {
        assert.ok(translations[lang][key], `Key ${key} must exist in ${lang}`);
      }
    }
  });
});

describe('Storage & History Persistence Engine', () => {
  beforeEach(async () => {
    await clearAllHistory();
  });

  test('history is empty by default (no fake sample documents)', () => {
    const items = getHistoryItems();
    assert.strictEqual(items.length, 0, 'Fresh history must be empty');
  });

  test('saves and retrieves custom presets', () => {
    const testPreset = {
      id: 'custom-test-1',
      name: 'Custom Gate Exam',
      targetWidth: 240,
      targetHeight: 320,
      maxKb: 50,
    };
    saveCustomPreset(testPreset);
    const saved = getSavedPresets();
    assert.ok(saved.some((p) => p.id === 'custom-test-1'));

    deleteCustomPreset('custom-test-1');
    const remaining = getSavedPresets();
    assert.strictEqual(remaining.some((p) => p.id === 'custom-test-1'), false);
  });

  test('saves history record with binary Blob and retrieves it', async () => {
    const mockBlob = new Blob(['sample-image-data-test'], { type: 'image/jpeg' });
    const itemData = {
      id: 'test-item-1',
      blobId: 'blob-test-1',
      name: 'photo_test.jpg',
      type: 'photo',
      sizeKb: 25.5,
      dimensions: '200 × 230',
      format: 'JPG',
      preset: 'Test Preset',
    };

    const updatedList = await addHistoryItem(itemData, mockBlob);
    assert.strictEqual(updatedList.length, 1);
    assert.strictEqual(updatedList[0].name, 'photo_test.jpg');
    assert.strictEqual(updatedList[0].blobId, 'blob-test-1');

    // Retrieve Blob from storage
    const retrievedBlob = await getBlobFromStorage('blob-test-1');
    assert.ok(retrievedBlob, 'Retrieved blob must exist');
    const text = await retrievedBlob.text();
    assert.strictEqual(text, 'sample-image-data-test');

    // Remove history item
    const afterDelete = await removeHistoryItem('test-item-1');
    assert.strictEqual(afterDelete.length, 0);

    const deletedBlob = await getBlobFromStorage('blob-test-1');
    assert.strictEqual(deletedBlob, null, 'Deleted blob must no longer be in storage');
  });
});

describe('PDF Processing Engine', () => {
  test('compressPdfFile preserves original when size cannot be reduced', async () => {
    // Create a minimal 1-page PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 400]);
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const result = await compressPdfFile(pdfBlob);
    assert.ok(result.blob);
    assert.ok(result.originalKb > 0);
    assert.ok(typeof result.isOptimized === 'boolean');
    assert.ok(result.message);
  });

  test('splitPdfFile extracts specified page range correctly', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 400]);
    pdfDoc.addPage([600, 400]);
    pdfDoc.addPage([600, 400]);
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Split page 1 to 2
    const result = await splitPdfFile(pdfBlob, 1, 2);
    assert.strictEqual(result.pageCount, 2);
    assert.ok(result.blob);
    assert.ok(result.filename.includes('p1-p2'));
  });

  test('mergePdfFiles combines multiple PDFs into a single document', async () => {
    const doc1 = await PDFDocument.create();
    doc1.addPage([500, 500]);
    const bytes1 = await doc1.save();
    const blob1 = new Blob([bytes1], { type: 'application/pdf' });

    const doc2 = await PDFDocument.create();
    doc2.addPage([500, 500]);
    doc2.addPage([500, 500]);
    const bytes2 = await doc2.save();
    const blob2 = new Blob([bytes2], { type: 'application/pdf' });

    const merged = await mergePdfFiles([blob1, blob2]);
    assert.strictEqual(merged.pageCount, 3);
    assert.ok(merged.blob);
    assert.ok(merged.filename.includes('FormFit_Merged_'));
  });
});
