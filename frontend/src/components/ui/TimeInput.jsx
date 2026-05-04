// Structured time input helper (minutes/seconds style entry).
import React from 'react';

export default function TimeInput({ value, onChange, disabled = false, className }) {
    // `null` value maps to empty minute/second input fields.
    const minutes = value === null ? '' : Math.floor(value / 60);
    const seconds = value === null ? '' : (value % 60).toString().padStart(2, '0');
    const handleMinutesChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            const s = value ? value % 60 : 0;
            onChange(s === 0 ? null : s);
            return;
        }
        const m = parseInt(val) || 0;
        const s = value ? value % 60 : 0;
        onChange((m * 60) + s);
    };
    const handleSecondsChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            const m = value ? Math.floor(value / 60) : 0;
            onChange(m === 0 ? null : m * 60);
            return;
        }
        const s = parseInt(val) || 0;
        const m = value ? Math.floor(value / 60) : 0;
        // Caps seconds input at 59 before recomputing total seconds.
        onChange((m * 60) + Math.min(59, s));
    };
return (<div className={className ?? 'flex items-center gap-0.5 w-full bg-surface border border-divider rounded px-1 min-w-[3rem] h-8 focus-within:border-emerald focus-within:ring-1 focus-within:ring-emerald transition-colors'}>
            <input type="number" className="w-full bg-transparent text-center text-sm font-semibold text-text-primary placeholder-text-muted/40 outline-none disabled:opacity-50 appearance-none p-0" placeholder="M" min="0" max="99" value={minutes} onChange={handleMinutesChange} disabled={disabled} aria-label="Minutes"/>
            <span className="text-text-muted text-xs font-bold font-mono pb-0.5">:</span>
            <input type="number" className="w-full bg-transparent text-center text-sm font-semibold text-text-primary placeholder-text-muted/40 outline-none disabled:opacity-50 appearance-none p-0" placeholder="S" min="0" max="59" value={seconds} onChange={handleSecondsChange} disabled={disabled} aria-label="Seconds"/>
        </div>);
}


