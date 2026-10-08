import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { Sun, Moon, Search, Sparkles } from 'lucide-react';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { lang, cycleLang, t } = useI18n();
  const { setIsCmdPaletteOpen } = useApp();

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-[#FAF8F6]/90 dark:bg-[#0E1217]/90 backdrop-blur-md border-b border-[#F1ECE6] dark:border-[#242D3B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#FF5500] font-semibold'
                  : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA]'
              }`
            }
          >
            {t('home')}
          </NavLink>
          <NavLink
            to="/tools"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#FF5500] font-semibold'
                  : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA]'
              }`
            }
          >
            {t('navTools')}
          </NavLink>
          <NavLink
            to="/presets"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#FF5500] font-semibold'
                  : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA]'
              }`
            }
          >
            {t('navPresets')}
          </NavLink>
          <a
            href="/#pricing"
            className="text-sm font-medium text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA] transition-colors"
          >
            {t('navPricing')}
          </a>
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#FF5500] font-semibold'
                  : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23] dark:hover:text-[#F5F7FA]'
              }`
            }
          >
            {t('navHelp')}
          </NavLink>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Cmd+K trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-xs text-[#8E96A2] hover:border-[#FF5500] transition-colors"
            title="Quick Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#5F6670] dark:text-[#9BA4B2]" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F6F3EF] dark:bg-[#1D2430] text-[10px] font-mono">⌘K</kbd>
          </button>

          {/* Language Switcher */}
          <button
            onClick={cycleLang}
            className="px-2.5 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] hover:border-[#FF5500] transition-colors"
            title="Change Language (English / हिंदी / मराठी)"
          >
            {lang.toUpperCase()}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#F79009]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
