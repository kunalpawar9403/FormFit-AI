// FormFit AI — Local Storage & IndexedDB Persistence Service
// Handles client-side storage for custom presets and durable binary file history.

const DB_NAME = 'formfit_db_v1';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_HISTORY = 'history';

const PRESETS_STORAGE_KEY = 'formfit_custom_presets_v1';
const HISTORY_STORAGE_KEY = 'formfit_history_v1';
const PRO_STORAGE_KEY = 'formfit_pro_active_v1';

// In-memory fallback for environments without IndexedDB / localStorage (e.g. Node.js unit tests)
const memoryBlobStore = new Map();
let memoryHistoryStore = [];
let memoryPresetsStore = [];
let memoryProStore = null;

/**
 * Opens or upgrades the FormFit IndexedDB database
 * @returns {Promise<IDBDatabase|null>}
 */
function openDB() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        resolve(null);
      };
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Saves a Blob to durable IndexedDB storage
 * @param {string} blobId
 * @param {Blob} blob
 * @param {string} [mimeType]
 * @returns {Promise<boolean>}
 */
export async function saveBlobToStorage(blobId, blob, mimeType = '') {
  if (!blobId || !blob) return false;

  memoryBlobStore.set(blobId, blob);

  const db = await openDB();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.put({
        id: blobId,
        blob,
        mimeType: mimeType || blob.type || 'application/octet-stream',
        createdAt: Date.now(),
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Retrieves a Blob from durable IndexedDB storage
 * @param {string} blobId
 * @returns {Promise<Blob|null>}
 */
export async function getBlobFromStorage(blobId) {
  if (!blobId) return null;

  if (memoryBlobStore.has(blobId)) {
    return memoryBlobStore.get(blobId);
  }

  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const request = store.get(blobId);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          memoryBlobStore.set(blobId, request.result.blob);
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Deletes a Blob from durable storage
 * @param {string} blobId
 * @returns {Promise<boolean>}
 */
export async function deleteBlobFromStorage(blobId) {
  if (!blobId) return false;
  memoryBlobStore.delete(blobId);

  const db = await openDB();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.delete(blobId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// ---------------------------------------------------------------------------
// Custom Presets Storage
// ---------------------------------------------------------------------------

export function getSavedPresets() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    return [...memoryPresetsStore];
  } catch (e) {
    return [...memoryPresetsStore];
  }
}

export function saveCustomPreset(preset) {
  try {
    const current = getSavedPresets();
    const updated = [preset, ...current.filter((p) => p.id !== preset.id)];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    }
    memoryPresetsStore = updated;
    return updated;
  } catch (e) {
    return [];
  }
}

export function deleteCustomPreset(id) {
  try {
    const current = getSavedPresets();
    const updated = current.filter((p) => p.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    }
    memoryPresetsStore = updated;
    return updated;
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Processing History Storage (Metadata in localStorage/IndexedDB, Blobs in IndexedDB)
// ---------------------------------------------------------------------------

/**
 * Loads history items metadata list.
 * Default is an empty array (no fake sample items in production).
 * @returns {Array<Object>}
 */
export function getHistoryItems() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [...memoryHistoryStore];
  } catch (e) {
    return [...memoryHistoryStore];
  }
}

/**
 * Saves metadata and associates it with persistent Blob in IndexedDB.
 * @param {Object} item - History metadata
 * @param {Blob} [blob] - The actual generated file Blob
 * @returns {Promise<Array<Object>>} - Updated history items array
 */
export async function addHistoryItem(item, blob = null) {
  try {
    const current = getHistoryItems();
    const id = item.id || 'hist-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const blobId = item.blobId || 'blob-' + id;

    // If a blob was provided, save it durably into IndexedDB
    if (blob instanceof Blob) {
      await saveBlobToStorage(blobId, blob, item.mimeType || blob.type);
    }

    const newItem = {
      id,
      blobId,
      name: item.name || `formfit_${Date.now()}`,
      type: item.type || 'photo',
      mimeType: item.mimeType || (blob ? blob.type : 'application/octet-stream'),
      sizeKb: item.sizeKb || (blob ? parseFloat((blob.size / 1024).toFixed(1)) : 0),
      dimensions: item.dimensions || '',
      format: item.format || 'JPG',
      preset: item.preset || '',
      thumbnail: item.thumbnail || '',
      timestamp: item.timestamp || Date.now(),
    };

    // Keep up to 50 items
    const updated = [newItem, ...current.filter((h) => h.id !== id).slice(0, 49)];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    }
    memoryHistoryStore = updated;

    // Also persist metadata to IndexedDB
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_HISTORY, 'readwrite');
        tx.objectStore(STORE_HISTORY).put(newItem);
      } catch (e) {}
    }

    return updated;
  } catch (e) {
    return getHistoryItems();
  }
}

/**
 * Removes a history item and deletes its associated Blob
 * @param {string} id
 * @returns {Promise<Array<Object>>}
 */
export async function removeHistoryItem(id) {
  try {
    const current = getHistoryItems();
    const target = current.find((h) => h.id === id);

    if (target?.blobId) {
      await deleteBlobFromStorage(target.blobId);
    }

    const updated = current.filter((h) => h.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    }
    memoryHistoryStore = updated;

    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_HISTORY, 'readwrite');
        tx.objectStore(STORE_HISTORY).delete(id);
      } catch (e) {}
    }

    return updated;
  } catch (e) {
    return getHistoryItems();
  }
}

/**
 * Clears all history items and their stored blobs
 * @returns {Promise<Array<Object>>}
 */
export async function clearAllHistory() {
  try {
    const current = getHistoryItems();
    for (const item of current) {
      if (item.blobId) {
        await deleteBlobFromStorage(item.blobId);
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
    memoryHistoryStore = [];

    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction([STORE_HISTORY, STORE_FILES], 'readwrite');
        tx.objectStore(STORE_HISTORY).clear();
        tx.objectStore(STORE_FILES).clear();
      } catch (e) {}
    }

    memoryBlobStore.clear();
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Helper to download a file from history.
 * Retrieves Blob from IndexedDB, creates temporary ObjectURL, triggers download, and immediately revokes.
 * @param {Object} item
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function downloadHistoryBlob(item) {
  if (!item) return { success: false, message: 'Item not found' };

  let blob = null;
  if (item.blobId) {
    blob = await getBlobFromStorage(item.blobId);
  }

  // If not found in IndexedDB, fallback to thumbnail if it's a data URL
  if (!blob && item.thumbnail && item.thumbnail.startsWith('data:')) {
    try {
      const res = await fetch(item.thumbnail);
      blob = await res.blob();
    } catch (e) {}
  }

  if (!blob) {
    return {
      success: false,
      message: 'Original file is no longer available in browser storage.',
    };
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = item.name || `download_${Date.now()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { success: true };
}

/**
  * Retrieves active Pro status and subscription record
  * @returns {Object|null}
  */
export function getProStatus() {
  if (typeof localStorage === 'undefined') {
    return memoryProStore;
  }
  try {
    const raw = localStorage.getItem(PRO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return memoryProStore;
  }
}

/**
  * Persists active Pro status and payment details
  * @param {Object} proData
  * @returns {Object}
  */
export function saveProStatus(proData) {
  memoryProStore = proData;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(proData));
    } catch (e) {
      console.warn('Unable to persist Pro status to localStorage', e);
    }
  }
  return proData;
}

/**
  * Clears Pro status
  */
export function clearProStatus() {
  memoryProStore = null;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(PRO_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear Pro status from localStorage', e);
    }
  }
  return null;
}

