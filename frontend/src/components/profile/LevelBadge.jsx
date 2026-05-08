// Component showing user rank/level based on lifetime volume.
import { motion } from 'framer-motion';
// Displays a card with level number, title, and progress bar.
export default function LevelBadge({ level, title, progress }) {
    return (<div className="bg-app shadow-neu rounded-3xl p-5 border border-divider">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange shadow-neu flex items-center justify-center text-white text-xl font-black">
                        {level}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Rank</h3>
                        <p className="text-xs font-bold text-orange uppercase tracking-tight">{title}</p>
                    </div>
                </div>
                
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
