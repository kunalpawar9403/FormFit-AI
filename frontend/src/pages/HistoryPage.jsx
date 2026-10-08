import React, { useState } from 'react';
import { SEO } from '../components/common/SEO.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  History,
  Download,
  Trash2,
  FileImage,
  PenTool,
  FileText,
  Clock,
} from 'lucide-react';

export function HistoryPage() {
  const { historyItems, deleteHistory, clearHistory, downloadHistory } = useApp();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('All');

  const filteredItems = historyItems.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Photos') return item.type === 'photo';
    if (filter === 'Signatures') return item.type === 'signature';
    if (filter === 'Documents') return item.type === 'document';
    return true;
  });

  const handleDownloadItem = async (item) => {
    try {
      const res = await downloadHistory(item);
      if (res.success) {
        showToast(`✓ Downloaded ${item.name}`, 'success');
      } else {
        showToast(res.message || 'File no longer available in storage', 'error');
      }
    } catch (err) {
      showToast('Download failed: ' + err.message, 'error');
    }
  };

  return (
    <>
      <SEO
        title="Processing History — FormFit AI"
        description="View, download, and manage your recent locally processed photos, signatures, and document PDFs."
      />

      <div className="max-w-4xl mx-auto space-y-6 pt-1 pb-10">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div>
            <h1 className="text-[32px] sm:text-2xl font-black tracking-tight text-[#1C1F23] dark:text-[#F5F7FA]">
              History
            </h1>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-0.5">
              Locally processed files stored in browser memory.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={() => {
                clearHistory();
                showToast('History cleared', 'info');
              }}
              className="px-3.5 py-1.5 rounded-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Photos', 'Signatures', 'Documents'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                filter === f
                  ? 'bg-[#FF5500] text-white shadow-sm'
                  : 'bg-white dark:bg-[#18202C] border border-[#E6DFD7] dark:border-[#222D3D] text-[#5F6670] dark:text-[#8E96A2]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8E96A2] space-y-2">
              <Clock className="w-8 h-8 mx-auto text-gray-300" />
              <p>No history items in this category yet.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] gap-3"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-white border border-[#E6DFD7] dark:border-[#2E3A4B] shrink-0 flex items-center justify-center">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileImage className="w-5 h-5 text-[#FF5500]" />
                    )}
                  </div>

                  <div className="truncate">
                    <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block truncate">
                      {item.name}
                    </strong>
                    <div className="text-[11px] font-mono text-[#8E96A2]">
                      {item.sizeKb} KB • {item.dimensions} • {item.format}
                    </div>
                    {item.preset && (
                      <span className="text-[10px] text-[#FF5500] font-semibold block truncate">
                        {item.preset}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadItem(item)}
                    className="p-2 rounded-lg bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#FF5500] transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      deleteHistory(item.id);
                      showToast('Item deleted', 'info');
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-[#151A22] border border-[#E6DFD7] dark:border-[#2E3A4B] text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
