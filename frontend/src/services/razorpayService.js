// FormFit AI — Razorpay Payment & Pricing Service
// Supports official Razorpay Checkout SDK (rzp_test_...), backend verification, and built-in interactive Test Sandbox.

import { api, getStoredToken } from './apiService.js';

export const RAZORPAY_TEST_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) ||
  'rzp_test_FormFitDemoKey';

export const PRICING_PLANS = [
  {
    id: 'day_pass',
    name: '24-Hour Pass',
    badge: 'Quick Prep',
    priceInr: 99,
    amountPaise: 9900,
    priceUsd: '$1.49',
    period: '24 hours',
    description: 'Perfect for completing a single urgent exam application.',
    features: [
      'Unlimited batch downloads for 24h',
      'High-res multi-page PDF generation',
      'All government & visa portal presets',
      'Client-side instant compression',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    badge: 'Most Popular',
    popular: true,
    priceInr: 499,
    amountPaise: 49900,
    priceUsd: '$6.99',
    period: 'month',
    description: 'The standard plan for regular applicants, students & professionals.',
    features: [
      'Unlimited bulk batch processing & ZIP downloads',
      'Multi-page high-res document scanning & enhancement',
      'Save unlimited custom dimension & KB presets',
      'Priority offline client-side compression engine',
      'Full history persistence in local browser IndexedDB',
    ],
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    badge: 'Save 35%',
    priceInr: 3999,
    amountPaise: 399900,
    priceUsd: '$49.00',
    period: 'year',
    description: 'Ideal for cyber cafés, university counselors & visa consultants.',
    features: [
      'Everything in Pro Monthly',
      'Multi-device workspace support',
      'All newly added exam portals for 12 months',
      'VIP local processing pipeline (0ms cloud latency)',
      'Direct customer support & preset requests',
    ],
  },
];

// Official Razorpay Sandbox Test Data for testing payment states
export const TEST_CARDS = [
  {
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
    network: 'Visa',
    status: 'success',
    label: 'Test Visa (Auto-Success)',
  },
  {
    number: '5123 4567 8901 2346',
    expiry: '11/27',
    cvv: '456',
    network: 'Mastercard',
    status: 'success',
    label: 'Test Mastercard (Auto-Success)',
  },
  {
    number: '4000 0000 0000 0002',
    expiry: '05/26',
    cvv: '999',
    network: 'Visa (Declined)',
    status: 'failed',
    label: 'Declining Card (Simulate Failure)',
  },
];

export const TEST_UPI_IDS = [
  { vpa: 'success@razorpay', status: 'success', label: 'Razorpay Test UPI (Instant Approval)' },
  { vpa: 'applicant@oksbi', status: 'success', label: 'SBI Test UPI Handle' },
  { vpa: 'failure@razorpay', status: 'failed', label: 'Failing Test UPI (Simulate Decline)' },
];

export const TEST_NETBANKING_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'ICIC', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'SBIN', name: 'State Bank of India', code: 'SBIN' },
  { id: 'UTIB', name: 'Axis Bank', code: 'UTIB' },
  { id: 'KKBK', name: 'Kotak Mahindra Bank', code: 'KKBK' },
];

/**
 * Dynamically loads the official Razorpay Checkout script if available
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Launches payment via window.Razorpay SDK (Test Mode) with backend integration
 */
export async function launchRazorpayCheckout({ plan, user, onSuccess, onFailure }) {
  const hasScript = await loadRazorpayScript();

  if (hasScript && window.Razorpay) {
    try {
      let orderId = `order_test_${Date.now().toString(36)}`;
      let keyToUse = RAZORPAY_TEST_KEY;

      // If user has auth token, create real verified order on backend
      const token = getStoredToken();
      if (token) {
        try {
          const orderRes = await api.createOrder(plan.id);
          if (orderRes?.order?.id) {
            orderId = orderRes.order.id;
            if (orderRes.order.key) keyToUse = orderRes.order.key;
          }
        } catch (orderErr) {
          console.warn('[Razorpay] Backend order creation fallback:', orderErr.message);
        }
      }

      const options = {
        key: keyToUse,
        amount: plan.amountPaise,
        currency: 'INR',
        name: 'FormFit AI',
        description: `Upgrade to ${plan.name} (Test Mode)`,
        order_id: orderId.startsWith('order_') ? orderId : undefined,
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M12 6H24L19 17H12Z" fill="%23FF5500"/></svg>',
        prefill: {
          name: user?.name || 'Applicant User',
          email: user?.email || 'applicant@formfit.ai',
          contact: '9876543210',
        },
        theme: {
          color: '#FF5500',
        },
        modal: {
          ondismiss: () => {
            if (onFailure) onFailure(new Error('Razorpay Checkout closed by user'));
          },
        },
        handler: async (response) => {
          const paymentInfo = {
            razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now().toString(36)}`,
            razorpay_order_id: response.razorpay_order_id || orderId,
            razorpay_signature: response.razorpay_signature || `sig_test_${Date.now().toString(36)}`,
            planId: plan.id,
            planName: plan.name,
            amount: plan.priceInr,
            currency: 'INR',
            method: 'Razorpay Checkout SDK',
            date: new Date().toISOString(),
            source: 'Razorpay Official SDK (Test Mode)',
          };

          // Backend verification
          if (token) {
            try {
              const verifyRes = await api.verifyPayment({
                razorpay_order_id: paymentInfo.razorpay_order_id,
                razorpay_payment_id: paymentInfo.razorpay_payment_id,
                razorpay_signature: paymentInfo.razorpay_signature,
                planId: plan.id,
              });
              if (verifyRes?.user) {
                paymentInfo.backendVerified = true;
                paymentInfo.verifiedUser = verifyRes.user;
              }
            } catch (vErr) {
              console.warn('[Razorpay] Backend verification error:', vErr.message);
            }
          }

          if (onSuccess) onSuccess(paymentInfo);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        if (onFailure) {
          onFailure(new Error(resp.error?.description || 'Payment was declined in Test Mode.'));
        }
      });
      rzp.open();
      return true;
    } catch (e) {
      console.warn('Razorpay SDK init error, using sandbox fallback:', e);
      if (onFailure) onFailure(e);
      return false;
    }
  }

  return false;
}

/**
 * Simulates an in-browser Razorpay Test Sandbox transaction with optional backend verification
 */
export async function simulateTestPayment({ plan, method = 'card', details = {}, shouldFail = false }) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      if (shouldFail) {
        reject(new Error('Transaction declined by issuing bank (Test Failure Scenario).'));
        return;
      }

      const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
      const orderId = `order_test_${Date.now().toString(36).toUpperCase()}`;
      const paymentId = `pay_test_${randomSuffix}`;
      const signature = `sig_test_${Math.random().toString(36).substring(2, 12)}`;

      const mockResult = {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        planId: plan.id,
        planName: plan.name,
        amount: plan.priceInr,
        currency: 'INR',
        method: method,
        methodDetails: details,
        date: new Date().toISOString(),
        source: 'Razorpay Test Mode Sandbox',
      };

      // If user has auth token, also verify with backend
      const token = getStoredToken();
      if (token) {
        try {
          const verifyRes = await api.verifyPayment({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            planId: plan.id,
          });
          if (verifyRes?.user) {
            mockResult.backendVerified = true;
            mockResult.verifiedUser = verifyRes.user;
          }
        } catch (e) {
          // Backend offline or error, still resolve mockResult
        }
      }

      resolve(mockResult);
    }, 1100);
  });
}
