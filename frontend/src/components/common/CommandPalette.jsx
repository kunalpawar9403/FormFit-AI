import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import {
  Search,
  Home,
  Camera,
  PenTool,
  FileText,
  FileStack,
  Sliders,
  History,
  Settings,
  Sun,
  Languages,
  X,
} from 'lucide-react';

export function CommandPalette() {
  const { isCmdPaletteOpen, setIsCmdPaletteOpen } = useApp();
  const { toggleTheme } = useTheme();
  const { cycleLang } = useI18n();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isCmdPaletteOpen) return null;

  const commands = [
    { id: 'home', label: 'Go Home', icon: Home, action: () => navigate('/') },
    { id: 'tools', label: 'Open Tools Hub', icon: Home, action: () => navigate('/tools') },
    { id: 'photo', label: 'Prepare Photo', icon: Camera, action: () => navigate('/photo') },
    { id: 'signature', label: 'Prepare Signature', icon: PenTool, action: () => navigate('/signature') },
    { id: 'document', label: 'Open Document Scanner', icon: FileText, action: () => navigate('/document') },
    { id: 'pdf', label: 'Open PDF Tools', icon: FileStack, action: () => navigate('/pdf') },
    { id: 'presets', label: 'Open Presets Catalog', icon: Sliders, action: () => navigate('/presets') },
    { id: 'history', label: 'Open Processing History', icon: History, action: () => navigate('/history') },
    { id: 'settings', label: 'Open Settings', icon: Settings, action: () => navigate('/settings') },
    { id: 'theme', label: 'Toggle Theme (Light / Dark)', icon: Sun, action: () => toggleTheme() },
    { id: 'lang', label: 'Change Language (EN / HI / MR)', icon: Languages, action: () => cycleLang() },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (cmd) => {
    cmd.action();
    setIsCmdPaletteOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsCmdPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <Search className="w-4 h-4 text-[#8E96A2]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#1C1F23] dark:text-[#F5F7FA] outline-none placeholder-[#8E96A2]"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#F6F3EF] dark:bg-[#1D2430] text-[10px] text-[#8E96A2] font-mono">ESC</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8E96A2]">No matching commands found.</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#1C1F23] dark:text-[#F5F7FA] hover:bg-[#FFF1EB] dark:hover:bg-[#FF5500]/15 hover:text-[#FF5500] transition-colors text-left font-medium"
                >
                  <Icon className="w-4 h-4 text-[#8E96A2] shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
