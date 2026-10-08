import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  Home,
  Camera,
  PenTool,
  FileText,
  FileStack,
  Sliders,
  History,
  Settings,
  HelpCircle,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

export function Sidebar() {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const { setIsProModalOpen, setIsUserProfileOpen, setIsProDashboardOpen, isPro, proDetails } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const navItems = [
    { to: '/tools', icon: Home, label: t('home') },
    { to: '/photo', icon: Camera, label: t('photoToolName') },
    { to: '/signature', icon: PenTool, label: t('sigToolName') },
    { to: '/document', icon: FileText, label: t('docToolName') },
    { to: '/pdf', icon: FileStack, label: t('pdfToolName') },
    { to: '/presets', icon: Sliders, label: t('navPresets') },
    { to: '/history', icon: History, label: t('history') },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    if (q.includes('photo') || q.includes('passport')) navigate('/photo');
    else if (q.includes('sign')) navigate('/signature');
    else if (q.includes('doc') || q.includes('scan')) navigate('/document');
    else if (q.includes('pdf')) navigate('/pdf');
    else if (q.includes('preset') || q.includes('visa') || q.includes('upsc')) navigate('/presets');
    else if (q.includes('hist')) navigate('/history');
    else if (q.includes('help')) navigate('/help');
    else if (q.includes('set')) navigate('/settings');
    else navigate(`/presets?q=${encodeURIComponent(q)}`);
  };

  return (
    <aside className="hidden lg:flex w-60 bg-white dark:bg-[#151A22] border-r border-[#F1ECE6] dark:border-[#242D3B] flex-col shrink-0 h-screen sticky top-0 transition-colors duration-200">
      {/* Top Header Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#F1ECE6] dark:border-[#242D3B]">
        <BrandLogo />
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#8E96A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[#F6F3EF] dark:bg-[#1D2430] border border-transparent focus:border-[#FF5500] focus:bg-white dark:focus:bg-[#12161D] text-[#1C1F23] dark:text-[#F5F7FA] outline-none transition-all placeholder-[#8E96A2]"
          />
        </form>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500]'
                    : 'text-[#5F6670] dark:text-[#9BA4B2] hover:bg-[#F6F3EF] dark:hover:bg-[#1D2430] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Nav & Pro Card */}
      <div className="p-3 border-t border-[#F1ECE6] dark:border-[#242D3B] space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? 'bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500]'
                : 'text-[#5F6670] dark:text-[#9BA4B2] hover:bg-[#F6F3EF] dark:hover:bg-[#1D2430]'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>{t('settings')}</span>
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? 'bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500]'
                : 'text-[#5F6670] dark:text-[#9BA4B2] hover:bg-[#F6F3EF] dark:hover:bg-[#1D2430]'
            }`
          }
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{t('navHelp')}</span>
        </NavLink>

        {/* Pro Banner */}
        <div
          onClick={() => (isPro ? setIsProDashboardOpen(true) : setIsProModalOpen(true))}
          className={`p-3 rounded-xl border cursor-pointer transition-all group ${
            isPro
              ? 'bg-gradient-to-br from-[#E6F9F0] to-[#D1F7E5]/50 dark:from-[#112920] dark:to-[#17382B] border-[#A6F4C5] dark:border-[#12B76A]/40'
              : 'bg-gradient-to-br from-[#FFF1EB] to-[#FED7C3]/40 dark:from-[#261E1A] dark:to-[#1D2430] border-[#FED7C3] dark:border-[#FF5500]/30 hover:border-[#FF5500]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-0.5">
            <span className={`flex items-center gap-1.5 ${isPro ? 'text-[#12B76A]' : 'text-[#FF5500]'}`}>
              <Zap className={`w-3.5 h-3.5 ${isPro ? 'fill-[#12B76A]' : 'fill-[#FF5500]'}`} />
              {isPro ? (proDetails?.planName || 'Pro Active') : 'FormFit Pro'}
            </span>
            <span
              className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold transition-transform ${
                isPro ? 'bg-[#12B76A]' : 'bg-[#FF5500] group-hover:scale-105'
              }`}
            >
              {isPro ? 'ACTIVE' : '₹99+'}
            </span>
          </div>
          <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] leading-tight">
            {isPro
              ? 'Razorpay Sandbox Active • All Pro tools unlocked'
              : 'Batch export ZIPs & multi-page PDF scanning tools'}
          </p>
        </div>
      </div>
    </aside>
  );
}
