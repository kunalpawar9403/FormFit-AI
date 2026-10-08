import React, { useState, useRef, useEffect } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { generateDocumentPdf } from '../services/documentProcessor.js';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  RotateCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Camera,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Layers,
  X,
} from 'lucide-react';

export function DocumentPage() {
  const { addHistory } = useApp();
  const { showToast } = useToast();

  // Document Pages State: empty by default in production (no fake defaults!)
  const [pages, setPages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);

  // Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // default to rear camera for scanning

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const createdUrlsRef = useRef(new Set());

  // Cleanup object URLs and camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      createdUrlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      createdUrlsRef.current.clear();
    };
  }, []);

  const activePage = pages[activeIndex] || pages[0];

  // Update filter for active page
  const updateActiveFilter = (key, value) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activeIndex
          ? { ...p, filters: { ...p.filters, [key]: value } }
          : p
      )
    );
  };

  // Add new pages from user files
  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPages = files.map((file) => {
      const url = URL.createObjectURL(file);
      createdUrlsRef.current.add(url);
      return {
        id: 'page-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        src: url,
        name: file.name,
        filters: { brightness: 100, contrast: 110, grayscale: false },
      };
    });

    setPages((prev) => [...prev, ...newPages]);
    setActiveIndex(pages.length);
    showToast(`✓ Added ${files.length} document page(s)`, 'success');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Explicit user action to load sample documents for testing
  const handleLoadSample = () => {
    const samplePages = [
      {
        id: 'sample-p1',
        src: '/assets/document_scan.jpg',
        name: 'Sample_Certificate.jpg',
        filters: { brightness: 100, contrast: 110, grayscale: false },
      },
      {
        id: 'sample-p2',
        src: '/assets/document_scan.jpg',
        name: 'Sample_Marksheet.jpg',
        filters: { brightness: 105, contrast: 120, grayscale: false },
      },
    ];
    setPages(samplePages);
    setActiveIndex(0);
    showToast('Sample document pages loaded for demonstration', 'info');
  };

  // Delete single page with URL cleanup
  const handleDeletePage = (index, e) => {
    if (e) e.stopPropagation();
    const pageToDelete = pages[index];
    if (pageToDelete?.src && pageToDelete.src.startsWith('blob:')) {
      URL.revokeObjectURL(pageToDelete.src);
      createdUrlsRef.current.delete(pageToDelete.src);
    }

    const updated = pages.filter((_, idx) => idx !== index);
    setPages(updated);
    setActiveIndex(Math.max(0, Math.min(activeIndex, updated.length - 1)));
    showToast('Page removed from document', 'info');
  };

  // Clear all pages with URL cleanup
  const handleClearAll = () => {
    pages.forEach((p) => {
      if (p.src?.startsWith('blob:')) {
        URL.revokeObjectURL(p.src);
        createdUrlsRef.current.delete(p.src);
      }
    });
    setPages([]);
    setActiveIndex(0);
    setGeneratedPdf(null);
    showToast('All document pages cleared', 'info');
  };

  // Reorder page up or down
  const movePage = (index, direction, e) => {
    if (e) e.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setPages(reordered);
    setActiveIndex(targetIdx);
  };

  // Camera Management
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setIsCameraActive(false);
      showToast('Camera access denied or unavailable: ' + (err.message || ''), 'error');
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const captureCameraPage = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        createdUrlsRef.current.add(url);
        const newPage = {
          id: 'page-' + Date.now(),
          src: url,
          name: `Scan_Page_${pages.length + 1}.jpg`,
          filters: { brightness: 105, contrast: 115, grayscale: false },
        };
        setPages((prev) => [...prev, newPage]);
        setActiveIndex(pages.length);
        stopCamera();
        showToast(`✓ Captured Page ${pages.length + 1}`, 'success');
      }
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Generate verified PDF from user's pages
  const handleGeneratePdf = async () => {
    if (pages.length === 0) {
      showToast('Please add at least one page first', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const result = await generateDocumentPdf(pages);
      setGeneratedPdf(result);

      // Add to persistent IndexedDB history
      await addHistory(
        {
          name: result.filename,
          type: 'document',
          sizeKb: result.sizeKb,
          dimensions: `${result.pagesCount} pages`,
          format: 'PDF',
          preset: 'Verified Document PDF',
          thumbnail: result.thumbnailDataUrl || pages[0]?.src || '',
          mimeType: 'application/pdf',
        },
        result.blob
      );

      showToast(`✓ Document PDF created (${result.sizeKb} KB, ${result.pagesCount} pages)`, 'success');
    } catch (err) {
      showToast(`PDF generation failed: ${err.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Download PDF
  const handleDownload = () => {
    if (!generatedPdf?.blob) return;
    const link = document.createElement('a');
    link.href = generatedPdf.url;
    link.download = generatedPdf.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${generatedPdf.filename}`, 'success');
  };

  const f = activePage?.filters || { brightness: 100, contrast: 110, grayscale: false };
  const filterStyle = `brightness(${f.brightness}%) contrast(${f.contrast}%) ${f.grayscale ? 'grayscale(100%)' : ''}`;

  return (
    <>
      <SEO
        title="Document Scanner & PDF Generator — FormFit AI"
        description="Clean, enhance, and compile certificates, marksheets, and identity cards into compliant PDFs."
      />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              Document Scanner
            </h1>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
              Add multiple document pages, apply text-sharpening enhancements, and generate a verified PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddFiles}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 h-9 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pages
            </button>
            <button
              onClick={() => startCamera('environment')}
              className="px-3 h-9 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-[#1C1F23] dark:text-[#F5F7FA] font-bold text-xs flex items-center gap-1.5 hover:border-[#FF5500] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Scan Page
            </button>
            {pages.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 h-9 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Camera Modal */}
        {isCameraActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-[#151A22] rounded-2xl p-5 shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
                <h3 className="font-extrabold text-sm text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#FF5500]" /> Document Camera Scanner
                </h3>
                <button onClick={stopCamera} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-[440px] mx-auto flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-6 border-2 border-dashed border-white/80 pointer-events-none rounded-lg" />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={captureCameraPage}
                  className="px-6 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow"
                >
                  Capture Page
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="px-3.5 h-10 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {cameraFacing === 'environment' ? 'Rear' : 'Front'} Camera
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 h-10 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no pages exist */}
        {pages.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-2xl bg-white dark:bg-[#151A22] border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1C1F23] dark:text-[#F5F7FA]">
                No document pages yet
              </h3>
              <p className="text-xs text-[#8E96A2] max-w-sm mx-auto mt-1">
                Add your first page from your device or use your camera to scan certificates, ID cards, and marksheets.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Your First Page
              </button>
              <button
                onClick={() => startCamera('environment')}
                className="px-4 h-10 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] font-bold text-xs flex items-center gap-2 hover:border-[#FF5500]"
              >
                <Camera className="w-4 h-4" /> Scan with Camera
              </button>
              <button
                onClick={handleLoadSample}
                className="px-4 h-10 rounded-xl border border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-semibold text-[#8E96A2] hover:text-[#FF5500] hover:border-[#FF5500]"
              >
                Try Sample
              </button>
            </div>
          </div>
        ) : (
          /* Active Document Editor Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Active Page Preview & Thumbnails */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
              <div className="relative w-full max-w-[340px] mx-auto aspect-[3/4] rounded-xl overflow-hidden bg-black shadow-md flex items-center justify-center">
                <img
                  src={activePage?.src}
                  alt="Document page"
                  style={{ filter: filterStyle }}
                  className="w-full h-full object-cover transition-all duration-150"
                />
                {/* Corner bounds guide */}
                <div className="absolute inset-4 border-2 border-[#3B82F6] pointer-events-none rounded-sm">
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white" />
                </div>
              </div>

              {/* Page Thumbnails Selector & Reordering */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-bold text-[#8E96A2] uppercase tracking-wider">
                    Document Pages ({pages.length})
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => movePage(activeIndex, -1, e)}
                      disabled={activeIndex === 0}
                      className="p-1 rounded border border-[#E6DFD7] dark:border-[#2E3A4B] disabled:opacity-30 hover:border-[#FF5500]"
                      title="Move page left"
                    >
                      <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <button
                      onClick={(e) => movePage(activeIndex, 1, e)}
                      disabled={activeIndex >= pages.length - 1}
                      className="p-1 rounded border border-[#E6DFD7] dark:border-[#2E3A4B] disabled:opacity-30 hover:border-[#FF5500]"
                      title="Move page right"
                    >
                      <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                  {pages.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-14 h-18 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                        idx === activeIndex
                          ? 'border-[#FF5500] ring-2 ring-[#FF5500]/30'
                          : 'border-[#E6DFD7] dark:border-[#2E3A4B] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={p.src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center">
                        p.{idx + 1}
                      </span>
                      <button
                        onClick={(e) => handleDeletePage(idx, e)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] hover:bg-red-600 transition-colors"
                        title="Remove page"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-18 rounded-lg border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-col items-center justify-center text-[#8E96A2] hover:border-[#FF5500] hover:text-[#FF5500] transition-colors shrink-0"
                    title="Add page"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Enhancements & PDF Generator */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
                <h3 className="font-extrabold text-sm text-[#1C1F23] dark:text-[#F5F7FA]">
                  Page {activeIndex + 1} Enhancements
                </h3>
                <button
                  onClick={() => {
                    updateActiveFilter('brightness', 110);
                    updateActiveFilter('contrast', 125);
                    showToast('Auto enhance applied', 'info');
                  }}
                  className="text-xs font-bold text-[#FF5500] flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Enhance
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 font-semibold text-[#5F6670] dark:text-[#9BA4B2]">
                    <span>Brightness</span>
                    <span className="font-mono">{f.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={f.brightness}
                    onChange={(e) => updateActiveFilter('brightness', parseInt(e.target.value, 10))}
                    className="w-full accent-[#FF5500]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 font-semibold text-[#5F6670] dark:text-[#9BA4B2]">
                    <span>Contrast</span>
                    <span className="font-mono">{f.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={f.contrast}
                    onChange={(e) => updateActiveFilter('contrast', parseInt(e.target.value, 10))}
                    className="w-full accent-[#FF5500]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-[#5F6670] dark:text-[#9BA4B2]">Grayscale (Black & White)</span>
                  <input
                    type="checkbox"
                    checked={f.grayscale}
                    onChange={(e) => updateActiveFilter('grayscale', e.target.checked)}
                    className="w-4 h-4 accent-[#FF5500]"
                  />
                </div>
              </div>

              <button
                onClick={handleGeneratePdf}
                disabled={isExporting}
                className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isExporting ? 'Compiling PDF...' : `Generate PDF (${pages.length} Pages) →`}
              </button>

              {/* Generated PDF Output */}
              {generatedPdf && (
                <div className="pt-4 border-t border-[#F1ECE6] dark:border-[#242D3B] space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-[#1C1F23] dark:text-[#F5F7FA] block font-mono">
                        {generatedPdf.filename}
                      </strong>
                      <span className="text-[10px] text-[#8E96A2]">
                        {generatedPdf.sizeKb} KB • {generatedPdf.pagesCount} A4 Pages
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#12B76A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full h-10 rounded-xl bg-[#12B76A] hover:bg-[#0E9F5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Verified PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
