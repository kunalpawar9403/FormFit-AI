import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { X, Sparkles } from 'lucide-react';

export function AddPresetModal() {
  const { isAddPresetModalOpen, setIsAddPresetModalOpen, addCustomPreset, applyPresetToPhoto } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetWidth, setTargetWidth] = useState(350);
  const [targetHeight, setTargetHeight] = useState(350);
  const [maxKb, setMaxKb] = useState(50);
  const [format, setFormat] = useState('JPG');

  if (!isAddPresetModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a preset name', 'error');
      return;
    }

    const preset = addCustomPreset({
      name: name.trim(),
      description: description.trim() || `${targetWidth}×${targetHeight} px, max ${maxKb} KB`,
      category: 'General',
      targetWidth: parseInt(targetWidth, 10) || 300,
      targetHeight: parseInt(targetHeight, 10) || 300,
      maxKb: parseInt(maxKb, 10) || 50,
      minKb: 10,
      format,
      formatLabel: format,
      aspectRatio: `${targetWidth}:${targetHeight}`,
    });

    applyPresetToPhoto(preset);
    showToast(`✓ Custom preset "${preset.name}" created & applied!`, 'success');
    setIsAddPresetModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={() => setIsAddPresetModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <h3 className="font-extrabold text-lg text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5500]" />
            + Add Custom Preset
          </h3>
          <button
            onClick={() => setIsAddPresetModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">Preset Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. State Board Examination"
              required
              className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">Width (px)</label>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => setTargetWidth(e.target.value)}
                min="50"
                max="4000"
                required
                className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">Height (px)</label>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => setTargetHeight(e.target.value)}
                min="50"
                max="4000"
                required
                className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">Max File Size (KB)</label>
              <input
                type="number"
                value={maxKb}
                onChange={(e) => setMaxKb(e.target.value)}
                min="5"
                max="5000"
                required
                className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              >
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Save & Apply Preset
          </button>
        </form>
      </div>
    </div>
  );
}
