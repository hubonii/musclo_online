// Visual countdown bar for rest periods between sets.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useRestTimerStore } from '../../stores/useRestTimerStore';
export default function RestProgressBar({ exerciseId, setId }) {
    const { restTimerRunning, restTimerEnd, restTimerExerciseId, restTimerSetId, isRestTimerPaused, restTimeRemaining, pauseRestTimer, resumeRestTimer, stopRestTimer, restTimerSeconds } = useRestTimerStore();
const [progress, setProgress] = useState(1);
const [timeLeft, setTimeLeft] = useState(0);
    const isThisSetResting = restTimerRunning && restTimerExerciseId === exerciseId && restTimerSetId === setId;
useEffect(() => {
        if (!isThisSetResting)
            return;
        let interval = null;
        const updateTimer = () => {
            if (isRestTimerPaused) {
                // Keep showing frozen remaining time while paused.
                setTimeLeft(restTimeRemaining || 0);
                setProgress((restTimeRemaining || 0) / restTimerSeconds);
                return;
            }
            if (!restTimerEnd)
                return;
            const remaining = Math.max(0, Math.floor((restTimerEnd - Date.now()) / 1000));
            setTimeLeft(remaining);
            setProgress(remaining / restTimerSeconds);
            if (remaining <= 0) {
                stopRestTimer();
            }
        };
        updateTimer();
        // 500ms feels smooth enough for the bar without excessive re-renders.
        interval = setInterval(updateTimer, 500);
return () => clearInterval(interval);
    }, [isThisSetResting, isRestTimerPaused, restTimerEnd, restTimeRemaining, restTimerSeconds, stopRestTimer]);
    if (!isThisSetResting)
        return null;
return (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="col-span-12 px-2 pb-2">
            <div className="bg-app rounded-xl p-2 shadow-neu-inset border border-orange/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {/* Stop propagation so pressing timer controls does not toggle parent rows. */}
                        <button onClick={(e) => { e.stopPropagation(); isRestTimerPaused ? resumeRestTimer() : pauseRestTimer(); }} className="w-8 h-8 rounded-full bg-neu shadow-neu-sm flex items-center justify-center text-orange hover:brightness-125 transition-all">
                            {isRestTimerPaused ? <Play size={14} fill="currentColor"/> : <Pause size={14} fill="currentColor"/>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); stopRestTimer(); }} className="w-8 h-8 rounded-full bg-neu shadow-neu-sm flex items-center justify-center text-text-muted hover:text-orange transition-all">
                            <SkipForward size={14} fill="currentColor"/>
                        </button>
                    </div>

                    <div className="flex-1 relative h-2.5 bg-divider/10 rounded-full overflow-hidden shadow-neu-inset">
                        <motion.div className="absolute inset-y-0 left-0 bg-orange shadow-[0_0_15px_rgba(234,88,12,0.4)]" initial={{ width: "100%" }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: "linear" }}/>
                    </div>

                    <div className="text-[10px] font-black text-orange tabular-nums w-10 text-right uppercase tracking-[0.1em]">
                        {timeLeft}s
                    </div>
                </div>
            </div>
        </motion.div>);
}


