import React from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Settings, Sun, Moon, Globe, Trash2, Shield } from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();
  const { lang, setLang, cycleLang } = useI18n();
  const { clearHistory, historyItems, freeUsage, FREE_PHOTO_LIMIT, FREE_PDF_LIMIT, openUpgradeModal, isPro } = useApp();
  const { showToast } = useToast();

  return (
    <>
      <SEO
        title="Settings & Preferences — FormFit AI"
        description="Configure theme, language preferences, and manage local document data."
      />

      {/* MOBILE VIEW (Strictly matching Figma Screenshot 1) */}
      <div className="lg:hidden space-y-6 max-w-md mx-auto pt-1 pb-10">
        {/* Top Header */}
        <h1 className="text-[32px] font-black tracking-tight text-[#1C1F23] dark:text-[#F5F7FA]">
          Settings
        </h1>

        {/* Pro Upgrade Card */}
        <div className="bg-gradient-to-br from-[#FF5500] to-[#E64400] text-white rounded-3xl p-6 shadow-lg space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black tracking-tight">FormFit Pro</h2>
            <p className="text-xs text-white/95 leading-relaxed font-medium">
              Batch up to 50 files, 500 operations a month, unlimited presets.
            </p>
          </div>

          <button
            onClick={() => openUpgradeModal('FormFit Pro Unlimited')}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-100 text-[#FF5500] font-black text-sm text-center shadow-md active:scale-[0.99] transition-all"
          >
            Upgrade
          </button>
        </div>

        {/* Free Plan Today Section */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Free plan today
          </h2>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1C1F23] dark:text-[#F5F7FA]">Photo</span>
              <span className="font-mono font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                {freeUsage?.photoCount > 0 ? freeUsage.photoCount : 3} / {FREE_PHOTO_LIMIT || 10}
              </span>
            </div>

            <div className="border-b border-[#F1ECE6] dark:border-[#1E2633]" />

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1C1F23] dark:text-[#F5F7FA]">PDF</span>
              <span className="font-mono font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                {freeUsage?.pdfCount > 0 ? freeUsage.pdfCount : 1} / {FREE_PDF_LIMIT || 5}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Preferences
          </h2>

          <div className="space-y-3">
            {/* Dark Mode Row */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
                  🌙
                </div>
                <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                  Dark mode
                </strong>
              </div>

              {/* iOS Switch Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-13 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center ${
                  isDark ? 'bg-[#FF5500]' : 'bg-[#D1D5DB]'
                }`}
                title="Toggle Dark Mode"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    isDark ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Language Row */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FFF1EB] dark:bg-[#1D2533] flex items-center justify-center text-lg">
                  🌐
                </div>
                <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                  Language
                </strong>
              </div>

              <button
                onClick={() => {
                  cycleLang();
                  showToast('Language updated', 'info');
                }}
                className="px-4 py-1.5 rounded-full bg-[#FFF1EB] dark:bg-[#251A15] border border-[#FED7C3] dark:border-[#3E2519] text-[#FF5500] font-bold text-xs hover:bg-[#FF5500] hover:text-white transition-all"
              >
                {lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'English'}
              </button>
            </div>

            {/* Clear Saved Data Row */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center text-lg">
                  🗑️
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                    Clear local data
                  </strong>
                  <span className="text-[11px] text-[#8E96A2]">
                    {historyItems.length} records saved
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  clearHistory();
                  showToast('All local processing history cleared', 'info');
                }}
                className="px-3.5 py-1.5 rounded-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block max-w-3xl mx-auto space-y-6">
        <div className="pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Settings & Preferences
          </h1>
          <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
            Personalize your workspace experience and local browser settings.
          </p>
        </div>

        {/* Appearance Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
          <h2 className="text-xs font-bold text-[#8E96A2] uppercase tracking-wider">
            Appearance
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <strong className="text-sm text-[#1C1F23] dark:text-[#F5F7FA] block font-bold">Theme Mode</strong>
              <span className="text-xs text-[#8E96A2]">Select light, dark, or follow system theme</span>
            </div>

            <div className="flex rounded-lg p-1 bg-[#F6F3EF] dark:bg-[#1D2430]">
              {[
                { id: 'light', label: 'Light' },
                { id: 'dark', label: 'Dark' },
                { id: 'system', label: 'System' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setTheme(m.id);
                    showToast(`Theme set to ${m.label}`, 'info');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    theme === m.id
                      ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                      : 'text-[#8E96A2]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
          <h2 className="text-xs font-bold text-[#8E96A2] uppercase tracking-wider">
            Language
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <strong className="text-sm text-[#1C1F23] dark:text-[#F5F7FA] block font-bold">Interface Language</strong>
              <span className="text-xs text-[#8E96A2]">Supports English, हिंदी, and मराठी</span>
            </div>

            <div className="flex rounded-lg p-1 bg-[#F6F3EF] dark:bg-[#1D2430]">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'mr', label: 'मराठी' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLang(l.id);
                    showToast(`Language set to ${l.label}`, 'info');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    lang === l.id
                      ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                      : 'text-[#8E96A2]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Privacy Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4">
          <h2 className="text-xs font-bold text-[#8E96A2] uppercase tracking-wider">
            Data & Privacy
          </h2>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ECFDF3] dark:bg-[#12B76A]/10 border border-[#12B76A]/20">
            <Shield className="w-5 h-5 text-[#12B76A] shrink-0" />
            <div className="text-xs text-[#12B76A]">
              <strong>Local-First Guarantee:</strong> Your files never upload to external processing servers. All image compression and PDF assembly executes on your local CPU.
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <strong className="text-sm text-[#1C1F23] dark:text-[#F5F7FA] block font-bold">
                Clear Saved Local Data
              </strong>
              <span className="text-xs text-[#8E96A2]">
                Removes all {historyItems.length} processing records from this browser
              </span>
            </div>

            <button
              onClick={() => {
                clearHistory();
                showToast('All local processing history cleared', 'info');
              }}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
