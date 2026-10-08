// FormFit AI — SaaS Plan Configuration & Usage Limits
// Configurable constants for Free vs Pro tiers

export const FREE_PHOTO_LIMIT = 10; // Operations per calendar day
export const FREE_PDF_LIMIT = 5; // Operations per calendar day
export const FREE_CUSTOM_PRESET_LIMIT = 5; // Max custom presets for Free tier
export const FREE_HISTORY_LIMIT = 20; // Max stored browser history items

export const PRO_BATCH_MAX_FILES = 50; // Max batch upload per operation
export const PRO_MONTHLY_QUOTA = 500; // Monthly operations quota on Pro

const USAGE_STORAGE_KEY = 'formfit_free_usage_v1';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns current free usage record for today
 */
export function getDailyFreeUsage() {
  if (typeof localStorage === 'undefined') {
    return { date: getTodayKey(), photoCount: 0, pdfCount: 0 };
  }
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    const today = getTodayKey();
    if (!data || data.date !== today) {
      const fresh = { date: today, photoCount: 0, pdfCount: 0 };
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch (e) {
    return { date: getTodayKey(), photoCount: 0, pdfCount: 0 };
  }
}

/**
 * Increments daily free usage for photo or pdf
 */
export function recordDailyFreeUsage(type = 'photo') {
  if (typeof localStorage === 'undefined') return;
  try {
    const usage = getDailyFreeUsage();
    if (type === 'photo') {
      usage.photoCount = (usage.photoCount || 0) + 1;
    } else if (type === 'pdf') {
      usage.pdfCount = (usage.pdfCount || 0) + 1;
    }
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    return usage;
  } catch (e) {
    // Ignore storage quota error
  }
}

/**
 * Checks if free limit is exceeded for a feature
 */
export function isFreeLimitReached(type = 'photo', customPresetsCount = 0) {
  if (type === 'preset') {
    return customPresetsCount >= FREE_CUSTOM_PRESET_LIMIT;
  }
  const usage = getDailyFreeUsage();
  if (type === 'photo') {
    return (usage.photoCount || 0) >= FREE_PHOTO_LIMIT;
  }
  if (type === 'pdf') {
    return (usage.pdfCount || 0) >= FREE_PDF_LIMIT;
  }
  return false;
}
