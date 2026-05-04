// Offline workout save queue — persists unsaved workout payloads in localStorage
// and auto-flushes them to the server when connectivity returns.
import { apiPost } from '../api/axios';

const QUEUE_KEY = 'musclo-pending-workouts';

/**
 * Read all pending workout payloads from localStorage.
 * Filtered by user_id to prevent data crossover between accounts.
 * @param {number} userId - The current authenticated user's ID
 * @returns {Array} Pending workout payloads for this user
 */
export function getPendingWorkouts(userId) {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const allPending = raw ? JSON.parse(raw) : [];
    if (!userId) return allPending; // Return all if no filter provided (for cleanup)
    return allPending.filter(item => item.userId === userId);
  } catch {
    return [];
  }
}

/**
 * Queue a workout payload for later sync, tagged with the current user ID.
 * @param {Object} payload - The workout save payload
 * @param {number} userId - The current user's ID
 */
export function queueWorkoutSave(payload, userId) {
  if (!userId) return;
  const raw = localStorage.getItem(QUEUE_KEY);
  const allPending = raw ? JSON.parse(raw) : [];
  allPending.push({ payload, userId, queuedAt: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(allPending));
}

/**
 * Get the count of pending workouts for a specific user.
 * @param {number} userId
 * @returns {number}
 */
export function getPendingCount(userId) {
  return getPendingWorkouts(userId).length;
}

/**
 * Attempt to POST queued workouts for the CURRENT user only.
 * Removes each entry on success.
 * @param {number} userId - The currently logged in user ID
 * @returns {Promise<Object>} { synced, error }
 */
export async function flushQueue(userId) {
  if (!userId) return { synced: 0, error: 'No user ID provided for sync' };
  
  const raw = localStorage.getItem(QUEUE_KEY);
  const allPending = raw ? JSON.parse(raw) : [];
  
  const userPending = allPending.filter(item => item.userId === userId);
  const otherPending = allPending.filter(item => item.userId !== userId);
  
  if (userPending.length === 0) return { synced: 0, error: null };

  let synced = 0;
  const failed = [];
  let firstError = null;

  for (const item of userPending) {
    try {
      await apiPost('/workouts', item.payload);
      synced++;
    } catch (err) {
      console.error('[OfflineSync] Failed to sync workout:', err.response?.data || err.message);
      if (!firstError) firstError = err.response?.data?.message || err.message;
      failed.push(item);
    }
  }

  // Update storage: keep failed items for this user AND all items for other users
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...otherPending, ...failed]));
  return { synced, error: firstError };
}

/**
 * Initialize auto-flush: listen for online events and flush pending workouts for current user.
 * Call once at app startup.
 * @param {number} userId
 */
export function initOfflineSync(userId) {
  if (!userId) return () => {};

  const handleOnline = async () => {
    const { synced } = await flushQueue(userId);
    if (synced > 0) {
      console.log(`[OfflineSync] Synced ${synced} pending workout(s) for user ${userId}.`);
    }
  };

  window.addEventListener('online', handleOnline);

  if (navigator.onLine && getPendingCount(userId) > 0) {
    handleOnline();
  }

  return () => window.removeEventListener('online', handleOnline);
}
