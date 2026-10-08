import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { MobileNav } from '../components/common/MobileNav.jsx';
import { CommandPalette } from '../components/common/CommandPalette.jsx';
import { ProModal, UserProfileModal } from '../components/modals/ProModal.jsx';
import { AuthModal } from '../components/modals/AuthModal.jsx';
import { ProDashboardModal } from '../components/modals/ProDashboardModal.jsx';
import { AddPresetModal } from '../components/modals/AddPresetModal.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { Sun, Moon, Search, Sparkles, Shield, Zap, User, LogIn } from 'lucide-react';

export function AppLayout() {
  const { isDark, toggleTheme } = useTheme();
  const { lang, cycleLang } = useI18n();
  const {
    setIsCmdPaletteOpen,
    setIsUserProfileOpen,
    setIsProModalOpen,
    setIsProDashboardOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    isPro,
    proDetails,
    user,
  } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F6] dark:bg-[#0B0F15] text-[#1C1F23] dark:text-[#F5F7FA] transition-colors duration-200">
      {/* Mobile Top & Bottom Navigation */}
      <MobileNav />

      {/* Desktop Left Persistent Sidebar */}
      <Sidebar />

      {/* Main Workspace Studio Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Topbar Header */}
        <header className="hidden lg:flex h-16 px-8 items-center justify-between border-b border-[#F1ECE6] dark:border-[#242D3B] bg-white dark:bg-[#151A22] shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCmdPaletteOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-[#F6F3EF] dark:bg-[#1D2430] text-xs text-[#8E96A2] hover:border-[#FF5500] w-64 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-[#5F6670] dark:text-[#9BA4B2]" />
              <span>Search commands, tools...</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white dark:bg-[#151A22] text-[10px] font-mono">⌘K</kbd>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#12B76A]/30 bg-[#ECFDF3] dark:bg-[#12B76A]/10 text-[#12B76A] text-[11px] font-bold">
              <Shield className="w-3 h-3" />
              <span>100% Client-Side Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pro Status or Upgrade Button */}
            {isPro ? (
              <button
                onClick={() => setIsProDashboardOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#12B76A]/15 to-[#12B76A]/25 border border-[#12B76A]/40 text-[#12B76A] text-xs font-extrabold hover:bg-[#12B76A]/30 transition-all"
                title="View Pro Subscription Dashboard"
              >
                <Zap className="w-3.5 h-3.5 fill-[#12B76A]" />
                <span>{proDetails?.planName || 'PRO ACTIVE'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsProModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 border border-[#FED7C3] dark:border-[#FF5500]/30 hover:border-[#FF5500] text-[#FF5500] text-xs font-bold transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF5500]" />
                <span>Upgrade to Pro</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={cycleLang}
              className="px-2.5 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] hover:border-[#FF5500] transition-colors"
              title="Change Language"
            >
              {lang.toUpperCase()}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-[#E6DFD7] dark:border-[#2E3A4B] flex items-center justify-center text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] hover:border-[#FF5500] transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#F79009]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Avatar (Only when logged in) / Sign In (When guest) */}
            {user ? (
              <button
                onClick={() => setIsUserProfileOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#FF5500] transition-colors bg-[#F6F3EF] dark:bg-[#1D2430]"
                title={`${user.name || 'User'} (${user.email || ''})`}
              >
                <div className="w-7 h-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center font-bold text-xs uppercase relative">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border-2 border-white dark:border-[#151A22] rounded-full ${
                      isPro ? 'bg-[#12B76A]' : 'bg-[#FF5500]'
                    }`}
                  />
                </div>
                <span className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] max-w-[90px] truncate hidden xl:inline">
                  {user.name?.split(' ')[0] || 'Account'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                title="Sign in to your account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Subpage Body */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <ProModal />
      <AuthModal />
      <ProDashboardModal />
      <UserProfileModal />
      <AddPresetModal />
    </div>
  );
}
