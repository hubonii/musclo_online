import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Format weight values for display with intelligent rounding and unit conversion.
export function formatWeight(kg, unit = 'kg') {
    const val = unit === 'lbs' ? (kg * 2.20462) : kg;
    
    // For very large volumes (e.g. lifetime total), use 'k' notation to save space.
    if (val >= 10000) {
        return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k ${unit}`;
    }
    
    // For moderate weights, show 1 decimal if needed.
    if (val >= 100) {
        return `${Math.round(val)} ${unit}`;
    }
    
    return `${val.toFixed(1).replace(/\.0$/, '')} ${unit}`;
}

// Format calendar dates for display.
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

// Converts total seconds into `h m`, `m s`, or `s` display strings.
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

// Format relative time labels such as "2h ago".
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

// Sum completed set volume (weight x reps), excluding warmups.
export function calculateTotalVolume(exercises) {
    return exercises.reduce((total, e) => total + e.sets.reduce((sum, s) => sum + (s.isCompleted && s.set_type !== 'warmup' ? (s.weight_kg ?? 0) * (s.reps ?? 0) : 0), 0), 0);
}

// Count completed sets across all exercises.
export function calculateCompletedSetsCount(exercises) {
    return exercises.reduce((t, e) => t + e.sets.filter((s) => s.isCompleted).length, 0);
}

// Count total planned sets across all exercises.
export function calculateTotalSetsCount(exercises) {
    return exercises.reduce((t, e) => t + e.sets.length, 0);
}

export function groupPhotosByDate(photos) {
    // Group photos by day and map primary poses (front/side/back) for timeline cards.
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


