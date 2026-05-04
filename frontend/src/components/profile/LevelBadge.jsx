// Profile level badge with hoverable progress indicator.
import { motion } from 'framer-motion';
// Displays current level title and percent progress bar.
export default function LevelBadge({ level, title, progress }) {
return (<div className="flex flex-col items-center group relative">
            {/* Compact badge row stays visible; details are moved to hover panel below. */}
            <div className="bg-app shadow-neu-sm rounded-full px-4 py-1.5 flex items-center gap-2 border border-divider cursor-help">
                <span className="text-xl">⭐</span>
                <span className="font-black text-text-primary truncate max-w-[150px]">
                    Lv. {level} <span className="text-text-secondary font-medium px-1">—</span> {title}
                </span>
            </div>

            {/* Tooltip-like panel appears on hover to avoid cluttering the main profile header. */}
            <div className="absolute mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-48">
                <div className="bg-surface">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-text-secondary">Progress</span>
                        <span className="text-orange">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-divider/20 rounded-full overflow-hidden shadow-neu-inset">
                        {/* Progress width is percent-based so callers can pass normalized values directly. */}
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-orange"/>
                    </div>
                    <p className="text-[10px] text-text-muted mt-2 text-center leading-tight">
                        Based on lifetime volume
                    </p>
                </div>
            </div>
        </div>);
}

