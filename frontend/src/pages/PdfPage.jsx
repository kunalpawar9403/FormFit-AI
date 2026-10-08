import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  mergePdfFiles,
  splitPdfFile,
  compressPdfFile,
  convertImagesToPdf,
} from '../services/pdfProcessor.js';
import {
  FileStack,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  FileText,
  Minimize2,
  GitMerge,
  Split,
  Image,
} from 'lucide-react';

export function PdfPage() {
  const {
    addHistory,
    isPro,
    checkFreeLimit,
    trackFreeUsage,
    openUpgradeModal,
    freeUsage,
    FREE_PDF_LIMIT,
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('compress'); // 'compress', 'merge', 'split', 'jpg2pdf'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputResult, setOutputResult] = useState(null);

  // Split Range State
  const [splitStart, setSplitStart] = useState(1);
  const [splitEnd, setSplitEnd] = useState(1);
  const [totalDocPages, setTotalDocPages] = useState(1);

  const fileInputRef = useRef(null);
  const resultUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current && resultUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const processAddedFiles = async (files) => {
    if (files.length === 0) return;

    if (activeTab === 'compress') {
      setSelectedFiles([files[0]]);
      showToast(`✓ Selected "${files[0].name}" for compression`, 'success');
    } else if (activeTab === 'split') {
      const file = files[0];
      setSelectedFiles([file]);
      try {
        const ab = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setTotalDocPages(count);
        setSplitStart(1);
        setSplitEnd(Math.max(1, count));
        showToast(`✓ Loaded "${file.name}" (${count} pages)`, 'success');
      } catch (e) {
        setSplitStart(1);
        setSplitEnd(1);
        setTotalDocPages(1);
        showToast(`✓ Selected "${file.name}"`, 'success');
      }
    } else if (activeTab === 'merge') {
      setSelectedFiles((prev) => [...prev, ...files]);
      showToast(`✓ Added ${files.length} PDF file(s)`, 'success');
    } else if (activeTab === 'jpg2pdf') {
      setSelectedFiles((prev) => [...prev, ...files]);
      showToast(`✓ Added ${files.length} image(s)`, 'success');
    }
    setOutputResult(null);
  };

  const handleFilesChosen = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processAddedFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDropFiles = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    if (activeTab === 'jpg2pdf') {
      const validImages = files.filter((f) => f.type.startsWith('image/'));
      if (validImages.length === 0) {
        showToast('Please drop valid image files (JPG, PNG, WEBP)', 'error');
        return;
      }
      await processAddedFiles(validImages);
    } else {
      const validPdfs = files.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (validPdfs.length === 0) {
        showToast('Please drop valid PDF files (.pdf)', 'error');
        return;
      }
      await processAddedFiles(validPdfs);
    }
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Perform Operations
  const handleExecuteOperation = async () => {
    if (!isPro && checkFreeLimit('pdf')) {
      openUpgradeModal('Daily PDF Processing Limit Reached (5/5)');
      return;
    }

    if (selectedFiles.length === 0) {
      showToast('Please select at least one file first', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      let result = null;

      if (activeTab === 'compress') {
        result = await compressPdfFile(selectedFiles[0]);
        showToast(
          result.isOptimized
            ? `✓ PDF compressed by ${result.savedPercentage}% (${result.newKb} KB)`
            : `✓ PDF already fully optimized (${result.newKb} KB)`,
          'success'
        );
      } else if (activeTab === 'merge') {
        if (selectedFiles.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge.');
        }
        result = await mergePdfFiles(selectedFiles);
        showToast(`✓ Merged ${selectedFiles.length} files into ${result.filename}`, 'success');
      } else if (activeTab === 'split') {
        result = await splitPdfFile(selectedFiles[0], splitStart, splitEnd);
        showToast(`✓ Extracted pages ${splitStart} to ${splitEnd}`, 'success');
      } else if (activeTab === 'jpg2pdf') {
        result = await convertImagesToPdf(selectedFiles);
        showToast(`✓ Converted ${selectedFiles.length} image(s) to PDF`, 'success');
      }

      if (resultUrlRef.current && resultUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
      resultUrlRef.current = result.url;
      setOutputResult(result);

      // Save to persistent IndexedDB history
      await addHistory(
        {
          name: result.filename,
          type: 'document',
          sizeKb: result.newKb || result.sizeKb || 120,
          dimensions: result.pageCount ? `${result.pageCount} pages` : 'PDF',
          format: 'PDF',
          preset: `PDF ${activeTab.toUpperCase()}`,
          thumbnail: '',
          mimeType: 'application/pdf',
        },
        result.blob
      );
      trackFreeUsage('pdf');
    } catch (err) {
      showToast(err.message || 'PDF operation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Output PDF
  const handleDownload = () => {
    if (!outputResult?.blob) return;
    const freshUrl = URL.createObjectURL(outputResult.blob);
    const link = document.createElement('a');
    link.href = freshUrl;
    link.download = outputResult.filename || 'FormFit_Document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(freshUrl), 1000);
    showToast(`✓ Downloaded ${outputResult.filename}`, 'success');
  };

  return (
    <>
      <SEO
        title="PDF Suite — Compress, Merge, Split & Convert PDFs"
        description="Private client-side PDF tools: compress PDF, merge files, extract pages, and convert JPG to PDF."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            PDF Tools Suite
          </h1>
          <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
            Fast, secure in-browser PDF operations without file upload servers.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
            { id: 'merge', label: 'Merge PDFs', icon: GitMerge },
            { id: 'split', label: 'Split Pages', icon: Split },
            { id: 'jpg2pdf', label: 'JPG to PDF', icon: Image },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedFiles([]);
                  setOutputResult(null);
                }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'border-[#FF5500] bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] shadow-sm'
                    : 'border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-[#5F6670] dark:text-[#9BA4B2] hover:border-[#FF5500]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropFiles}
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl bg-white dark:bg-[#151A22] border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] transition-colors cursor-pointer text-center space-y-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={activeTab === 'jpg2pdf' ? 'image/*,.jpg,.jpeg,.png,.webp' : '.pdf,application/pdf'}
            multiple={activeTab === 'merge' || activeTab === 'jpg2pdf'}
            onChange={handleFilesChosen}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
              {activeTab === 'jpg2pdf' ? 'Select or drop images to compile into PDF' : 'Select or drop PDF file(s)'}
            </strong>
            <p className="text-xs text-[#8E96A2] mt-0.5">Click to browse or drag and drop from your device</p>
          </div>
        </div>

        {/* Split page range settings */}
        {activeTab === 'split' && selectedFiles.length > 0 && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span>Extract Page Range (Document has {totalDocPages} {totalDocPages === 1 ? 'page' : 'pages'}):</span>
            <div className="flex items-center gap-2">
              <label>From:</label>
              <input
                type="number"
                min="1"
                max={totalDocPages}
                value={splitStart}
                onChange={(e) => setSplitStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 h-8 px-2 rounded border border-[#E6DFD7] dark:border-[#2E3A4B] bg-transparent text-center font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <label>To:</label>
              <input
                type="number"
                min={splitStart}
                max={totalDocPages}
                value={splitEnd}
                onChange={(e) => setSplitEnd(Math.max(splitStart, parseInt(e.target.value, 10) || splitStart))}
                className="w-16 h-8 px-2 rounded border border-[#E6DFD7] dark:border-[#2E3A4B] bg-transparent text-center font-bold"
              />
            </div>
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#8E96A2]">
              <span>SELECTED FILES ({selectedFiles.length})</span>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F6F3EF] dark:bg-[#1D2430] text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-[#8E96A2] font-mono text-[11px] shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleExecuteOperation}
              disabled={isProcessing}
              className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {isProcessing
                ? 'Processing PDF...'
                : activeTab === 'compress'
                ? 'Compress PDF Now →'
                : activeTab === 'merge'
                ? `Merge ${selectedFiles.length} PDFs →`
                : activeTab === 'split'
                ? 'Extract & Split Pages →'
                : 'Convert to PDF Document →'}
            </button>
          </div>
        )}

        {/* Output & Download Card */}
        {outputResult && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151A22] border-2 border-[#12B76A] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block font-mono">
                {outputResult.filename}
              </strong>
              <div className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                {outputResult.newKb ? `${outputResult.newKb} KB` : `${outputResult.sizeKb} KB`}
                {outputResult.pageCount ? ` • ${outputResult.pageCount} page(s)` : ''}
              </div>
              {outputResult.message && (
                <p className="text-[11px] text-[#12B76A] font-semibold">
                  {outputResult.message}
                </p>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="px-5 h-10 rounded-xl bg-[#12B76A] hover:bg-[#0E9F5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow shrink-0"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        )}
      </div>
    </>
  );
}
