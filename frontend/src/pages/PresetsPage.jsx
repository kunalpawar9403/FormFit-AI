import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sliders,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function PresetsPage() {
  const {
    allPresets,
    customPresets,
    applyPresetToPhoto,
    setIsAddPresetModalOpen,
    deletePreset,
    isPro,
    openUpgradeModal,
    FREE_CUSTOM_PRESET_LIMIT,
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const categories = ['All', 'Government', 'Education', 'Jobs', 'Scholarships', 'General'];

  const filteredPresets = allPresets.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUsePreset = (preset) => {
    applyPresetToPhoto(preset);
    showToast(`✓ Loaded "${preset.name}" preset`, 'success');
    navigate('/photo');
  };

  const handleAddPresetClick = () => {
    if (!isPro && customPresets.length >= FREE_CUSTOM_PRESET_LIMIT) {
      openUpgradeModal('Unlimited Custom Presets (Free tier limited to 5 presets)');
      return;
    }
    setIsAddPresetModalOpen(true);
  };

  return (
    <>
      <SEO
        title="Application Presets Catalog — FormFit AI"
        description="Official passport, visa, UPSC, SSC and university application dimensions and file size limits."
      />

      {/* MOBILE VIEW (Strictly matching Figma Screenshot 2) */}
      <div className="lg:hidden space-y-5 max-w-md mx-auto pt-1 pb-10">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-black tracking-tight text-[#1C1F23] dark:text-[#F5F7FA]">
            Presets
          </h1>

          <button
            onClick={handleAddPresetClick}
            className="w-10 h-10 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
            title="Add Custom Preset"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#8E96A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UPSC, SSC, visa..."
            className="w-full h-12 pl-10 pr-4 rounded-2xl border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#131922] text-xs font-semibold text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500] transition-colors shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#FF5500] text-white shadow-sm'
                  : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div className="space-y-3">
          {filteredPresets.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131922] border border-[#E6DFD7] dark:border-[#222D3D] hover:border-[#FF5500] transition-all flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-11 h-11 rounded-xl bg-[#FFF1EB] dark:bg-[#1C2432] flex items-center justify-center shrink-0 text-base">
                  {p.category === 'Government' || p.category === 'Jobs' ? (
                    '🏛️'
                  ) : p.category === 'Education' ? (
                    '🎓'
                  ) : p.name.toLowerCase().includes('passport') ? (
                    '🪪'
                  ) : p.name.toLowerCase().includes('visa') ? (
                    '🌍'
                  ) : (
                    '📄'
                  )}
                </div>
                <div className="truncate">
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA] block truncate">
                    {p.name}
                  </strong>
                  <span className="text-xs text-[#8E96A2] font-mono block">
                    {p.targetWidth}×{p.targetHeight} • {p.maxKb ? `≤ ${p.maxKb} KB` : '1:1'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleUsePreset(p)}
                  className="px-4 py-1.5 rounded-full bg-[#FFF1EB] dark:bg-[#251A15] border border-[#FED7C3] dark:border-[#3E2519] text-[#FF5500] font-bold text-xs hover:bg-[#FF5500] hover:text-white transition-all"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Requirements Disclaimer Note (Matches Figma Screenshot 2) */}
        <p className="text-[11px] text-[#8E96A2] text-center pt-2 px-4 leading-relaxed">
          Requirements vary by cycle — always verify on the official portal.
        </p>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
                Application Presets
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F6] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] text-[#5F6670] dark:text-[#9BA4B2]">
                {customPresets.length} / {isPro ? '∞' : FREE_CUSTOM_PRESET_LIMIT} custom presets
              </span>
            </div>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-1">
              Select pre-configured official portal specifications or save custom dimension profiles.
            </p>
          </div>

          <button
            onClick={handleAddPresetClick}
            className="px-4 h-10 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Custom Preset
          </button>
        </div>

        {/* Filter bar and search input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#FF5500] text-white shadow-sm'
                    : 'bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] text-[#5F6670] dark:text-[#9BA4B2] hover:border-[#FF5500]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8E96A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter presets..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-xs font-semibold outline-none focus:border-[#FF5500]"
            />
          </div>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] flex flex-col justify-between space-y-4 shadow-sm hover:border-[#FF5500] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                    {p.name}
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] shrink-0">
                    {p.formatLabel || 'JPG'}
                  </span>
                </div>

                <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
                  {p.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#FF5500]">
                  <span>{p.targetWidth} × {p.targetHeight} px</span>
                  <span>≤ {p.maxKb} KB</span>
                </div>

                {p.disclaimer && (
                  <p className="text-[10px] text-[#8E96A2] flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.disclaimer}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#F1ECE6] dark:border-[#242D3B]">
                <button
                  onClick={() => handleUsePreset(p)}
                  className="flex-1 h-9 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  Use Preset →
                </button>
                {p.isUserCreated && (
                  <button
                    onClick={() => {
                      deletePreset(p.id);
                      showToast('Custom preset deleted', 'info');
                    }}
                    className="p-2 rounded-lg border border-[#E6DFD7] text-gray-400 hover:text-red-500"
                    title="Delete custom preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
