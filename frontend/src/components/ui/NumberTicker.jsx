// Animated number display used for stat counters.
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION } from '../../lib/motion';
import { cn } from '../../lib/utils';
export default function NumberTicker({ value, decimals = 0, suffix = '', prefix = '', className, animate = true, }) {
    const safeValue = isNaN(value) ? 0 : Number(value);
const [displayValue, setDisplayValue] = useState(safeValue);
useEffect(() => {
        if (!animate) {
            setDisplayValue(safeValue);
            return;
        }
        const start = displayValue;
        const diff = value - start;
        if (diff === 0)
            return;
        const duration = 400; // ms
        const startTime = performance.now();
        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease-out gives fast start and smooth settle near final value.
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(start + diff * eased);
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    }, [value, animate]);
    const formatted = `${prefix}${displayValue.toFixed(decimals)}${suffix}`;
return (<AnimatePresence mode="popLayout">
            {/* Key change forces a fresh enter animation when the numeric value updates. */}
            <motion.span key={Math.round(safeValue * 100)} className={cn('tabular-nums font-bold', className)} {...MOTION.numberTick} role="status" aria-label={formatted}>
                {formatted}
            </motion.span>
        </AnimatePresence>);
}


