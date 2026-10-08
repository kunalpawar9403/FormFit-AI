import React, { useState } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { Search, ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does FormFit AI compress files without losing required dimensions?',
      a: 'FormFit AI uses a binary search JPEG quality optimization algorithm on HTML5 Canvas2D. It locks the exact pixel width and height you specify (e.g. 200 × 230 px) and iteratively adjusts encoding quality until the resulting Blob size falls directly below your target KB limit.',
    },
    {
      q: 'Are my photos, signatures, and certificates uploaded to any servers?',
      a: 'No. FormFit AI runs 100% locally in your browser memory for all supported image and PDF operations. Your photos and personal documents never leave your device, ensuring complete confidentiality.',
    },
    {
      q: 'How do I draw or clean a signature for government exams?',
      a: 'You can sign directly using your finger, stylus, or mouse in the Signature tool. Alternatively, upload a photo of your signature on paper, and FormFit AI will automatically remove paper background shadows and output clean transparent PNG ink.',
    },
    {
      q: 'How does the Document Scanner generate multi-page PDFs?',
      a: 'You can upload or capture multiple certificate pages. Reorder, enhance contrast/brightness, and click "Generate PDF". The client-side engine uses jsPDF to compile verified A4-sized PDF documents instantly.',
    },
    {
      q: 'What if an official portal rejects my file for being too large?',
      a: 'Go to the Requirements panel in the Photo tool, reduce the Max File Size slider (e.g., set to 40 KB instead of 50 KB to give a safety margin), and click Process Photo. The engine will compress within the new boundary.',
    },
    {
      q: 'Can I add custom presets for my college or state exams?',
      a: 'Yes. In the Presets catalog, click "+ Add Custom Preset", specify the required width, height, and maximum KB, and save it. It will be stored locally on your device and will survive page refreshes.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Help Center & FAQs — FormFit AI"
        description="Find answers to common questions about photo compression, signature extraction, and portal requirements."
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-3 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
            Help Center & Support
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6670] dark:text-[#9BA4B2] max-w-md mx-auto">
            Everything you need to know about preparing compliant application files.
          </p>

          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-4 h-4 text-[#8E96A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles & FAQs..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#151A22] text-xs font-semibold outline-none focus:border-[#FF5500] shadow-sm"
            />
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] divide-y divide-[#F1ECE6] dark:divide-[#242D3B]">
          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8E96A2]">
              No help articles found matching "{searchQuery}".
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-[#1C1F23] dark:text-[#F5F7FA] hover:text-[#FF5500] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8E96A2] shrink-0 transition-transform duration-200 ${
                      openIndex === idx ? 'rotate-180 text-[#FF5500]' : ''
                    }`}
                  />
                </button>
                {openIndex === idx && (
                  <p className="mt-2 text-xs text-[#5F6670] dark:text-[#9BA4B2] leading-relaxed animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support Card */}
        <div className="p-5 rounded-2xl bg-[#FFF1EB] dark:bg-[#FF5500]/10 border border-[#FED7C3] dark:border-[#FF5500]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                Need assistance with a specific application portal?
              </strong>
              <span className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2]">
                Our portal specifications team updates requirements regularly.
              </span>
            </div>
          </div>

          <a
            href="mailto:support@formfit.ai"
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#151A22] text-[#FF5500] border border-[#FED7C3] text-xs font-bold shrink-0 hover:bg-[#FF5500] hover:text-white transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}
