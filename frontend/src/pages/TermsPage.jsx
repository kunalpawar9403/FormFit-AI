import React from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service — FormFit AI"
        description="Terms and conditions governing the use of FormFit AI application file preparation tools."
      />

      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">Terms of Service</h1>
            <p className="text-xs text-[#8E96A2]">Last updated: October 2026</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4 text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FormFit AI, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">2. Application Requirements & Disclaimers</h2>
            <p>
              While FormFit AI provides pre-configured dimension and file size templates based on official public notices (e.g. UPSC, SSC, US Visa DS-160, Passport Seva), portal requirements may change per examination cycle. Users are solely responsible for cross-checking final requirements with their specific official application portal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">3. Intellectual Property</h2>
            <p>
              You retain all ownership rights to any images, signatures, or documents you process through FormFit AI.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="text-6xl font-extrabold text-[#FF5500]">404</div>
      <h1 className="text-xl font-bold text-[#1C1F23] dark:text-[#F5F7FA]">Page Not Found</h1>
      <p className="text-xs text-[#8E96A2] max-w-sm">
        The requested URL was not found. Use the buttons below to return to the application tools.
      </p>
      <div className="flex gap-3 pt-2">
        <a href="/" className="px-4 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold">
          Go Home
        </a>
        <a href="/tools" className="px-4 py-2 rounded-xl border border-[#E6DFD7] text-xs font-bold">
          Open Tools
        </a>
      </div>
    </div>
  );
}
