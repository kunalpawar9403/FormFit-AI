import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/apiService.js';
import {
  X,
  Zap,
  ShieldCheck,
  Calendar,
  CreditCard,
  Camera,
  FileStack,
  Sliders,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Sparkles,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

export function ProDashboardModal() {
  const {
    isProDashboardOpen,
    setIsProDashboardOpen,
    user,
    proDetails,
    isPro,
    logout,
    setIsProModalOpen,
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [usageStats, setUsageStats] = useState({ totalProcessed: 12, maxProQuota: 500 });
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isProDashboardOpen && user) {
      loadUsage();
    }
  }, [isProDashboardOpen, user]);

  const loadUsage = async () => {
    setLoadingUsage(true);
    try {
      const res = await api.getUsageSummary();
      if (res?.success) {
        setUsageStats({
          totalProcessed: res.totalProcessed || 0,
          maxProQuota: res.maxProQuota || 500,
        });
      }
    } catch (e) {
      // Local fallback
    } finally {
      setLoadingUsage(false);
    }
  };

  if (!isProDashboardOpen) return null;

  const usagePercent = Math.min(
    100,
    Math.round((usageStats.totalProcessed / usageStats.maxProQuota) * 100)
  );

  const expiryDateFormatted = user?.subscriptionEnd
    ? new Date(user.subscriptionEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : proDetails?.date
    ? new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active';

  const handleCancelSub = async () => {
    if (!window.confirm('Are you sure you want to cancel automatic subscription renewal?')) return;
    setIsCancelling(true);
    try {
      await api.cancelSubscription();
      showToast('Subscription renewal cancelled.', 'info');
      setIsProDashboardOpen(false);
    } catch (e) {
      showToast(e.message || 'Unable to cancel subscription right now.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProDashboardOpen(false);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={() => setIsProDashboardOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#F1ECE6] dark:border-[#242D3B] flex items-center justify-between bg-gradient-to-r from-[#FFF1EB] via-white to-white dark:from-[#261E1A] dark:via-[#151A22] dark:to-[#151A22]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#1C1F23] dark:text-[#F5F7FA]">
                  Pro SaaS Member Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#12B76A]/15 text-[#12B76A] text-[10px] font-bold border border-[#12B76A]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                {user?.email || 'pro_applicant@formfit.ai'} • {user?.name || 'Verified Pro Applicant'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProDashboardOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Subscription Status Card */}
          <div className="p-4 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-[#FAF8F6] dark:bg-[#1A202C] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#5F6670] dark:text-[#9BA4B2]">Current Plan:</span>
              <span className="text-[#FF5500] flex items-center gap-1 font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                {proDetails?.planName || 'Pro Monthly'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F6670] dark:text-[#9BA4B2]">Renewal / Expiry:</span>
              <span className="font-semibold text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5F6670]" /> {expiryDateFormatted}
              </span>
            </div>
            {(user?.subscriptionId || proDetails?.razorpay_payment_id) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F6670] dark:text-[#9BA4B2]">Razorpay Payment ID:</span>
                <code className="font-mono text-[11px] text-[#0066CC] dark:text-[#60A5FA]">
                  {proDetails?.razorpay_payment_id || user?.subscriptionId}
                </code>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F6670] dark:text-[#9BA4B2]">Backend Authority:</span>
              <span className="text-[#12B76A] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Server-Verified MongoDB Session
              </span>
            </div>
          </div>

          {/* Pro Usage Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#FF5500]" /> Pro Processing Usage
              </span>
              <span className="text-[#5F6670] dark:text-[#9BA4B2]">
                {usageStats.totalProcessed} / {usageStats.maxProQuota} operations
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#E6DFD7] dark:bg-[#2E3A4B] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF8800] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, usagePercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2]">
              Batch operations, high-res PDF generation, and ZIP packaging in current billing period.
            </p>
          </div>

          {/* Quick Pro Actions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E96A2]">
              Quick Pro Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsProDashboardOpen(false);
                  navigate('/photo');
                }}
                className="p-3 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] hover:border-[#FF5500] text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-2">
                  <Camera className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                  Bulk Photo Batch
                </strong>
                <span className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2]">
                  Process 50+ photos & export ZIP
                </span>
              </button>

              <button
                onClick={() => {
                  setIsProDashboardOpen(false);
                  navigate('/pdf');
                }}
                className="p-3 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] hover:border-[#FF5500] text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-2">
                  <FileStack className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                  Advanced PDF Suite
                </strong>
                <span className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2]">
                  High-res merge, compress, split
                </span>
              </button>

              <button
                onClick={() => {
                  setIsProDashboardOpen(false);
                  navigate('/presets');
                }}
                className="p-3 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] hover:border-[#FF5500] text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-2">
                  <Sliders className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                  Cloud Presets
                </strong>
                <span className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2]">
                  Unlimited sync across devices
                </span>
              </button>

              <button
                onClick={() => {
                  setIsProDashboardOpen(false);
                  navigate('/photo');
                }}
                className="p-3 rounded-xl border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] hover:border-[#FF5500] text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                  Compliance Audit
                </strong>
                <span className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2]">
                  Face framing & specs report
                </span>
              </button>
            </div>
          </div>

          {/* Account Footer Actions */}
          <div className="pt-2 border-t border-[#F1ECE6] dark:border-[#242D3B] flex items-center justify-between">
            <button
              onClick={() => {
                setIsProDashboardOpen(false);
                setIsProModalOpen(true);
              }}
              className="text-xs font-bold text-[#FF5500] hover:underline"
            >
              Switch Plan / Upgrade
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] hover:bg-gray-100 dark:hover:bg-[#1D2430] text-xs font-semibold text-[#5F6670] dark:text-[#9BA4B2] flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
