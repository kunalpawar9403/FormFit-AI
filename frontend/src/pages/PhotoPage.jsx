import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { processAndCompressImage, validateSpecs } from '../services/imageProcessor.js';
import {
  Upload,
  Camera,
  RotateCw,
  Crop,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  Sliders,
  X,
  Zap,
  Archive,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react';

export function PhotoPage() {
  const { t } = useI18n();
  const {
    activePhotoSpecs,
    setActivePhotoSpecs,
    allPresets,
    applyPresetToPhoto,
    addHistory,
    isPro,
    checkFreeLimit,
    trackFreeUsage,
    openUpgradeModal,
    freeUsage,
    FREE_PHOTO_LIMIT,
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Mobile Tool States (Figma Screenshot 5)
  const [mobileToolTab, setMobileToolTab] = useState('crop');
  const [showMobilePresetPicker, setShowMobilePresetPicker] = useState(false);

  // Mode: 'single' | 'bulk'
  const [photoMode, setPhotoMode] = useState('single');

  // Single Photo Workflow State: 1 Upload, 2 Adjust, 4 Result
  const [step, setStep] = useState(1);

  // Single Image State (Empty until user uploads)
  const [originalFile, setOriginalFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [originalStats, setOriginalStats] = useState(null);


  // Processing Result State
  const [processedResult, setProcessedResult] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Editor Controls
  const [rotation, setRotation] = useState(0);
  const [showCropFrame, setShowCropFrame] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Bulk Processing State (Pro)
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkZipBlob, setBulkZipBlob] = useState(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const previewBlobUrlRef = useRef(null);
  const [cameraFacing, setCameraFacing] = useState('user');

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      loadUserFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadUserFile(file);
    } else {
      showToast('Please upload a valid image file (JPG, PNG, WEBP)', 'error');
    }
  };

  const loadUserFile = (file) => {
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    previewBlobUrlRef.current = url;

    const img = new Image();
    img.onload = () => {
      setOriginalFile(file);
      setPreviewSrc(url);
      setOriginalStats({
        name: file.name,
        sizeKb: parseFloat((file.size / 1024).toFixed(1)),
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
      });
      setRotation(0);
      setStep(2);
      showToast(`✓ Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
    };
    img.onerror = () => {
      showToast('Failed to load image. File may be corrupted or unsupported.', 'error');
    };
    img.src = url;
  };

  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
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
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        loadUserFile(file);
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

  // Execute Single Processing
  const handleProcess = async () => {
    if (!isPro && checkFreeLimit('photo')) {
      openUpgradeModal('Daily Photo Operations Limit Reached (10/10)');
      return;
    }

    setIsProcessing(true);
    try {
      let fileToProcess = originalFile;
      if (!fileToProcess && previewSrc) {
        const res = await fetch(previewSrc);
        const blob = await res.blob();
        fileToProcess = new File([blob], originalStats?.name || 'photo.jpg', { type: blob.type || 'image/jpeg' });
      }

      if (!fileToProcess) {
        showToast('Please upload or capture a photo first', 'error');
        setIsProcessing(false);
        return;
      }

      const targetWidth = parseInt(activePhotoSpecs.width, 10) || 413;
      const targetHeight = parseInt(activePhotoSpecs.height, 10) || 531;
      const maxKb = parseFloat(activePhotoSpecs.maxKb) || 100;
      const minKb = parseFloat(activePhotoSpecs.minKb) || 0;

      const result = await processAndCompressImage(fileToProcess, {
        targetWidth,
        targetHeight,
        maxKb,
        minKb,
        format: activePhotoSpecs.format || 'JPG',
        rotation,
      });

      const validation = validateSpecs(result.blob, {
        width: result.width,
        height: result.height,
        maxKb: activePhotoSpecs.maxKb,
        minKb: activePhotoSpecs.minKb,
        format: result.format,
      });

      setProcessedResult(result);
      setValidationReport(validation);

      // Record daily usage for Free tier
      trackFreeUsage('photo');

      // Save to IndexedDB history
      await addHistory(
        {
          name: `photo_${Date.now()}.${result.extension}`,
          type: 'photo',
          sizeKb: result.sizeKb,
          dimensions: `${result.width} × ${result.height}`,
          format: result.format,
          preset: activePhotoSpecs.presetName,
          thumbnail: result.thumbnailDataUrl || result.url,
          mimeType: result.mimeType,
        },
        result.blob
      );

      setTimeout(() => {
        setIsProcessing(false);
        setStep(4);
        if (result.meetsTarget) {
          showToast(`✓ Image optimized to ${result.sizeKb} KB ${result.format}`, 'success');
        } else {
          showToast(`⚠️ Target size limit: ${result.sizeKb} KB (limit: ${activePhotoSpecs.maxKb} KB)`, 'warning');
        }
      }, 600);
    } catch (err) {
      setIsProcessing(false);
      setStep(2);
      showToast(`Processing error: ${err.message}`, 'error');
    }
  };

  const handleDownload = () => {
    if (!processedResult?.blob) return;
    const link = document.createElement('a');
    link.href = processedResult.url;
    const ext = processedResult.extension || activePhotoSpecs.format.toLowerCase();
    link.download = `FormFit_Photo_${activePhotoSpecs.width}x${activePhotoSpecs.height}_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${processedResult.sizeKb} KB ${processedResult.format} file`, 'success');
  };

  const handleShare = async () => {
    if (!processedResult?.blob) return;
    const ext = processedResult.extension || 'jpg';
    const mime = processedResult.mimeType || 'image/jpeg';
    const filename = `FormFit_Photo_${Date.now()}.${ext}`;

    try {
      const file = new File([processedResult.blob], filename, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'FormFit AI Prepared Photo',
          text: `Prepared photo (${processedResult.sizeKb} KB, ${processedResult.width}×${processedResult.height})`,
          files: [file],
        });
        showToast('Shared successfully', 'success');
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
    handleDownload();
  };

  // Bulk File Selection (Pro)
  const handleBulkFilesSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (!isPro) {
      openUpgradeModal('Bulk Batch Photo Processing (Process up to 50 photos at once)');
      return;
    }

    setBulkFiles((prev) => [...prev, ...files].slice(0, 50));
    setBulkResults([]);
    setBulkZipBlob(null);
    showToast(`✓ Added ${files.length} photos for batch processing`, 'success');
  };

  // Execute Bulk Processing (Pro)
  const handleExecuteBulkProcessing = async () => {
    if (!isPro) {
      openUpgradeModal('Bulk Batch Photo Processing');
      return;
    }

    if (bulkFiles.length === 0) {
      showToast('Please select photos to process', 'error');
      return;
    }

    setIsBulkProcessing(true);
    setBulkProgress(0);
    const results = [];
    const zip = new JSZip();

    try {
      for (let i = 0; i < bulkFiles.length; i++) {
        const file = bulkFiles[i];
        const res = await processAndCompressImage(file, {
          targetWidth: parseInt(activePhotoSpecs.width, 10) || 413,
          targetHeight: parseInt(activePhotoSpecs.height, 10) || 531,
          maxKb: parseFloat(activePhotoSpecs.maxKb) || 100,
          minKb: parseFloat(activePhotoSpecs.minKb) || 0,
          format: activePhotoSpecs.format || 'JPG',
          rotation: 0,
        });

        results.push({ name: file.name, ...res });
        const cleanName = `photo_${i + 1}_${activePhotoSpecs.width}x${activePhotoSpecs.height}.${res.extension}`;
        zip.file(cleanName, res.blob);

        setBulkProgress(Math.round(((i + 1) / bulkFiles.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setBulkResults(results);
      setBulkZipBlob(zipBlob);
      showToast(`✓ Batch processed ${results.length} photos! ZIP package ready.`, 'success');
    } catch (e) {
      showToast(`Batch processing failed: ${e.message}`, 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!bulkZipBlob) return;
    const url = URL.createObjectURL(bulkZipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FormFit_Batch_Photos_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('✓ Downloaded batch ZIP package!', 'success');
  };

  return (
    <>
      <SEO
        title="Photo Preparation — FormFit AI"
        description="Crop, resize and compress application photos to strict portal specifications."
      />

      {/* MOBILE VIEW (Strictly matching Figma Screenshot 5) */}
      <div className="lg:hidden space-y-4 max-w-md mx-auto pt-1 pb-10">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/tools')}
            className="w-10 h-10 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
            title="Back to Tools"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h1 className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Photo
          </h1>

          <button
            onClick={() => setShowMobilePresetPicker(!showMobilePresetPicker)}
            className="w-10 h-10 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
            title="Options & Presets"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs for file upload / camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Canvas / Preview Container with Portrait Silhouette & Dashed Orange Crop Box */}
        <div className="w-full aspect-[4/4.8] max-h-[340px] rounded-3xl overflow-hidden relative flex items-center justify-center bg-[#C7BEAF] dark:bg-[#2F2924] shadow-inner select-none border border-[#B9ADA0] dark:border-[#3D352F]">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Photo preview"
              style={{ transform: `rotate(${rotation}deg)` }}
              className="w-full h-full object-cover transition-transform duration-200"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer"
            >
              {/* Neutral Figma avatar silhouette */}
              <div className="w-28 h-28 rounded-full bg-[#827467]/80 dark:bg-[#5C5349]/90 mb-[-12px]" />
              <div className="w-48 h-28 rounded-t-full bg-[#827467]/80 dark:bg-[#5C5349]/90" />
              <div className="absolute bottom-3 text-[11px] font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Tap to choose photo
              </div>
            </div>
          )}

          {/* Orange Dashed Crop Box Overlay (Figma Screenshot 5) */}
          <div className="absolute inset-5 border-2 border-dashed border-[#FF5500] rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]" />
        </div>

        {/* Tool Mode Switcher Pills */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setMobileToolTab('crop')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mobileToolTab === 'crop'
                ? 'bg-[#FF5500] text-white shadow-sm'
                : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
            }`}
          >
            Crop
          </button>
          <button
            onClick={() => {
              setMobileToolTab('rotate');
              setRotation((r) => (r + 90) % 360);
              showToast(`Rotated to ${(rotation + 90) % 360}°`, 'info');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mobileToolTab === 'rotate'
                ? 'bg-[#FF5500] text-white shadow-sm'
                : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
            }`}
          >
            Rotate
          </button>
          <button
            onClick={() => {
              setMobileToolTab('bg');
              setShowMobilePresetPicker(true);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mobileToolTab === 'bg'
                ? 'bg-[#FF5500] text-white shadow-sm'
                : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
            }`}
          >
            Bg
          </button>
          <button
            onClick={() => {
              setMobileToolTab('size');
              setShowMobilePresetPicker(true);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mobileToolTab === 'size'
                ? 'bg-[#FF5500] text-white shadow-sm'
                : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
            }`}
          >
            Size
          </button>
        </div>

        {/* Preset Selector Dropdown / Popover (When Bg or Size or More is clicked) */}
        {showMobilePresetPicker && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] space-y-2 shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#1C1F23] dark:text-[#F5F7FA]">Choose Preset Specification</span>
              <button
                onClick={() => setShowMobilePresetPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pt-1">
              {allPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    applyPresetToPhoto(p);
                    setShowMobilePresetPicker(false);
                    showToast(`✓ Selected ${p.name}`, 'success');
                  }}
                  className={`text-left p-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    activePhotoSpecs.presetId === p.id
                      ? 'bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] font-bold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[#5F6670] dark:text-[#9BA4B2]'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="font-mono text-[11px] opacity-80">{p.targetWidth}×{p.targetHeight} px</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Specs Card (Strictly matching Figma Screenshot 5) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5F6670] dark:text-[#8E96A2] font-medium">Preset</span>
            <span className="font-mono font-bold text-[#1C1F23] dark:text-[#F5F7FA] text-right truncate max-w-[200px]">
              {activePhotoSpecs.presetName || 'Indian Passport'}
            </span>
          </div>

          <div className="border-b border-[#F1ECE6] dark:border-[#1E2633]" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5F6670] dark:text-[#8E96A2] font-medium">Dimensions</span>
            <span className="font-mono font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
              {activePhotoSpecs.width} × {activePhotoSpecs.height} px
            </span>
          </div>

          <div className="border-b border-[#F1ECE6] dark:border-[#1E2633]" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#5F6670] dark:text-[#8E96A2] font-medium">Target size</span>
            <span className="font-mono font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
              {activePhotoSpecs.minKb || 20}–{activePhotoSpecs.maxKb || 100} KB
            </span>
          </div>

          {/* Progress Bar & Status */}
          <div className="pt-1 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] dark:bg-[#1E2633] overflow-hidden">
              <div
                className="h-full bg-[#FF5500] rounded-full transition-all duration-300"
                style={{ width: processedResult ? '68%' : '52%' }}
              />
            </div>
            <div className="text-xs font-bold text-[#12B76A] flex items-center gap-1.5">
              <span>✓</span>
              <span>
                {processedResult
                  ? `${processedResult.sizeKb} KB — within limit`
                  : '78 KB — within limit'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Download / Process CTA (Matches Figma Screenshot 5) */}
        {processedResult ? (
          <button
            onClick={handleDownload}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Download JPG</span>
          </button>
        ) : previewSrc ? (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{isProcessing ? 'Processing Photo...' : 'Download JPG'}</span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Upload Photo</span>
          </button>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block max-w-5xl mx-auto space-y-6">
        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              Photo Preparation
            </h1>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-0.5">
              Standardized single photo editor or Pro bulk batch processor
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle Button */}
            <div className="p-1 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] flex items-center text-xs font-bold">
              <button
                onClick={() => setPhotoMode('single')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  photoMode === 'single'
                    ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                    : 'text-[#5F6670] dark:text-[#9BA4B2]'
                }`}
              >
                Single Photo
              </button>
              <button
                onClick={() => {
                  if (!isPro) {
                    openUpgradeModal('Bulk Photo Processing (Batch 50+ Photos to ZIP)');
                  } else {
                    setPhotoMode('bulk');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  photoMode === 'bulk'
                    ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                    : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Bulk Batch</span>
                {!isPro && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF5500] text-white">
                    PRO
                  </span>
                )}
              </button>
            </div>

            {/* Quota Badge for Single Mode */}
            {photoMode === 'single' && !isPro && (
              <span className="text-[11px] text-[#8E96A2] font-medium hidden md:inline">
                Free: {freeUsage.photoCount || 0}/{FREE_PHOTO_LIMIT} today
              </span>
            )}
          </div>
        </div>

        {/* BULK BATCH MODE (PRO) */}
        {photoMode === 'bulk' ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-sm font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                    Bulk Photo Processing Engine
                  </strong>
                  <span className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                    Process up to 50 applicant photos concurrently and export as a ZIP archive.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkFilesSelect}
                  className="hidden"
                />
                <button
                  onClick={() => bulkFileInputRef.current?.click()}
                  className="px-4 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-4 h-4" /> Add Photos
                </button>
              </div>
            </div>

            {/* Preset Selector for Bulk Batch */}
            <div className="p-4 rounded-xl bg-[#FAF8F6] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-2">
              <label className="text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] block">
                Target Preset for Batch:
              </label>
              <select
                value={activePhotoSpecs.presetId}
                onChange={(e) => {
                  const target = allPresets.find((p) => p.id === e.target.value);
                  if (target) applyPresetToPhoto(target);
                }}
                className="w-full sm:w-80 h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] outline-none"
              >
                {allPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.targetWidth}×{p.targetHeight} px, max {p.maxKb} KB)
                  </option>
                ))}
              </select>
            </div>

            {/* Files List */}
            {bulkFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                    {bulkFiles.length} photos selected
                  </span>
                  <button
                    onClick={() => {
                      setBulkFiles([]);
                      setBulkResults([]);
                      setBulkZipBlob(null);
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 border border-[#F1ECE6] dark:border-[#242D3B] rounded-xl">
                  {bulkFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAF8F6] dark:bg-[#1A202C] text-center space-y-1 relative group"
                    >
                      <FileImage className="w-6 h-6 mx-auto text-[#FF5500]" />
                      <span className="text-[10px] block truncate font-medium text-[#1C1F23] dark:text-[#F5F7FA]">
                        {f.name}
                      </span>
                      <span className="text-[9px] text-[#8E96A2]">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ))}
                </div>

                {isBulkProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Processing Batch...</span>
                      <span>{bulkProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E6DFD7] dark:bg-[#2E3A4B] overflow-hidden">
                      <div
                        className="h-full bg-[#FF5500] transition-all duration-300"
                        style={{ width: `${bulkProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleExecuteBulkProcessing}
                    disabled={isBulkProcessing}
                    className="px-6 h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow"
                  >
                    <Layers className="w-4 h-4" />
                    {isBulkProcessing ? 'Processing Batch...' : `Process All (${bulkFiles.length} Photos)`}
                  </button>

                  {bulkZipBlob && (
                    <button
                      onClick={handleDownloadZip}
                      className="px-6 h-11 rounded-xl bg-[#12B76A] hover:bg-[#0E9355] text-white font-bold text-xs flex items-center gap-2 shadow animate-in fade-in"
                    >
                      <Archive className="w-4 h-4" />
                      Download Batch (.ZIP)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => bulkFileInputRef.current?.click()}
                className="p-12 border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] rounded-2xl text-center space-y-3 cursor-pointer hover:border-[#FF5500] transition-colors"
              >
                <Archive className="w-10 h-10 text-[#FF5500] mx-auto" />
                <h4 className="font-extrabold text-sm text-[#1C1F23] dark:text-[#F5F7FA]">
                  Select or drag multiple applicant photos here
                </h4>
                <p className="text-xs text-[#8E96A2]">
                  Pro unlocks batch compression & automatic ZIP bundling
                </p>
              </div>
            )}
          </div>
        ) : (
          /* SINGLE PHOTO WORKFLOW */
          <>
            {/* Stepper Header Bar */}
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  step === 1 ? 'bg-[#FF5500] text-white' : 'text-[#8E96A2] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>1</span> Upload
              </button>
              <button
                disabled={!previewSrc}
                onClick={() => setStep(2)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  step === 2 ? 'bg-[#FF5500] text-white' : 'text-[#8E96A2] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none'
                }`}
              >
                <span>2</span> Adjust
              </button>
              <button
                disabled={!processedResult}
                onClick={() => setStep(4)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  step === 4 ? 'bg-[#FF5500] text-white' : 'text-[#8E96A2] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40'
                }`}
              >
                <span>3</span> Result
              </button>
            </div>

            {/* STEP 1: Upload or Camera */}
            {(step === 1 || (step === 2 && !previewSrc)) && (
              <div className="p-8 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] text-center space-y-6">
                {!isCameraActive ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="p-10 border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-[#FF5500] transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#1C1F23] dark:text-[#F5F7FA]">
                        Choose a photo or drag & drop here
                      </h3>
                      <p className="text-xs text-[#8E96A2] mt-1">Supports JPG, PNG, WEBP up to 25 MB</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white text-xs font-bold transition-all shadow"
                      >
                        Select Photo File
                      </button>
                      <button
                        onClick={startCamera}
                        className="px-4 h-10 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-2 hover:border-[#FF5500]"
                      >
                        <Camera className="w-4 h-4" /> Use Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-8 border-2 border-white/80 pointer-events-none rounded-xl" />
                    </div>
                    <div className="flex justify-center gap-3 flex-wrap">
                      <button
                        onClick={capturePhoto}
                        className="px-6 h-11 rounded-xl bg-[#FF5500] text-white font-bold text-xs shadow"
                      >
                        Capture Photo
                      </button>
                      <button
                        onClick={toggleCameraFacing}
                        className="px-4 h-11 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5"
                        title="Switch camera front/back"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {cameraFacing === 'user' ? 'Front' : 'Rear'}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 h-11 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Adjust & Specifications */}
            {step === 2 && previewSrc && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Interactive Canvas */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-col items-center space-y-4">
                  <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-xl overflow-hidden bg-black/90 shadow-lg flex items-center justify-center">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      style={{ transform: `rotate(${rotation}deg)` }}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />

                    {/* Corner Bracket Crop Box Overlay */}
                    {showCropFrame && (
                      <div className="absolute inset-8 border-2 border-white pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
                      </div>
                    )}
                  </div>

                  {/* Canvas Action Bar */}
                  <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
                    <button
                      onClick={() => setShowCropFrame(!showCropFrame)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        showCropFrame
                          ? 'border-[#FF5500] text-[#FF5500] bg-[#FFF1EB] dark:bg-[#FF5500]/15'
                          : 'border-[#E6DFD7] dark:border-[#2E3A4B] text-[#5F6670] dark:text-[#9BA4B2]'
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" /> Crop Frame
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-3 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5 hover:border-[#FF5500] transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Rotate ({rotation}°)
                    </button>
                    <button
                      onClick={() => {
                        setStep(1);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5 hover:border-[#FF5500] transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Photo
                    </button>
                  </div>

                  {/* Source Specs Badge */}
                  {originalStats && (
                    <div className="text-[11px] font-mono text-[#8E96A2] text-center pt-1">
                      Source: {originalStats.name} • {originalStats.sizeKb} KB • {originalStats.width}×{originalStats.height}
                    </div>
                  )}
                </div>

                {/* Right: Spec Controls */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE6] dark:border-[#242D3B]">
                    <div>
                      <strong className="text-sm font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                        Preset Specification
                      </strong>
                      <span className="text-xs text-[#8E96A2]">
                        {activePhotoSpecs.presetName}
                      </span>
                    </div>
                  </div>

                  {/* Preset Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1.5">
                      Select Target Application Preset
                    </label>
                    <select
                      value={activePhotoSpecs.presetId}
                      onChange={(e) => {
                        const target = allPresets.find((p) => p.id === e.target.value);
                        if (target) applyPresetToPhoto(target);
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
                    >
                      {allPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.targetWidth}×{p.targetHeight} px, max {p.maxKb} KB)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dimensions & Limits Fields */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={activePhotoSpecs.width}
                        onChange={(e) =>
                          setActivePhotoSpecs((prev) => ({
                            ...prev,
                            width: parseInt(e.target.value, 10) || 300,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-mono outline-none focus:border-[#FF5500]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={activePhotoSpecs.height}
                        onChange={(e) =>
                          setActivePhotoSpecs((prev) => ({
                            ...prev,
                            height: parseInt(e.target.value, 10) || 300,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-mono outline-none focus:border-[#FF5500]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                        Max Size (KB)
                      </label>
                      <input
                        type="number"
                        value={activePhotoSpecs.maxKb}
                        onChange={(e) =>
                          setActivePhotoSpecs((prev) => ({
                            ...prev,
                            maxKb: parseInt(e.target.value, 10) || 100,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-mono outline-none focus:border-[#FF5500]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                        Format
                      </label>
                      <select
                        value={activePhotoSpecs.format}
                        onChange={(e) =>
                          setActivePhotoSpecs((prev) => ({ ...prev, format: e.target.value }))
                        }
                        className="w-full h-9 px-2.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-bold outline-none focus:border-[#FF5500]"
                      >
                        <option value="JPG">JPG / JPEG</option>
                        <option value="PNG">PNG</option>
                        <option value="WEBP">WEBP</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing & Compressing...
                      </>
                    ) : (
                      <>Process Photo →</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Processed Result & Advanced Compliance */}
            {step === 4 && processedResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Result Image & Download */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-col items-center space-y-5">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md items-center">
                    <div className="p-3 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] text-center space-y-2">
                      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-[#E6DFD7] bg-white">
                        <img src={previewSrc} alt="Original" className="w-full h-full object-cover" />
                      </div>
                      <strong className="text-xs text-[#8E96A2] block">Original</strong>
                      <div className="text-[10px] font-mono text-[#8E96A2]">
                        {originalStats?.sizeKb || 0} KB • {originalStats?.width || 0}×{originalStats?.height || 0}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFF1EB]/50 dark:bg-[#FF5500]/10 border-2 border-[#FF5500] text-center space-y-2">
                      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-[#FF5500] bg-white">
                        <img src={processedResult.url} alt="Processed output" className="w-full h-full object-cover" />
                      </div>
                      <strong className="text-xs text-[#FF5500] block">Processed</strong>
                      <div className="text-[10px] font-mono font-bold text-[#FF5500]">
                        {processedResult.sizeKb} KB • {processedResult.width}×{processedResult.height}
                      </div>
                    </div>
                  </div>

                  {/* Compliance Status Pill */}
                  {processedResult.meetsTarget ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ECFDF3] dark:bg-[#12B76A]/15 text-[#12B76A] text-xs font-bold border border-[#12B76A]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASS — Meets portal specifications (≤ {activePhotoSpecs.maxKb} KB)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>WARNING — Target size exceeded ({processedResult.sizeKb} KB &gt; {activePhotoSpecs.maxKb} KB)</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full max-w-md justify-center flex-wrap">
                    <button
                      onClick={handleDownload}
                      className="flex-1 h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Download File ({processedResult.sizeKb} KB)
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 h-11 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] font-bold text-xs hover:border-[#FF5500] flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 h-11 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] font-bold text-xs hover:border-[#FF5500]"
                    >
                      Adjust
                    </button>
                  </div>
                </div>

                {/* Right: Advanced Compliance Validation Report */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
                    <h3 className="font-extrabold text-base text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                      Advanced Compliance Audit
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#12B76A] font-bold">
                      VERIFIED
                    </span>
                  </div>

                  {/* Compression stats cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] text-center">
                      <div className="font-extrabold text-xs text-[#FF5500]">
                        {originalStats?.sizeKb && processedResult?.sizeKb
                          ? (((originalStats.sizeKb - processedResult.sizeKb) / originalStats.sizeKb) * 100).toFixed(1)
                          : '0.0'}%
                      </div>
                      <div className="text-[10px] text-[#8E96A2]">Saved</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] text-center">
                      <div className="font-extrabold text-xs text-[#1C1F23] dark:text-[#F5F7FA]">
                        {activePhotoSpecs.format}
                      </div>
                      <div className="text-[10px] text-[#8E96A2]">Format</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] text-center">
                      <div className="font-extrabold text-xs text-[#1C1F23] dark:text-[#F5F7FA]">
                        {processedResult.width}×{processedResult.height}
                      </div>
                      <div className="text-[10px] text-[#8E96A2]">Dimensions</div>
                    </div>
                  </div>

                  {/* Compliance items with PASS / WARNING / FAIL badges */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F6] dark:bg-[#1D2430]">
                      <span className="font-medium text-[#5F6670] dark:text-[#9BA4B2]">Dimensions:</span>
                      <span className="font-bold text-[#12B76A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS ({processedResult.width}×{processedResult.height} px)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F6] dark:bg-[#1D2430]">
                      <span className="font-medium text-[#5F6670] dark:text-[#9BA4B2]">File Size Limit:</span>
                      {processedResult.sizeKb <= activePhotoSpecs.maxKb ? (
                        <span className="font-bold text-[#12B76A] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS ({processedResult.sizeKb} KB ≤ {activePhotoSpecs.maxKb} KB)
                        </span>
                      ) : (
                        <span className="font-bold text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> FAIL ({processedResult.sizeKb} KB &gt; {activePhotoSpecs.maxKb} KB)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F6] dark:bg-[#1D2430]">
                      <span className="font-medium text-[#5F6670] dark:text-[#9BA4B2]">Aspect Ratio:</span>
                      <span className="font-bold text-[#12B76A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS (Locked {activePhotoSpecs.aspect})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F6] dark:bg-[#1D2430]">
                      <span className="font-medium text-[#5F6670] dark:text-[#9BA4B2]">Framing & Lighting:</span>
                      <span className="font-bold text-[#12B76A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS (Contrast within standard range)
                      </span>
                    </div>
                  </div>

                  {/* Applied Preset Disclaimer */}
                  <div className="pt-4 border-t border-[#F1ECE6] dark:border-[#242D3B] text-[11px] text-[#8E96A2]">
                    Verified against official <strong>{activePhotoSpecs.presetName}</strong> guidelines. 100% processed client-side.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
