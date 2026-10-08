import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  Sparkles,
  Lock,
  UserCheck,
  Smartphone,
  ArrowRight,
  Camera,
  PenTool,
  FileText,
  FileStack,
  Sliders,
  Check,
  Landmark,
  FileEdit,
  Shield,
} from 'lucide-react';

export function LandingPage() {
  const { t } = useI18n();
  const { allPresets, applyPresetToPhoto, setIsProModalOpen } = useApp();
  const navigate = useNavigate();

  const handlePresetClick = (presetId) => {
    const preset = allPresets.find((p) => p.id === presetId);
    if (preset) {
      applyPresetToPhoto(preset);
      navigate('/photo');
    }
  };

  return (
    <>
      <SEO
        title="FormFit AI — Precision File & Photo Preparation for Official Portals"
        description="Prepare photos, signatures, and documents to exact official portal specifications. 100% private local browser processing."
      />

      {/* MOBILE VIEW (Strictly matching Figma Screenshot 4) */}
      <div className="lg:hidden px-4 pt-5 pb-10 space-y-6 max-w-md mx-auto">
        {/* Hero Section */}
        <div className="space-y-3 pt-1">
          <h1 className="text-[32px] font-black tracking-tight leading-[1.12] text-[#1C1F23] dark:text-[#F5F7FA]">
            Fit any file to <span className="text-[#FF5500]">any portal</span>
          </h1>
          <p className="text-[13px] text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
            Exact pixels. Exact KB. Processed on your device — nothing is uploaded.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/photo')}
            className="w-full h-12 rounded-2xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <span className="text-lg leading-none">+</span>
            <span>Prepare a photo</span>
          </button>

          <button
            onClick={() => navigate('/presets')}
            className="w-full h-12 rounded-2xl bg-white dark:bg-[#151B24] border border-[#E6DFD7] dark:border-[#222D3D] text-[#1C1F23] dark:text-[#F5F7FA] font-bold text-sm hover:border-[#FF5500] transition-all active:scale-[0.98] flex items-center justify-center"
          >
            <span>Browse presets</span>
          </button>
        </div>

        {/* Popular Presets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              Popular presets
            </h2>
            <Link to="/presets" className="text-xs font-bold text-[#FF5500] hover:underline">
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {/* Indian Passport */}
            <div
              onClick={() => handlePresetClick('passport-in')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] cursor-pointer transition-all flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0D2447] text-[#3B82F6] flex items-center justify-center shrink-0 border border-[#1E3A8A]/30">
                  <div className="text-base font-bold">🪪</div>
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                    Indian Passport
                  </strong>
                  <span className="text-xs text-[#8E96A2] font-mono block">
                    413×531 • 20–100 KB
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF1EB] dark:bg-[#2B1B14] text-[#FF5500]">
                JPG
              </span>
            </div>

            {/* UPSC Civil Services */}
            <div
              onClick={() => handlePresetClick('upsc-photo')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] cursor-pointer transition-all flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1C2432] text-[#94A3B8] flex items-center justify-center shrink-0 border border-[#2D3748]">
                  <Landmark className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                    UPSC Civil Services
                  </strong>
                  <span className="text-xs text-[#8E96A2] font-mono block">
                    350×350 • 20–50 KB
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF1EB] dark:bg-[#2B1B14] text-[#FF5500]">
                JPG
              </span>
            </div>

            {/* US Visa DS-160 */}
            <div
              onClick={() => handlePresetClick('us-visa')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] cursor-pointer transition-all flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1C2432] text-white flex items-center justify-center shrink-0 border border-[#2D3748] text-base">
                  🇺🇸
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                    US Visa DS-160
                  </strong>
                  <span className="text-xs text-[#8E96A2] font-mono block">
                    600×600 • 60–240 KB
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF1EB] dark:bg-[#2B1B14] text-[#FF5500]">
                JPG
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block space-y-16 lg:space-y-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1EB] dark:bg-[#FF5500]/15 border border-[#FED7C3] dark:border-[#FF5500]/30 text-xs font-bold text-[#FF5500]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] text-[#1C1F23] dark:text-[#F5F7FA]">
                {t('heroTitle1')} <span className="text-[#FF5500]">{t('heroTitle2')}</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5F6670] dark:text-[#9BA4B2] max-w-lg leading-relaxed">
                {t('heroSubtext')}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/photo')}
                  className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-95 gap-2"
                >
                  <span>{t('startPreparing')}</span>
                </button>
                <button
                  onClick={() => navigate('/tools')}
                  className="inline-flex items-center justify-center px-6 h-12 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-[#1C1F23] dark:text-[#F5F7FA] font-bold text-sm hover:border-[#FF5500] transition-colors"
                >
                  <span>{t('exploreTools')}</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#F1ECE6] dark:border-[#242D3B]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                      {t('localProcessing')}
                    </strong>
                    <span className="text-[11px] text-[#8E96A2]">Private in your browser</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                      {t('noAccount')}
                    </strong>
                    <span className="text-[11px] text-[#8E96A2]">{t('noAccountDesc')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                      {t('allDevices')}
                    </strong>
                    <span className="text-[11px] text-[#8E96A2]">Desktop, Mobile, Tablet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Comparison Board */}
            <div className="lg:col-span-6 flex justify-center">
              <div
                onClick={() => navigate('/photo')}
                className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                title="Click to open Photo Workspace"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#8E96A2] mb-4">
                  <span>AUTOMATED SPEC COMPLIANCE</span>
                  <span className="text-[#FF5500] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Try Live <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  {/* Original Card */}
                  <div className="p-3 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] text-center space-y-2">
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white">
                      <img src="/assets/portrait.jpg" alt="Original raw photo" className="w-full h-full object-cover" />
                    </div>
                    <strong className="text-xs text-[#1C1F23] dark:text-[#F5F7FA] block">Original</strong>
                    <div className="text-[10px] font-mono text-[#8E96A2]">2.8 MB • 4000×3000 • PNG</div>
                  </div>

                  {/* Ready Card */}
                  <div className="p-3 rounded-xl bg-[#FFF1EB]/50 dark:bg-[#FF5500]/10 border-2 border-[#FF5500] text-center space-y-2 relative">
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-[#FF5500] bg-white">
                      <img src="/assets/portrait.jpg" alt="Ready optimized photo" className="w-full h-full object-cover" />
                    </div>
                    <strong className="text-xs text-[#FF5500] block">Ready & Compliant</strong>
                    <div className="text-[10px] font-mono font-bold text-[#FF5500]">47 KB • 200×230 • JPG</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12B76A] text-white">
                      ✓ Valid
                    </span>
                  </div>
                </div>

                {/* 5-step checklist simulation */}
                <div className="mt-4 pt-4 border-t border-[#F1ECE6] dark:border-[#242D3B] grid grid-cols-5 gap-1 text-[10px] text-center font-bold text-[#12B76A]">
                  <div>✓ Analyze</div>
                  <div>✓ Crop</div>
                  <div>✓ Resize</div>
                  <div>✓ Compress</div>
                  <div>✓ Validate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Tools Section */}
        <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              {t('whatToPrepare')}
            </h2>
            <p className="text-sm text-[#5F6670] dark:text-[#9BA4B2]">
              {t('chooseToolSubtext')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Photo Tool */}
            <Link
              to="/photo"
              className="group p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <strong className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                  {t('photoToolName')}
                </strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                  {t('photoToolDesc')}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* Signature Tool */}
            <Link
              to="/signature"
              className="group p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <PenTool className="w-6 h-6" />
                </div>
                <strong className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                  {t('sigToolName')}
                </strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                  {t('sigToolDesc')}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* Document Scanner Tool */}
            <Link
              to="/document"
              className="group p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <strong className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                  {t('docToolName')}
                </strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                  {t('docToolDesc')}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* PDF Tool */}
            <Link
              to="/pdf"
              className="group p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileStack className="w-6 h-6" />
                </div>
                <strong className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                  {t('pdfToolName')}
                </strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                  {t('pdfToolDesc')}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* Custom Presets */}
            <Link
              to="/presets"
              className="group p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <strong className="text-base font-bold text-[#1C1F23] dark:text-[#F5F7FA] block mb-1">
                  {t('customReqName')}
                </strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                  {t('customReqDesc')}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Popular Presets Section */}
        <section id="presets" className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
              {t('popularPresets')}
            </h3>
            <Link to="/presets" className="text-xs font-bold text-[#FF5500] hover:underline">
              {t('viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handlePresetClick('passport-in')}
              className="p-4 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block group-hover:text-[#FF5500] transition-colors">
                  Indian Passport Photo
                </strong>
                <span className="text-[11px] text-[#8E96A2]">413 × 531 px • ≤ 100 KB</span>
              </div>
            </div>

            <div
              onClick={() => handlePresetClick('us-visa')}
              className="p-4 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block group-hover:text-[#FF5500] transition-colors">
                  US Visa DS-160
                </strong>
                <span className="text-[11px] text-[#8E96A2]">600 × 600 px • ≤ 240 KB</span>
              </div>
            </div>

            <div
              onClick={() => handlePresetClick('upsc-photo')}
              className="p-4 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block group-hover:text-[#FF5500] transition-colors">
                  UPSC Civil Services
                </strong>
                <span className="text-[11px] text-[#8E96A2]">350 × 350 px • ≤ 50 KB</span>
              </div>
            </div>

            <div
              onClick={() => handlePresetClick('ssc-photo')}
              className="p-4 rounded-xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block group-hover:text-[#FF5500] transition-colors">
                  SSC CGL / CHSL
                </strong>
                <span className="text-[11px] text-[#8E96A2]">100 × 120 px • ≤ 50 KB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 border-t border-[#F1ECE6] dark:border-[#242D3B]">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">Transparent Pricing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
              Simple, fair pricing for everyone
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free Forever */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-col justify-between space-y-6">
              <div>
                <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">{t('freePlan')}</strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
                  Everything you need for individual applications.
                </p>
                <div className="text-3xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA] mt-4">
                  $0 <span className="text-xs font-medium text-[#8E96A2]">/ forever</span>
                </div>

                <ul className="text-xs space-y-2.5 mt-6 text-[#5F6670] dark:text-[#9BA4B2]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Unlimited photo and signature crops</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Official portal presets (Passport, UPSC, SSC, Visa)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> 100% private local browser processing</li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/photo')}
                className="w-full h-11 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] font-bold text-xs hover:border-[#FF5500] transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border-2 border-[#FF5500] shadow-lg flex flex-col justify-between space-y-6 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5500] text-white">
                RECOMMENDED
              </span>

              <div>
                <strong className="text-lg font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">{t('proPlan')}</strong>
                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
                  For multi-file batch users and consultants.
                </p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-extrabold text-[#FF5500]">₹499</span>
                  <span className="text-xs font-medium text-[#8E96A2]">/ month</span>
                  <span className="text-[10px] text-gray-400">(Passes from ₹99)</span>
                </div>

                <ul className="text-xs space-y-2.5 mt-6 text-[#5F6670] dark:text-[#9BA4B2]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Everything in Free</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Unlimited bulk ZIP export queue</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Multi-page PDF scanning & enhancement</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#12B76A]" /> Custom requirement generator</li>
                </ul>
              </div>

              <button
                onClick={() => setIsProModalOpen(true)}
                className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {t('upgradeToPro')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
