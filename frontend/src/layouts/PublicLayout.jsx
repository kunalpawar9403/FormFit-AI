import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.jsx';
import { MobileNav } from '../components/common/MobileNav.jsx';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import { CommandPalette } from '../components/common/CommandPalette.jsx';
import { ProModal, UserProfileModal } from '../components/modals/ProModal.jsx';
import { AddPresetModal } from '../components/modals/AddPresetModal.jsx';
import { PwaInstallModal } from '../components/modals/PwaInstallModal.jsx';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F6] dark:bg-[#0B0F15] text-[#1C1F23] dark:text-[#F5F7FA] transition-colors duration-200">
      {/* Mobile Top Header & Bottom Navigation Bar */}
      <MobileNav />

      {/* Desktop Navbar */}
      <Navbar />

      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Public Footer (Hidden on small mobile screens to keep app feel, or minimal) */}
      <footer className="hidden lg:block border-t border-[#F1ECE6] dark:border-[#242D3B] bg-white dark:bg-[#151A22] py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8E96A2]">
          <div className="flex items-center gap-3">
            <BrandLogo size={24} />
            <span className="text-[#5F6670] dark:text-[#9BA4B2]">Precision portal compliance engine</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/tools" className="hover:text-[#FF5500] transition-colors">Tools</Link>
            <Link to="/presets" className="hover:text-[#FF5500] transition-colors">Presets</Link>
            <Link to="/help" className="hover:text-[#FF5500] transition-colors">Help</Link>
            <Link to="/privacy" className="hover:text-[#FF5500] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#FF5500] transition-colors">Terms of Service</Link>
          </div>

          <div>© 2026 FormFit AI Technologies. 100% Client-Side Private.</div>
        </div>
      </footer>

      {/* Global Modals */}
      <CommandPalette />
      <ProModal />
      <UserProfileModal />
      <AddPresetModal />
      <PwaInstallModal />
    </div>
  );
}
