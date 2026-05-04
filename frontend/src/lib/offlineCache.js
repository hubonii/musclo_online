// Lightweight localStorage cache layer for offline data access.
// Stores API responses with timestamps so pages can serve cached data when offline.

const CACHE_PREFIX = 'musclo-cache-';

/**
 * Store data in localStorage with a timestamp.
 * @param {string} key - Cache key (will be prefixed)
 * @param {*} data - Serializable data to cache
 */
export function cacheSet(key, data) {
  try {
    const entry = { data, ts: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    // Silently fail if storage is full — cache is best-effort.
    console.warn('[OfflineCache] Failed to write:', key, e);
  }
}

/**
 * Retrieve cached data if it exists and is within the max age window.
 * @param {string} key - Cache key
 * @param {number} maxAgeMs - Maximum age in milliseconds (default 24 hours)
 * @returns {*|null} Cached data or null
 */
export function cacheGet(key, maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > maxAgeMs) return null;
    return entry.data;
  } catch (e) {
    return null;
  }
}

/**
 * Remove a specific cache entry.
 * @param {string} key - Cache key
 */
export function cacheRemove(key) {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all musclo-related cache entries from localStorage.
 */
export function clearAllCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Check current online status.
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine;
}
