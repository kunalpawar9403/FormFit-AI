// FormFit AI — Backend API Client Service
// Manages authentication headers, API requests, and communication with Express backend.

const TOKEN_KEY = 'formfit_auth_token_v1';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

export function getStoredToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearStoredToken() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = getStoredToken();
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.code = data.code;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend is offline or unreachable
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const offlineError = new Error('Backend server is currently offline. Running in local browser mode.');
      offlineError.code = 'BACKEND_OFFLINE';
      throw offlineError;
    }
    throw err;
  }
}

// API Resource Modules
export const api = {
  // Auth
  register: (name, email, password) =>
    apiRequest('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) =>
    apiRequest('/api/auth/login', { method: 'POST', body: { email, password } }),
  getMe: () => apiRequest('/api/auth/me'),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),

  // Payment
  getPlans: () => apiRequest('/api/payment/plans'),
  createOrder: (planId) =>
    apiRequest('/api/payment/create-order', { method: 'POST', body: { planId } }),
  verifyPayment: (payload) =>
    apiRequest('/api/payment/verify-payment', { method: 'POST', body: payload }),

  // Subscription
  getSubscription: () => apiRequest('/api/subscription/current'),
  cancelSubscription: () => apiRequest('/api/subscription/cancel', { method: 'POST' }),

  // Presets
  getPresets: () => apiRequest('/api/presets'),
  createPreset: (presetData) =>
    apiRequest('/api/presets', { method: 'POST', body: presetData }),
  deletePreset: (id) => apiRequest(`/api/presets/${id}`, { method: 'DELETE' }),

  // Usage
  getUsageSummary: () => apiRequest('/api/usage/summary'),
  trackUsage: (feature, count = 1) =>
    apiRequest('/api/usage/track', { method: 'POST', body: { feature, count } }),
};
