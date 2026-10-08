import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { X, Download, Smartphone, Laptop, CheckCircle2, Share, MoreVertical } from 'lucide-react';

export function PwaInstallModal() {
  const { isPwaModalOpen, setIsPwaModalOpen, isInstallable, promptInstall } = useApp();

  if (!isPwaModalOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (accepted) {
        setIsPwaModalOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#151A22] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F1ECE6] dark:border-[#242D3B] space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsPwaModalOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F6F3EF] dark:bg-[#1D2430] text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 p-2.5 items-center justify-center shadow-inner border border-[#FED7C3] dark:border-[#FF5500]/30 mx-auto">
            <img src="/assets/logo-mark.png" alt="FormFit AI App" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] tracking-tight">
            Install FormFit AI App
          </h2>
          <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] max-w-xs mx-auto leading-relaxed">
            Install on your Android, iPhone, or Desktop for instant full-screen offline access.
          </p>
        </div>

        {/* Primary Action Button (If Browser Triggers Native Prompt) */}
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Install App on this Device</span>
          </button>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold text-[#8E96A2] uppercase tracking-wider">
            Quick Installation Guide
          </h3>

          {/* Android Guide */}
          <div className="p-3.5 rounded-2xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                Android (Chrome, Edge, Samsung)
              </strong>
            </div>
            <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed flex items-center gap-1.5">
              <span>1. Tap top menu</span>
              <MoreVertical className="w-3.5 h-3.5 inline text-[#FF5500]" />
              <span>2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
            </p>
          </div>

          {/* iOS Guide */}
          <div className="p-3.5 rounded-2xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🍎</span>
              <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                iPhone & iPad (Safari)
              </strong>
            </div>
            <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed flex items-center gap-1.5">
              <span>1. Tap Share</span>
              <Share className="w-3.5 h-3.5 inline text-[#FF5500]" />
              <span>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
            </p>
          </div>

          {/* Desktop Guide */}
          <div className="p-3.5 rounded-2xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-1.5">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#FF5500]" />
              <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                Desktop (Chrome, Edge, Brave)
              </strong>
            </div>
            <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
              Click the install icon in the URL bar (top right) or browser menu &gt; <strong>"Install FormFit AI"</strong>.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="pt-2 border-t border-[#F1ECE6] dark:border-[#242D3B] grid grid-cols-2 gap-2 text-[11px] text-[#5F6670] dark:text-[#9BA4B2]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span>100% Free &amp; Private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span>Works Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span>Zero App Store Wait</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span>Full Screen App</span>
          </div>
        </div>
      </div>
    </div>
  );
}
