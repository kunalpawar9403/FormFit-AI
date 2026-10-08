import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  Home,
  LayoutGrid,
  Columns2,
  RotateCcw,
  Settings,
  Sun,
  Moon,
  Search,
  X,
  Shield,
  Zap,
  LogIn,
  Download,
} from 'lucide-react';

export function MobileNav() {
  const { t, lang, cycleLang } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const { user, isPro, setIsUserProfileOpen, setIsAuthModalOpen, setAuthModalMode, setIsCmdPaletteOpen, isInstallable, promptInstall } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isTools =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/signature') ||
    location.pathname.startsWith('/document') ||
    location.pathname.startsWith('/pdf') ||
    location.pathname.startsWith('/photo');
  const isPresets = location.pathname.startsWith('/presets');
  const isHistory = location.pathname.startsWith('/history');
  const isSettings = location.pathname.startsWith('/settings');

  // We show the brand top header on public/home pages and generic subpages that don't have dedicated mobile headers
  const showTopHeader = isHome || location.pathname === '/privacy' || location.pathname === '/terms' || location.pathname === '/help';

  return (
    <>
      {/* Mobile Top Header (Figma Image 4 layout on Home & static pages) */}
      {showTopHeader && (
        <header className="lg:hidden sticky top-0 z-40 bg-[#FAF8F6]/95 dark:bg-[#0B0F15]/95 backdrop-blur-md border-b border-[#F1ECE6] dark:border-[#1E2633] h-14 px-4 flex items-center justify-between transition-colors">
          <BrandLogo size={28} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCmdPaletteOpen(true)}
              className="w-9 h-9 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
              title="Quick Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Switcher (Matches Figma Screenshot 4 Moon Icon) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-[#E6DFD7] dark:border-[#222D3D] bg-white dark:bg-[#151B24] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Moon className="w-4 h-4 text-[#FF5500]" /> : <Sun className="w-4 h-4 text-[#F79009]" />}
            </button>
          </div>
        </header>
      )}

      {/* Drawer menu if accessed */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-72 bg-white dark:bg-[#151B24] h-full p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
              <BrandLogo size={28} />
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Section */}
            {user ? (
              <div
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsUserProfileOpen(true);
                }}
                className="my-4 p-3 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] flex items-center justify-between cursor-pointer border border-[#E6DFD7] dark:border-[#2E3A4B]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FF5500] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <strong className="text-xs text-[#1C1F23] dark:text-[#F5F7FA] block truncate max-w-[130px]">
                      {user.name || 'Account'}
                    </strong>
                    <span className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2] block truncate max-w-[130px]">
                      {user.email}
                    </span>
                  </div>
                </div>
                {isPro && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#12B76A] text-white font-bold shrink-0">
                    PRO
                  </span>
                )}
              </div>
            ) : (
              <div className="my-4 p-3 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] flex items-center justify-between border border-[#E6DFD7] dark:border-[#2E3A4B]">
                <div>
                  <strong className="text-xs text-[#1C1F23] dark:text-[#F5F7FA] block">Guest Session</strong>
                  <span className="text-[10px] text-[#12B76A] font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Private Browser
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white text-xs font-bold flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {[
                { to: '/', label: 'Home' },
                { to: '/tools', label: 'Tools' },
                { to: '/photo', label: 'Photo Studio' },
                { to: '/signature', label: 'Signature Studio' },
                { to: '/document', label: 'Document Scanner' },
                { to: '/pdf', label: 'PDF Suite' },
                { to: '/presets', label: 'Presets Catalog' },
                { to: '/history', label: 'History' },
                { to: '/settings', label: 'Settings' },
                { to: '/help', label: 'Help Center' },
              ].map((link) => (
                <button
                  key={link.to}
                  onClick={() => {
                    navigate(link.to);
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === link.to
                      ? 'bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500]'
                      : 'text-[#5F6670] dark:text-[#9BA4B2] hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Install PWA Button */}
            <div className="pt-3 border-t border-[#F1ECE6] dark:border-[#242D3B] mt-2">
              <button
                onClick={async () => {
                  if (isInstallable) {
                    await promptInstall();
                  } else {
                    alert('To install FormFit AI on your device:\n\n• On Android Chrome: Tap browser menu (⋮) > "Add to Home screen" or "Install App".\n• On iOS Safari: Tap Share (⎋) > "Add to Home Screen".\n• On Desktop Chrome/Edge: Click the install icon (⊕) in the browser address bar.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF5500] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install FormFit App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Figma 5-Tab Persistent Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F6]/95 dark:bg-[#0B0F15]/95 backdrop-blur-xl border-t border-[#EAE5DF] dark:border-[#1E2633] h-16 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] transition-colors select-none">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
              isHome
                ? 'text-[#FF5500]'
                : 'text-[#768294] dark:text-[#808D9F] hover:text-[#FF5500]'
            }`
          }
        >
          <Home className="w-5 h-5 transition-transform" />
          <span className="mt-1 leading-none">{t('home')}</span>
        </NavLink>

        {/* 2. Tools (Grid icon matching Figma Image 3 & 4) */}
        <NavLink
          to="/tools"
          className={
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
              isTools
                ? 'text-[#FF5500]'
                : 'text-[#768294] dark:text-[#808D9F] hover:text-[#FF5500]'
            }`
          }
        >
          <LayoutGrid className="w-5 h-5 transition-transform" />
          <span className="mt-1 leading-none">{t('navTools')}</span>
        </NavLink>

        {/* 3. Presets (Columns2 split icon matching Figma Image 2 & 4) */}
        <NavLink
          to="/presets"
          className={
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
              isPresets
                ? 'text-[#FF5500]'
                : 'text-[#768294] dark:text-[#808D9F] hover:text-[#FF5500]'
            }`
          }
        >
          <Columns2 className="w-5 h-5 transition-transform" />
          <span className="mt-1 leading-none">{t('navPresets')}</span>
        </NavLink>

        {/* 4. History (RotateCcw / History icon matching Figma Image 1-4) */}
        <NavLink
          to="/history"
          className={
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
              isHistory
                ? 'text-[#FF5500]'
                : 'text-[#768294] dark:text-[#808D9F] hover:text-[#FF5500]'
            }`
          }
        >
          <RotateCcw className="w-5 h-5 transition-transform" />
          <span className="mt-1 leading-none">{t('history')}</span>
        </NavLink>

        {/* 5. Settings (Gear icon matching Figma Image 1) */}
        <NavLink
          to="/settings"
          className={
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
              isSettings
                ? 'text-[#FF5500]'
                : 'text-[#768294] dark:text-[#808D9F] hover:text-[#FF5500]'
            }`
          }
        >
          <Settings className="w-5 h-5 transition-transform" />
          <span className="mt-1 leading-none">{t('settings')}</span>
        </NavLink>
      </nav>
    </>
  );
}
