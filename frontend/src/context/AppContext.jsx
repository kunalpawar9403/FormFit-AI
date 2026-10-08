import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OFFICIAL_PRESETS } from '../constants/presetsData.js';
import {
  getSavedPresets,
  saveCustomPreset as persistPreset,
  deleteCustomPreset as removePreset,
  getHistoryItems,
  addHistoryItem as persistHistoryItem,
  removeHistoryItem as deleteHistoryItem,
  clearAllHistory as clearHistoryStorage,
  downloadHistoryBlob,
  getProStatus,
  saveProStatus,
  clearProStatus,
} from '../services/storageService.js';
import {
  getDailyFreeUsage,
  recordDailyFreeUsage,
  isFreeLimitReached,
  FREE_PHOTO_LIMIT,
  FREE_PDF_LIMIT,
  FREE_CUSTOM_PRESET_LIMIT,
  FREE_HISTORY_LIMIT,
} from '../constants/planLimits.js';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/apiService.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Presets State (Local + Cloud Sync)
  const [customPresets, setCustomPresets] = useState(() => getSavedPresets());
  const allPresets = [...customPresets, ...OFFICIAL_PRESETS];

  // Active Photo Setup Specs
  const [activePhotoSpecs, setActivePhotoSpecs] = useState({
    presetId: 'passport-in',
    presetName: 'Indian Passport Photo',
    width: 413,
    height: 531,
    maxKb: 100,
    minKb: 20,
    format: 'JPG',
    aspect: '3.5:4.5',
    isCustom: false,
  });

  // History State
  const [historyItems, setHistoryItems] = useState(() => getHistoryItems());

  // User & Authentication State
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Pro Subscription State
  // Initial fallback to stored sandbox pro status, then verified by backend if token exists
  const [proDetails, setProDetails] = useState(() => getProStatus());
  const [isPro, setIsPro] = useState(() => Boolean(getProStatus()));

  // Daily Free Usage Tracking
  const [freeUsage, setFreeUsage] = useState(() => getDailyFreeUsage());

  // Modals & Navigation Overlays
  const [isAddPresetModalOpen, setIsAddPresetModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isProDashboardOpen, setIsProDashboardOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register'); // 'register' | 'login'
  const [proModalFeature, setProModalFeature] = useState(null);
  const [pendingProUpgrade, setPendingProUpgrade] = useState(false);

  // Verify Auth & Subscription with Backend on initial load
  const verifySession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res?.success && res.user) {
        setUser(res.user);
        const serverPro =
          (res.user.plan === 'PRO' || res.user.plan === 'BUSINESS') &&
          res.user.subscriptionStatus === 'ACTIVE';
        setIsPro(serverPro);

        if (serverPro) {
          const verifiedRecord = {
            planId: res.user.plan.toLowerCase() === 'pro' ? 'pro_monthly' : res.user.plan.toLowerCase(),
            planName: `${res.user.plan} Active`,
            status: res.user.subscriptionStatus,
            date: res.user.subscriptionStart || new Date().toISOString(),
            razorpay_payment_id: res.user.subscriptionId || 'verified_cloud_session',
            source: 'MongoDB Atlas Verified Session',
          };
          setProDetails(verifiedRecord);
          saveProStatus(verifiedRecord);
        } else {
          // Subscription expired or free
          if (res.user.subscriptionStatus === 'EXPIRED') {
            clearProStatus();
            setProDetails(null);
          }
        }
      }
    } catch (err) {
      // Backend offline or token invalid
      if (err.status === 401) {
        clearStoredToken();
        setUser(null);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Command palette keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCmdPaletteOpen(false);
        setIsAddPresetModalOpen(false);
        setIsProModalOpen(false);
        setIsUserProfileOpen(false);
        setIsAuthModalOpen(false);
        setIsProDashboardOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Operations
  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res?.success) {
      setStoredToken(res.token);
      setUser(res.user);
      const serverPro =
        (res.user.plan === 'PRO' || res.user.plan === 'BUSINESS') &&
        res.user.subscriptionStatus === 'ACTIVE';
      setIsPro(serverPro);
      if (serverPro) {
        const verifiedRecord = {
          planId: 'pro_monthly',
          planName: 'Pro Monthly (Verified)',
          status: 'ACTIVE',
          razorpay_payment_id: res.user.subscriptionId,
        };
        setProDetails(verifiedRecord);
        saveProStatus(verifiedRecord);
      }
      return res.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res?.success) {
      setStoredToken(res.token);
      setUser(res.user);
      setIsPro(false);
      return res.user;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    clearStoredToken();
    clearProStatus();
    setUser(null);
    setIsPro(false);
    setProDetails(null);
  };

  // Usage Helpers
  const trackFreeUsage = (type = 'photo') => {
    if (!isPro) {
      const updated = recordDailyFreeUsage(type);
      if (updated) setFreeUsage(updated);
    }
  };

  const checkFreeLimit = (type = 'photo') => {
    if (isPro) return false;
    return isFreeLimitReached(type, customPresets.length);
  };

  const openUpgradeModal = (featureName = null) => {
    setProModalFeature(featureName);
    setIsProModalOpen(true);
  };

  // Presets Handlers
  const addCustomPreset = async (presetData) => {
    const newPreset = {
      ...presetData,
      id: 'custom-' + Date.now(),
      isUserCreated: true,
      source: 'User Custom',
      sourceDate: new Date().getFullYear().toString(),
    };
    const updated = persistPreset(newPreset);
    setCustomPresets(updated);

    // If user is authenticated and Pro, also sync preset to MongoDB backend
    if (user && isPro) {
      try {
        await api.createPreset({
          name: newPreset.name,
          width: newPreset.targetWidth,
          height: newPreset.targetHeight,
          format: newPreset.format,
          minFileSize: newPreset.minKb || 0,
          maxFileSize: newPreset.maxKb || 100,
          configuration: newPreset,
        });
      } catch (e) {
        console.warn('Preset cloud sync notice:', e.message);
      }
    }

    return newPreset;
  };

  const deletePreset = async (id) => {
    const updated = removePreset(id);
    setCustomPresets(updated);
  };

  // History Handlers
  const addHistory = async (item, blob = null) => {
    const updated = await persistHistoryItem(item, blob);
    setHistoryItems(updated);
    return updated;
  };

  const deleteHistory = async (id) => {
    const updated = await deleteHistoryItem(id);
    setHistoryItems(updated);
    return updated;
  };

  const clearHistory = async () => {
    const updated = await clearHistoryStorage();
    setHistoryItems(updated);
    return updated;
  };

  const downloadHistory = async (item) => {
    return await downloadHistoryBlob(item);
  };

  const applyPresetToPhoto = (preset) => {
    setActivePhotoSpecs({
      presetId: preset.id,
      presetName: preset.name,
      width: preset.targetWidth,
      height: preset.targetHeight,
      maxKb: preset.maxKb,
      minKb: preset.minKb || 0,
      format: preset.format || 'JPG',
      aspect: preset.aspectRatio || 'Locked',
      isCustom: preset.isUserCreated || false,
    });
  };

  // Pro Activation & Sandbox Handlers
  const activatePro = (paymentRecord) => {
    saveProStatus(paymentRecord);
    setProDetails(paymentRecord);
    setIsPro(true);
    if (paymentRecord.verifiedUser) {
      setUser(paymentRecord.verifiedUser);
    }
    return paymentRecord;
  };

  const deactivatePro = () => {
    clearProStatus();
    setProDetails(null);
    setIsPro(false);
  };

  return (
    <AppContext.Provider
      value={{
        // Presets & Specs
        allPresets,
        customPresets,
        addCustomPreset,
        deletePreset,
        activePhotoSpecs,
        setActivePhotoSpecs,
        applyPresetToPhoto,

        // History
        historyItems,
        addHistory,
        deleteHistory,
        clearHistory,
        downloadHistory,

        // User & Pro State
        user,
        isPro,
        proDetails,
        isAuthLoading,
        login,
        register,
        logout,
        activatePro,
        deactivatePro,
        verifySession,

        // Free Limits & Usage Tracking
        freeUsage,
        trackFreeUsage,
        checkFreeLimit,
        openUpgradeModal,
        FREE_PHOTO_LIMIT,
        FREE_PDF_LIMIT,
        FREE_CUSTOM_PRESET_LIMIT,
        FREE_HISTORY_LIMIT,

        // Modals & Navigation Overlays
        isAddPresetModalOpen,
        setIsAddPresetModalOpen,
        isProModalOpen,
        setIsProModalOpen,
        isProDashboardOpen,
        setIsProDashboardOpen,
        isUserProfileOpen,
        setIsUserProfileOpen,
        isCmdPaletteOpen,
        setIsCmdPaletteOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        proModalFeature,
        setProModalFeature,
        pendingProUpgrade,
        setPendingProUpgrade,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
