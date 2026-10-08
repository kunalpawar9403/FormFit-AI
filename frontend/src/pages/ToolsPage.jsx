import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  Camera,
  PenTool,
  FileText,
  FileStack,
  Sliders,
  Sparkles,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  Search,
  Lock,
} from 'lucide-react';

export function ToolsPage() {
  const { t } = useI18n();
  const {
    allPresets,
    applyPresetToPhoto,
    isPro,
    proDetails,
    freeUsage,
    FREE_PHOTO_LIMIT,
    FREE_PDF_LIMIT,
    openUpgradeModal,
    setIsProDashboardOpen,
    setIsCmdPaletteOpen,
    historyItems,
  } = useApp();

  const recentItem = historyItems?.[0];

  return (
    <>
      <SEO
        title="Tools Hub — All Application File Preparation Tools"
        description="Select from photo resizing, signature extraction, document scanning, and PDF tools."
      />

      {/* MOBILE VIEW (Strictly matching Figma Screenshot 3) */}
      <div className="lg:hidden space-y-6 max-w-md mx-auto pt-1 pb-10">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-black tracking-tight text-[#1C1F23] dark:text-[#F5F7FA]">
              Tools
            </h1>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-0.5">
              Pick what you need to prepare.
            </p>
          </div>

          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="w-10 h-10 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
            title="Search Tools"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Tools Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Photo */}
          <Link
            to="/photo"
            className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] transition-all flex flex-col justify-between min-h-[140px] shadow-sm active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
              📸
            </div>
            <div>
              <strong className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                Photo
              </strong>
              <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] mt-0.5 leading-snug">
                Crop, resize, compress
              </p>
            </div>
          </Link>

          {/* Signature */}
          <Link
            to="/signature"
            className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] transition-all flex flex-col justify-between min-h-[140px] shadow-sm active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
              ✍️
            </div>
            <div>
              <strong className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                Signature
              </strong>
              <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] mt-0.5 leading-snug">
                Draw or remove paper bg
              </p>
            </div>
          </Link>

          {/* Document */}
          <Link
            to="/document"
            className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] transition-all flex flex-col justify-between min-h-[140px] shadow-sm active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
              📄
            </div>
            <div>
              <strong className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                Document
              </strong>
              <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] mt-0.5 leading-snug">
                Scan certificates
              </p>
            </div>
          </Link>

          {/* PDF Suite */}
          <Link
            to="/pdf"
            className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] transition-all flex flex-col justify-between min-h-[140px] shadow-sm active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
              📑
            </div>
            <div>
              <strong className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] block">
                PDF Suite
              </strong>
              <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] mt-0.5 leading-snug">
                Merge, split, compress
              </p>
            </div>
          </Link>
        </div>

        {/* Security / Privacy Banner */}
        <div className="p-4 rounded-2xl bg-[#FFF5F0] dark:bg-[#191411] border border-[#FFD9C7] dark:border-[#382319] flex items-center gap-3.5 shadow-sm">
          <div className="text-xl shrink-0">🔒</div>
          <div className="text-xs leading-snug">
            <strong className="font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              100% on-device.{' '}
            </strong>
            <span className="text-[#5F6670] dark:text-[#C5CDD9]">
              Your files never leave your phone.
            </span>
          </div>
        </div>

        {/* Recent Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              Recent
            </h2>
            <Link to="/history" className="text-xs font-bold text-[#FF5500] hover:underline">
              History
            </Link>
          </div>

          <Link
            to="/history"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] flex items-center justify-between shadow-sm active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="w-11 h-11 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center shrink-0 text-base">
                📸
              </div>
              <div className="truncate">
                <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block truncate">
                  {recentItem?.name || 'passport_final.jpg'}
                </strong>
                <span className="text-xs text-[#8E96A2] font-mono block">
                  {recentItem
                    ? `${recentItem.dimensions || '413×531'} • ${recentItem.sizeKb} KB`
                    : '413×531 • 78 KB'}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFF1EB] dark:bg-[#2B1B14] text-[#FF5500] shrink-0">
              Done
            </span>
          </Link>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block space-y-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              {t('whatToPrepare')}
            </h1>
            <p className="text-sm text-[#5F6670] dark:text-[#9BA4B2] mt-1">
              {t('chooseToolSubtext')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#12B76A]/30 bg-[#ECFDF3] dark:bg-[#12B76A]/10 text-[#12B76A] text-xs font-bold shrink-0 self-start md:self-auto">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Client-Side Engine</span>
            </div>

            {isPro ? (
              <button
                onClick={() => setIsProDashboardOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#12B76A]/30 bg-[#12B76A]/10 text-[#12B76A] text-xs font-bold hover:bg-[#12B76A]/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-[#12B76A]" />
                <span>Pro Active</span>
              </button>
            ) : (
              <button
                onClick={() => openUpgradeModal('Pro SaaS Membership')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF5500]/30 bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] text-xs font-bold hover:bg-[#FF5500]/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF5500]" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>
        </div>

        {/* Free Usage & SaaS Tier Banner */}
        <div className="p-4 rounded-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-gradient-to-r from-white via-[#FAF8F6] to-white dark:from-[#151A22] dark:via-[#19202B] dark:to-[#151A22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs sm:text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                  {isPro ? 'Pro Member Tier' : 'Free Instant Workspace'}
                </strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF3] dark:bg-[#12B76A]/15 text-[#12B76A] font-bold">
                  {isPro ? 'ACTIVE' : 'NO REGISTRATION NEEDED'}
                </span>
              </div>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-0.5">
                {isPro
                  ? 'Unlimited batch processing, high-res multi-page PDF generation & cloud presets.'
                  : `Free tier: ${freeUsage.photoCount || 0}/${FREE_PHOTO_LIMIT} photos • ${freeUsage.pdfCount || 0}/${FREE_PDF_LIMIT} PDFs used today.`}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isPro ? (
              <button
                onClick={() => setIsProDashboardOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#12B76A] hover:bg-[#0E9355] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                View Pro Dashboard
              </button>
            ) : (
              <button
                onClick={() => openUpgradeModal('Batch File Processing')}
                className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                Upgrade to Pro (₹99+)
              </button>
            )}
          </div>
        </div>

        {/* 5 Primary Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Photo Tool Card */}
          <Link
            to="/photo"
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                {t('photoToolName')}
              </strong>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                Resize, crop, and compress identity photos to official portal requirements with binary-search JPEG optimization.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#FF5500]">
              <span>Prepare Photo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Signature Tool Card */}
          <Link
            to="/signature"
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                {t('sigToolName')}
              </strong>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                Draw digital signatures or isolate ink lines from phone photos by stripping yellow/gray paper backgrounds.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#FF5500]">
              <span>Prepare Signature</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Document Scanner Tool Card */}
          <Link
            to="/document"
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                {t('docToolName')}
              </strong>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                Scan multiple certificate or marksheet pages, apply real brightness/contrast filters, and bundle into verified PDFs.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#FF5500]">
              <span>Scan Documents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* PDF Suite Tool Card */}
          <Link
            to="/pdf"
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileStack className="w-6 h-6" />
              </div>
              <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                {t('pdfToolName')}
              </strong>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                Client-side PDF suite: compress to target file sizes, merge multiple exam forms, split pages, and convert photos to PDF.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#FF5500]">
              <span>Open PDF Suite</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Custom Presets Tool Card */}
          <Link
            to="/presets"
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                {t('customReqName')}
              </strong>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                Explore official exam, passport, and visa specifications or save your own custom dimension profiles.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#FF5500]">
              <span>View Presets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Popular Presets Quick Access */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
              {t('popularPresets')}
            </h3>
            <Link to="/presets" className="text-xs font-bold text-[#FF5500] hover:underline">
              {t('viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allPresets.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to="/photo"
                onClick={() => applyPresetToPhoto(p)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-[#1C1F23] dark:text-[#F5F7FA] block font-bold truncate max-w-[160px]">{p.name}</strong>
                  <span className="text-[#8E96A2] text-[11px] font-mono">{p.targetWidth}×{p.targetHeight} px • ≤{p.maxKb}KB</span>
                </div>
                <span className="text-[#FF5500] font-bold text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
