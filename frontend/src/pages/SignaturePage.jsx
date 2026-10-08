import React, { useState, useRef, useEffect } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { processSignature } from '../services/signatureProcessor.js';
import {
  PenTool,
  Upload,
  Camera,
  Download,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  RotateCw,
  RefreshCw,
  X,
} from 'lucide-react';

export function SignaturePage() {
  const { addHistory } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'upload', 'camera'
  const [signatureSource, setSignatureSource] = useState(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [targetWidth, setTargetWidth] = useState(300);
  const [targetHeight, setTargetHeight] = useState(100);
  const [maxKb, setMaxKb] = useState(50);
  const [format, setFormat] = useState('PNG');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawing Canvas State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#1C1F23');
  const [strokeWidth, setStrokeWidth] = useState(3.5);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Result state
  const [processedResult, setProcessedResult] = useState(null);
  const uploadedUrlRef = useRef(null);
  const resultUrlRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (uploadedUrlRef.current && uploadedUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedUrlRef.current);
      }
      if (resultUrlRef.current && resultUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  // Setup Canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    }
  }, [activeTab, strokeColor, strokeWidth]);

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    showToast('Canvas cleared', 'info');
  };

  // Upload handler with URL cleanup
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedUrlRef.current && uploadedUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      uploadedUrlRef.current = url;
      setSignatureSource(url);
      showToast(`✓ Loaded ${file.name}`, 'success');
    }
  };

  // Camera Management
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
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

  const captureCameraSignature = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 540;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        if (uploadedUrlRef.current && uploadedUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(uploadedUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        uploadedUrlRef.current = url;
        setSignatureSource(url);
        stopCamera();
        setActiveTab('upload');
        showToast('✓ Captured paper signature', 'success');
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

  // Process Signature
  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      let sourceToProcess = signatureSource;

      if (activeTab === 'draw') {
        const canvas = canvasRef.current;
        if (!hasDrawn || !canvas) {
          showToast('Please draw your signature on the canvas first.', 'error');
          setIsProcessing(false);
          return;
        }
        sourceToProcess = canvas.toDataURL('image/png');
      }

      if (!sourceToProcess) {
        showToast('Please upload or snap a photo of your signature first.', 'error');
        setIsProcessing(false);
        return;
      }

      const result = await processSignature({
        source: sourceToProcess,
        targetWidth,
        targetHeight,
        maxKb,
        removeBg,
        format,
      });

      if (resultUrlRef.current && resultUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
      resultUrlRef.current = result.url;

      setProcessedResult(result);

      // Add to persistent IndexedDB history
      await addHistory(
        {
          name: `signature_${Date.now()}.${result.extension}`,
          type: 'signature',
          sizeKb: result.sizeKb,
          dimensions: `${result.width} × ${result.height}`,
          format: result.format,
          preset: 'Signature Specs',
          thumbnail: result.thumbnailDataUrl || result.url,
          mimeType: result.mimeType,
        },
        result.blob
      );

      showToast(`✓ Signature processed (${result.sizeKb} KB, ${result.width}×${result.height})`, 'success');
    } catch (err) {
      showToast(`Signature error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Output
  const handleDownload = () => {
    if (!processedResult?.blob) return;
    const link = document.createElement('a');
    link.href = processedResult.url;
    link.download = `FormFit_Signature_${Date.now()}.${processedResult.extension || format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded signature (${processedResult.sizeKb} KB)`, 'success');
  };

  return (
    <>
      <SEO
        title="Signature Preparation & Extraction — FormFit AI"
        description="Draw digital signatures or isolate ink lines from phone photos with transparent background removal."
      />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Signature Preparation
          </h1>
          <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
            Capture, clean paper shadows, and format signatures for official exams and portals.
          </p>
        </div>

        {/* Camera Modal */}
        {isCameraActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#151A22] rounded-2xl p-5 shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
                <h3 className="font-extrabold text-sm text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#FF5500]" /> Snap Paper Signature
                </h3>
                <button onClick={stopCamera} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-dashed border-white/80 pointer-events-none rounded-lg" />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={captureCameraSignature}
                  className="px-6 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow"
                >
                  Capture
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="px-3.5 h-10 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Switch Camera
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Canvas / Upload area */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
            {/* Tabs */}
            <div className="flex rounded-lg p-1 bg-[#F6F3EF] dark:bg-[#1D2430] max-w-xs">
              <button
                onClick={() => setActiveTab('draw')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'draw' ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm' : 'text-[#8E96A2]'
                }`}
              >
                Draw
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'upload' ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm' : 'text-[#8E96A2]'
                }`}
              >
                Upload File
              </button>
            </div>

            {/* Drawing Mode */}
            {activeTab === 'draw' ? (
              <div className="space-y-3">
                <div className="relative w-full h-56 rounded-xl border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] bg-white overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={220}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-gray-300 font-medium">
                      Sign here with your mouse, finger, or stylus
                    </div>
                  )}
                  <button
                    onClick={clearCanvas}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8E96A2] px-1">
                  <div className="flex items-center gap-2">
                    <span>Ink Color:</span>
                    <button
                      onClick={() => setStrokeColor('#1C1F23')}
                      className={`w-5 h-5 rounded-full bg-[#1C1F23] border ${strokeColor === '#1C1F23' ? 'ring-2 ring-[#FF5500]' : ''}`}
                    />
                    <button
                      onClick={() => setStrokeColor('#1E40AF')}
                      className={`w-5 h-5 rounded-full bg-[#1E40AF] border ${strokeColor === '#1E40AF' ? 'ring-2 ring-[#FF5500]' : ''}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Width:</span>
                    <input
                      type="range"
                      min="1.5"
                      max="6"
                      step="0.5"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                      className="w-20 accent-[#FF5500]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Mode */
              <div className="space-y-3">
                <div
                  onClick={() => document.getElementById('signature-file-input')?.click()}
                  className="w-full h-56 rounded-xl border-2 border-dashed border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] flex items-center justify-center p-4 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] cursor-pointer hover:border-[#FF5500] transition-colors"
                >
                  {signatureSource ? (
                    <img src={signatureSource} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                        Select or capture signature photo
                      </strong>
                      <span className="text-[11px] text-[#8E96A2] block">
                        JPG, PNG, WEBP from your phone or scanner
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer px-3.5 h-9 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" /> Choose Photo
                    <input id="signature-file-input" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => startCamera('environment')}
                    className="px-3 h-9 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold flex items-center gap-1.5 hover:border-[#FF5500] transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" /> Camera
                  </button>
                  <button
                    onClick={() => setRemoveBg(!removeBg)}
                    className={`px-3 h-9 rounded-lg border text-xs font-bold transition-colors ${
                      removeBg ? 'border-[#12B76A] text-[#12B76A] bg-[#ECFDF3]' : 'border-[#E6DFD7]'
                    }`}
                  >
                    {removeBg ? '✓ Remove Paper BG' : 'Keep Background'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Specifications & Output */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
            <h3 className="font-extrabold text-sm text-[#1C1F23] dark:text-[#F5F7FA]">
              Signature Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5F6670] dark:text-[#9BA4B2]">Output Format</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-bold"
                >
                  <option value="PNG">PNG (Transparent)</option>
                  <option value="JPG">JPG (White Background)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8E96A2] block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(parseInt(e.target.value, 10) || 100)}
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8E96A2] block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(parseInt(e.target.value, 10) || 50)}
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5F6670] dark:text-[#9BA4B2]">Max File Size</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={maxKb}
                    onChange={(e) => setMaxKb(parseInt(e.target.value, 10))}
                    className="w-20 accent-[#FF5500]"
                  />
                  <span className="font-mono font-bold text-xs">{maxKb} KB</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Signature...' : 'Process Signature →'}
            </button>

            {/* Processed Result Container */}
            {processedResult && (
              <div className="pt-4 border-t border-[#F1ECE6] dark:border-[#242D3B] space-y-3">
                <div className="p-3 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 rounded bg-white border border-[#E6DFD7] p-1 flex items-center justify-center">
                      <img src={processedResult.url} alt="Processed output" className="max-h-full max-w-full" />
                    </div>
                    <div>
                      <strong className="text-xs text-[#1C1F23] dark:text-[#F5F7FA] block font-mono">
                        {processedResult.sizeKb} KB
                      </strong>
                      <span className="text-[10px] text-[#8E96A2]">
                        {processedResult.width}×{processedResult.height} • {processedResult.format}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#12B76A]">✓ Ready</span>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full h-10 rounded-xl bg-[#12B76A] hover:bg-[#0E9F5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download Prepared Signature
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
