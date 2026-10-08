import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  X,
  Zap,
  Check,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Lock,
  RefreshCw,
  Sparkles,
  Clock,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';
import {
  PRICING_PLANS,
  RAZORPAY_TEST_KEY,
  TEST_CARDS,
  TEST_UPI_IDS,
  TEST_NETBANKING_BANKS,
  launchRazorpayCheckout,
  simulateTestPayment,
} from '../../services/razorpayService.js';

export function ProModal() {
  const {
    isProModalOpen,
    setIsProModalOpen,
    activatePro,
    isPro,
    proDetails,
    user,
    setIsAuthModalOpen,
    setPendingProUpgrade,
    proModalFeature,
    setProModalFeature,
  } = useApp();
  const { showToast } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState('pro_monthly');
  const [view, setView] = useState('plans'); // 'plans' | 'simulator'
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [simStatus, setSimStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

  // Card Simulator Form State
  const [cardNumber, setCardNumber] = useState(TEST_CARDS[0].number);
  const [cardExpiry, setCardExpiry] = useState(TEST_CARDS[0].expiry);
  const [cardCvv, setCardCvv] = useState(TEST_CARDS[0].cvv);
  const [cardName, setCardName] = useState('FormFit Applicant');

  // UPI Form State
  const [upiVpa, setUpiVpa] = useState(TEST_UPI_IDS[0].vpa);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState(TEST_NETBANKING_BANKS[0].id);

  if (!isProModalOpen) return null;

  const selectedPlan =
    PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[1];

  const handleLaunchOfficialCheckout = async () => {
    // If not authenticated, require registration/login first to bind Pro subscription
    if (!user) {
      setPendingProUpgrade(true);
      setIsProModalOpen(false);
      setIsAuthModalOpen(true);
      showToast('Please create an account or sign in to activate your Pro plan.', 'info');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const launched = await launchRazorpayCheckout({
        plan: selectedPlan,
        user: { name: user?.name || 'Applicant User', email: user?.email || 'applicant@formfit.ai' },
        onSuccess: (paymentInfo) => {
          setIsProcessing(false);
          activatePro(paymentInfo);
          setLastPaymentResult(paymentInfo);
          setSimStatus('success');
          showToast(
            `✓ Razorpay Test Payment (₹${paymentInfo.amount}) verified! Pro activated.`,
            'success'
          );
        },
        onFailure: (err) => {
          setIsProcessing(false);
          showToast(err.message || 'Payment closed.', 'info');
        },
      });

      if (!launched) {
        setIsProcessing(false);
        setView('simulator');
        showToast('Switched to Razorpay Test Simulator mode.', 'info');
      }
    } catch (e) {
      setIsProcessing(false);
      setView('simulator');
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setSimStatus(null);
    setErrorMessage('');

    let shouldFail = false;
    let details = {};

    if (activeTab === 'card') {
      const matchedTestCard = TEST_CARDS.find(
        (c) => c.number.replace(/\s+/g, '') === cardNumber.replace(/\s+/g, '')
      );
      if (matchedTestCard?.status === 'failed') {
        shouldFail = true;
      }
      details = {
        cardNumberMasked: `•••• •••• •••• ${cardNumber.slice(-4)}`,
        name: cardName,
      };
    } else if (activeTab === 'upi') {
      if (upiVpa.includes('failure')) {
        shouldFail = true;
      }
      details = { vpa: upiVpa };
    } else if (activeTab === 'netbanking') {
      const bank = TEST_NETBANKING_BANKS.find((b) => b.id === selectedBank);
      details = { bank: bank?.name || selectedBank };
    }

    try {
      const result = await simulateTestPayment({
        plan: selectedPlan,
        method: activeTab,
        details,
        shouldFail,
      });

      setIsProcessing(false);
      setLastPaymentResult(result);
      setSimStatus('success');
      activatePro(result);
      showToast(
        `✓ Razorpay Sandbox: ₹${result.amount} received (${result.razorpay_payment_id})`,
        'success'
      );
    } catch (err) {
      setIsProcessing(false);
      setSimStatus('error');
      setErrorMessage(
        err.message || 'Transaction was declined by Razorpay test gateway simulator.'
      );
    }
  };

  const handleClose = () => {
    setIsProModalOpen(false);
    setView('plans');
    setSimStatus(null);
    setIsProcessing(false);
    if (setProModalFeature) setProModalFeature(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] p-5 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-[#FF5500]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C1F23] dark:text-[#F5F7FA]">
                  {view === 'simulator' ? 'Razorpay Test Sandbox' : 'FormFit AI Pro Pricing'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#0066CC] dark:bg-[#0A2540] dark:text-[#60A5FA] border border-[#B9E6FE] dark:border-[#1E3A8A]">
                  Test Mode
                </span>
              </div>
              <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2]">
                Key ID:{' '}
                <code className="font-mono text-[11px] text-[#FF5500] bg-[#FFF1EB] dark:bg-[#FF5500]/10 px-1 py-0.5 rounded">
                  {RAZORPAY_TEST_KEY.slice(0, 16)}...
                </code>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlight Banner (if opened from a Pro feature gate) */}
        {proModalFeature && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFF1EB] to-[#FFF8F5] dark:from-[#261E1A] dark:to-[#1D2430] border border-[#FF5500]/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <strong className="text-xs font-extrabold text-[#FF5500] block">
                PRO FEATURE: {proModalFeature}
              </strong>
              <span className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2]">
                Upgrade now to unlock bulk operations, ZIP downloads, and unlimited portal presets.
              </span>
            </div>
          </div>
        )}

        {/* Guest Auth Notice */}
        {!user && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#0066CC]" />
              <span>Create account or sign in to bind subscription to your profile.</span>
            </div>
            <button
              onClick={() => {
                setPendingProUpgrade(true);
                setIsProModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="font-bold underline shrink-0 ml-2 hover:text-blue-900 dark:hover:text-blue-100"
            >
              Sign In →
            </button>
          </div>
        )}

        {/* View 1: Plan Selector View */}
        {view === 'plans' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Active Pro Status Banner if already Pro */}
            {isPro && (
              <div className="p-3 bg-[#E6F9F0] dark:bg-[#112920] border border-[#A6F4C5] dark:border-[#12B76A]/40 rounded-xl flex items-center justify-between text-xs text-[#12B76A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    <strong>Pro Active:</strong> {proDetails?.planName || 'FormFit Pro'} (
                    {proDetails?.razorpay_payment_id || 'Test Pass'})
                  </span>
                </div>
                <span className="font-semibold text-[11px]">Active</span>
              </div>
            )}

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative text-left ${
                      isSelected
                        ? 'border-[#FF5500] bg-[#FFF8F5] dark:bg-[#201815] shadow-sm'
                        : 'border-[#E6DFD7] dark:border-[#2E3A4B] hover:border-[#D1C9BE] bg-white dark:bg-[#1A202C]'
                    }`}
                  >
                    {plan.badge && (
                      <span
                        className={`absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          plan.popular
                            ? 'bg-[#FF5500] text-white shadow-sm'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-sm font-bold text-[#1C1F23] dark:text-[#F5F7FA]">
                          {plan.name}
                        </strong>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#FF5500] bg-[#FF5500] text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="mt-2 mb-2">
                        <span className="text-2xl font-extrabold text-[#1C1F23] dark:text-white">
                          ₹{plan.priceInr}
                        </span>
                        <span className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] ml-1">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5F6670] dark:text-[#9BA4B2] leading-snug">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#F1ECE6] dark:border-[#2D3748]">
                      <span className="text-[10px] text-[#8E96A2] block">
                        Approx {plan.priceUsd} USD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Details & Feature Bullets */}
            <div className="p-3.5 rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-2 text-left">
              <span className="text-xs font-bold text-[#1C1F23] dark:text-[#F5F7FA] block">
                Included in {selectedPlan.name}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlan.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-xs text-[#5F6670] dark:text-[#9BA4B2]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#12B76A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Mode Guarantee Strip */}
            <div className="p-3 rounded-xl bg-[#FFF9E6] dark:bg-[#2B2312] border border-[#FFE082] dark:border-[#6B5515] flex items-center gap-2.5 text-left">
              <ShieldCheck className="w-5 h-5 text-[#B78103] shrink-0" />
              <div className="text-xs text-[#7A5500] dark:text-[#FDE047]">
                <strong>Razorpay Sandbox Mode:</strong> Real credit cards and bank accounts will{' '}
                <em>not</em> be charged. Uses dummy credentials for full end-to-end checkout
                validation.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleLaunchOfficialCheckout}
                disabled={isProcessing}
                className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Launching Razorpay...
                  </>
                ) : (
                  <>
                    Pay ₹{selectedPlan.priceInr} with Razorpay (Test Mode)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setView('simulator')}
                className="w-full h-10 rounded-xl bg-transparent hover:bg-[#F6F3EF] dark:hover:bg-[#1D2430] text-[#1C1F23] dark:text-[#E2E8F0] font-semibold text-xs border border-[#D1C9BE] dark:border-[#384556] transition-all flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#FF5500]" />
                Open Razorpay Test Sandbox Simulator (Cards, UPI, Netbanking)
              </button>
            </div>
          </div>
        )}

        {/* View 2: Razorpay Test Sandbox Simulator */}
        {view === 'simulator' && (
          <div className="space-y-4 animate-in fade-in text-left">
            {/* Sub-header navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setView('plans');
                  setSimStatus(null);
                }}
                className="text-xs font-semibold text-[#FF5500] hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Plans
              </button>
              <div className="text-right">
                <span className="text-xs text-gray-400">Total Due:</span>{' '}
                <strong className="text-base text-[#1C1F23] dark:text-white">
                  ₹{selectedPlan.priceInr}
                </strong>
                <span className="text-[11px] text-gray-400"> ({selectedPlan.name})</span>
              </div>
            </div>

            {/* Simulator Success State */}
            {simStatus === 'success' && lastPaymentResult && (
              <div className="p-4 rounded-xl bg-[#E6F9F0] dark:bg-[#0D2818] border border-[#12B76A] space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#12B76A] text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#085A34] dark:text-[#34D399]">
                    Payment Simulated Successfully!
                  </h4>
                  <p className="text-xs text-[#085A34] dark:text-[#A7F3D0] mt-0.5">
                    Razorpay order verified and Pro plan activated locally.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-black/40 rounded-lg p-3 text-xs space-y-1 text-left font-mono text-[#1C1F23] dark:text-gray-200 border border-[#A6F4C5] dark:border-[#065F46]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID:</span>
                    <strong className="text-[#085A34] dark:text-[#34D399]">
                      {lastPaymentResult.razorpay_payment_id}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span>{lastPaymentResult.razorpay_order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan:</span>
                    <span>{lastPaymentResult.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span>₹{lastPaymentResult.amount} INR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gateway:</span>
                    <span>{lastPaymentResult.source}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full h-10 rounded-lg bg-[#12B76A] hover:bg-[#0EA25E] text-white font-bold text-xs shadow-md transition-all"
                >
                  Start Using Pro Features →
                </button>
              </div>
            )}

            {/* Simulator Error State */}
            {simStatus === 'error' && (
              <div className="p-3.5 rounded-xl bg-[#FEF3F2] dark:bg-[#2B1716] border border-[#FECDCA] dark:border-[#7A271A] space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#B42318] dark:text-[#FDA29B]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Payment Declined in Test Sandbox:</strong>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSimStatus(null)}
                  className="text-xs font-semibold text-[#B42318] dark:text-[#FDA29B] underline"
                >
                  Retry with valid test credentials
                </button>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            {simStatus !== 'success' && (
              <>
                <div className="flex rounded-xl bg-[#F6F3EF] dark:bg-[#1D2430] p-1 border border-[#E6DFD7] dark:border-[#2E3A4B]">
                  <button
                    onClick={() => {
                      setActiveTab('card');
                      setSimStatus(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'card'
                        ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                        : 'text-[#5F6670] dark:text-[#9BA4B2]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Test Cards
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('upi');
                      setSimStatus(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'upi'
                        ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                        : 'text-[#5F6670] dark:text-[#9BA4B2]'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Test UPI
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('netbanking');
                      setSimStatus(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'netbanking'
                        ? 'bg-white dark:bg-[#151A22] text-[#FF5500] shadow-sm'
                        : 'text-[#5F6670] dark:text-[#9BA4B2]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Netbanking
                  </button>
                </div>

                {/* TAB 1: TEST CARDS */}
                {activeTab === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1.5">
                        Quick-Select Razorpay Test Cards:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TEST_CARDS.map((tc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCardNumber(tc.number);
                              setCardExpiry(tc.expiry);
                              setCardCvv(tc.cvv);
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                              tc.status === 'failed'
                                ? 'border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
                                : 'border-[#D1C9BE] dark:border-[#384556] text-[#1C1F23] dark:text-gray-200 bg-white dark:bg-[#1A202C] hover:border-[#FF5500]'
                            }`}
                          >
                            {tc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5 p-3 rounded-xl bg-[#FBF9F7] dark:bg-[#1A202C] border border-[#E6DFD7] dark:border-[#2E3A4B]">
                      <div>
                        <label className="text-[11px] font-semibold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#D1C9BE] dark:border-[#384556] bg-white dark:bg-[#151A22] text-xs font-mono text-[#1C1F23] dark:text-white focus:outline-none focus:border-[#FF5500]"
                          placeholder="4111 2222 3333 4444"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-[#D1C9BE] dark:border-[#384556] bg-white dark:bg-[#151A22] text-xs font-mono text-[#1C1F23] dark:text-white focus:outline-none focus:border-[#FF5500]"
                            placeholder="12/28"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-[#D1C9BE] dark:border-[#384556] bg-white dark:bg-[#151A22] text-xs font-mono text-[#1C1F23] dark:text-white focus:outline-none focus:border-[#FF5500]"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#5F6670] dark:text-[#9BA4B2] block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#D1C9BE] dark:border-[#384556] bg-white dark:bg-[#151A22] text-xs text-[#1C1F23] dark:text-white focus:outline-none focus:border-[#FF5500]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEST UPI */}
                {activeTab === 'upi' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#5F6670] dark:text-[#9BA4B2] block mb-1.5">
                        Quick-Select Test UPI Handles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TEST_UPI_IDS.map((tu, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setUpiVpa(tu.vpa)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                              tu.status === 'failed'
                                ? 'border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
                                : 'border-[#D1C9BE] dark:border-[#384556] text-[#1C1F23] dark:text-gray-200 bg-white dark:bg-[#1A202C] hover:border-[#FF5500]'
                            }`}
                          >
                            {tu.vpa} ({tu.status === 'failed' ? 'Decline' : 'Success'})
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FBF9F7] dark:bg-[#1A202C] border border-[#E6DFD7] dark:border-[#2E3A4B] space-y-2">
                      <label className="text-[11px] font-semibold text-[#5F6670] dark:text-[#9BA4B2] block">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#D1C9BE] dark:border-[#384556] bg-white dark:bg-[#151A22] text-xs font-mono text-[#1C1F23] dark:text-white focus:outline-none focus:border-[#FF5500]"
                        placeholder="success@razorpay"
                      />
                      <p className="text-[10px] text-[#5F6670] dark:text-[#9BA4B2]">
                        Enter any UPI handle ending in <code>@razorpay</code> or select a preset
                        above.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: TEST NETBANKING */}
                {activeTab === 'netbanking' && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-[#5F6670] dark:text-[#9BA4B2] block">
                      Select Test Bank for Simulation:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TEST_NETBANKING_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                            selectedBank === b.id
                              ? 'border-[#FF5500] bg-[#FFF1EB] dark:bg-[#FF5500]/15 text-[#FF5500]'
                              : 'border-[#D1C9BE] dark:border-[#384556] text-[#1C1F23] dark:text-gray-300 bg-white dark:bg-[#1A202C] hover:border-[#FF5500]'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5 mb-1 text-gray-400" />
                          <div>{b.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Submit Button */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Simulating Authorization with Razorpay...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Simulate Test Payment of ₹{selectedPlan.priceInr} ({activeTab.toUpperCase()})
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function UserProfileModal() {
  const {
    isUserProfileOpen,
    setIsUserProfileOpen,
    historyItems,
    setIsProModalOpen,
    setIsProDashboardOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    isPro,
    proDetails,
    user,
    logout,
    deactivatePro,
  } = useApp();
  const { showToast } = useToast();

  if (!isUserProfileOpen) return null;

  const handleDeactivate = () => {
    deactivatePro();
    showToast('Pro test mode subscription deactivated.', 'info');
  };

  const handleLogout = async () => {
    await logout();
    setIsUserProfileOpen(false);
    showToast('Signed out of account.', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={() => setIsUserProfileOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#F1ECE6] dark:border-[#242D3B]">
          <h3 className="font-bold text-base text-[#1C1F23] dark:text-[#F5F7FA]">
            {user ? 'Account Profile' : 'Browser Session Profile'}
          </h3>
          <button
            onClick={() => setIsUserProfileOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#F6F3EF] dark:bg-[#1D2430] rounded-xl">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E6DFD7] shrink-0 bg-[#FF5500] text-white flex items-center justify-center font-bold text-lg uppercase">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <strong className="text-sm text-[#1C1F23] dark:text-[#F5F7FA] block truncate max-w-[190px]">
              {user ? user.name : 'Private Browser Session'}
            </strong>
            <span className="text-xs text-[#5F6670] dark:text-[#9BA4B2] block truncate max-w-[190px]">
              {user ? user.email : '100% Client-Side Processing'}
            </span>
          </div>
        </div>

        <div className="text-xs space-y-2.5 text-[#5F6670] dark:text-[#9BA4B2]">
          <div className="flex justify-between items-center">
            <span>Active Plan:</span>
            {isPro ? (
              <span className="font-bold text-[#12B76A] flex items-center gap-1 bg-[#E6F9F0] dark:bg-[#112920] px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3 fill-[#12B76A]" /> {proDetails?.planName || 'Pro Plan'}
              </span>
            ) : (
              <strong className="text-[#FF5500]">Free Forever</strong>
            )}
          </div>

          {user && (
            <div className="flex justify-between items-center text-[11px]">
              <span>Auth Status:</span>
              <span className="text-[#12B76A] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> MongoDB Verified
              </span>
            </div>
          )}

          {isPro && proDetails?.razorpay_payment_id && (
            <div className="flex justify-between items-center text-[11px]">
              <span>Payment ID:</span>
              <code className="font-mono text-[#0066CC] dark:text-[#60A5FA]">
                {proDetails.razorpay_payment_id}
              </code>
            </div>
          )}

          <div className="flex justify-between">
            <span>Saved History:</span> <strong>{historyItems.length} items</strong>
          </div>
          <div className="flex justify-between">
            <span>Storage Engine:</span> <strong>HTML5 IndexedDB Engine</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          {isPro && (
            <button
              onClick={() => {
                setIsUserProfileOpen(false);
                setIsProDashboardOpen(true);
              }}
              className="w-full h-10 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Open Pro SaaS Dashboard
            </button>
          )}

          {!user && (
            <button
              onClick={() => {
                setIsUserProfileOpen(false);
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full h-10 rounded-lg bg-[#F6F3EF] dark:bg-[#1D2430] hover:bg-[#EAE4DC] dark:hover:bg-[#252E3E] text-[#1C1F23] dark:text-white font-bold text-xs border border-[#D1C9BE] dark:border-[#384556] transition-all"
            >
              Sign In / Register Pro Account
            </button>
          )}

          {!isPro && (
            <button
              onClick={() => {
                setIsUserProfileOpen(false);
                setIsProModalOpen(true);
              }}
              className="w-full h-10 rounded-lg bg-[#FF5500] hover:bg-[#E84D00] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade to Pro (Razorpay Test Mode)
            </button>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition-all"
            >
              Sign Out
            </button>
          ) : (
            isPro && (
              <button
                onClick={handleDeactivate}
                className="w-full h-9 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-all"
              >
                Deactivate Pro Test Session
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
