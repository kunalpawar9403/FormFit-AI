import React from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy — FormFit AI"
        description="FormFit AI operates on a local-first browser architecture where your personal documents remain on your device."
      />

      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#12B76A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">Privacy Policy</h1>
            <p className="text-xs text-[#8E96A2]">Last updated: October 2026</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-4 text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">1. Local-First Processing Architecture</h2>
            <p>
              FormFit AI is engineered from the ground up to operate locally within your browser. All core operations — including image cropping, JPEG quality compression, signature background extraction, and PDF compilation — are executed on your local machine using standard HTML5 Canvas and WebAssembly engines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">2. No Cloud File Storage</h2>
            <p>
              We do not operate backend file-processing servers. The photos, signatures, marksheets, and certificates you prepare are never uploaded to any remote server or stored in any cloud database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">3. Client-Side Browser Storage</h2>
            <p>
              Your processing history and custom presets are stored exclusively in your browser’s local storage (LocalStorage / IndexedDB). You can delete your history items at any time through the History and Settings pages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">4. Contact & Inquiries</h2>
            <p>
              For privacy-related inquiries, reach out to our team at <strong>privacy@formfit.ai</strong>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
