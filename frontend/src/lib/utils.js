/**
 * General utility functions for the frontend application.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Returns the current date as a YYYY-MM-DD string.
 * @returns {string} Formatted date string.
 */
export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Merges CSS classes using clsx and tailwind-merge.
 * @param {...any} inputs - Class names or conditional class objects.
 * @returns {string} Merged class string.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}


/**
 * Formats a weight value with appropriate units and rounding.
 * @param {number} kg - Weight in kilograms.
 * @param {'kg'|'lbs'} [unit='kg'] - Target unit for display.
 * @returns {string} Formatted weight string.
 */
export function formatWeight(kg, unit = 'kg') {
    const numKg = Number(kg || 0);
    const val = unit === 'lbs' ? (numKg * 2.20462) : numKg;
    

    if (val >= 1000) {
        return `${Math.round(val)} ${unit}`;
    }
    
    return `${val.toFixed(1).replace(/\.0$/, '')} ${unit}`;
}


/**
 * Formats a date string or object into a human-readable format.
 * @param {string|Date} date - Date to format.
 * @returns {string} Formatted date string (e.g., "Jan 1, 2024").
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}


/**
 * Formats a duration in seconds into a human-readable H:M:S string.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted duration string.
 */
export function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
        return `${h}h ${m}m`;
    if (m > 0)
        return `${m}m ${s}s`;
    return `${s}s`;
}


/**
 * Formats a timestamp into a relative time string (e.g., "5m ago").
 * @param {string|Date} date - Date to format.
 * @returns {string} Relative time string.
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return 'just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHrs < 24)
        return `${diffHrs}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return formatDate(date);
}


/**
 * Calculates total lifting volume for a collection of exercise sets.
 * @param {Array} exercises - List of exercise objects with sets.
 * @returns {number} Total volume in kg.
 */
export function calculateTotalVolume(exercises) {
    return exercises.reduce((total, e) => total + e.sets.reduce((sum, s) => sum + (s.isCompleted && s.set_type !== 'warmup' ? (s.weight_kg ?? 0) * (s.reps ?? 0) : 0), 0), 0);
}


/**
 * Counts total completed sets across all exercises.
 * @param {Array} exercises - List of exercise objects.
 * @returns {number} Total count of completed sets.
 */
export function calculateCompletedSetsCount(exercises) {
    return exercises.reduce((t, e) => t + e.sets.filter((s) => s.isCompleted).length, 0);
}


/**
 * Counts total sets (completed or not) across all exercises.
 * @param {Array} exercises - List of exercise objects.
 * @returns {number} Total count of sets.
 */
export function calculateTotalSetsCount(exercises) {
    return exercises.reduce((t, e) => t + e.sets.length, 0);
}

/**
 * Groups progress photos by their capture date and pose.
 * @param {Array} photos - List of photo objects.
 * @returns {Object} Grouped photos and sorted dates.
 */
export function groupPhotosByDate(photos) {

    const grouped = photos.reduce((acc, photo) => {
        const dateStr = photo.taken_at.split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = { front: null, back: null, side: null, other: [], measurement_id: photo.measurement_id };
        }
        if ((photo.pose === 'front' || photo.pose === 'back' || photo.pose === 'side') && !acc[dateStr][photo.pose]) {
            acc[dateStr][photo.pose] = photo;
        }
        else {
            acc[dateStr].other.push(photo);
        }
        if (photo.measurement_id && !acc[dateStr].measurement_id) {
            acc[dateStr].measurement_id = photo.measurement_id;
        }
        return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return { sessionsByDate: grouped, sortedDates };
}


