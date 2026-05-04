// Single set input row used inside workout exercise cards.
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import TimeInput from '../ui/TimeInput';
import RestProgressBar from './RestProgressBar';
const SetRow = memo(({ set, exercise, sIdx, activeSetId, profileWeight, isImperial = false, onRemoveSet, onUpdateSet, onCompleteSet }) => {
    const isActiveSet = set.id === activeSetId;
return (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`overflow-hidden group grid grid-cols-12 gap-2 items-center py-1.5 px-1.5 rounded-xl transition-colors duration-100 ${set.isCompleted
            ? 'bg-success/5'
            // Active set row variant: highlighted background, ring, and scale transform.
            : isActiveSet
                ? 'bg-surface shadow-neu transform scale-[1.02] z-10 my-1 ring-2 ring-orange ring-inset'
                : 'bg-divider/5 hover:bg-divider/10 focus-within:bg-divider/10'}`}>
                <div className="col-span-1 flex items-center gap-1 pl-1">
                    {!set.isCompleted && (<button onClick={() => onRemoveSet(exercise.exerciseId, set.id)} className="text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove set ${sIdx + 1}`}>
                            <Trash2 size={14}/>
                        </button>)}
                    <span className="text-sm font-black text-text-secondary">
                        {set.set_type === 'warmup' ? 'W' : (sIdx + 1)}
                    </span>
                </div>

                <div className="col-span-3 text-left pl-2 text-[10px] font-bold text-text-muted uppercase tracking-tighter truncate">
                    {/* Previous column adapts format by exercise type + metric for quick comparison. */}
                    {exercise.type === 'Bodyweight' ? (exercise.targetMetric === 'Time' ? (set.previousDurationSeconds ? `${set.previousDurationSeconds}s` : '-') : (set.previousReps ? `${Math.round(set.previousReps)} reps` : '-')) : (set.previousWeight ? (exercise.targetMetric === 'Time'
            ? `${Math.round(isImperial ? set.previousWeight * 2.20462 : set.previousWeight)}${isImperial ? 'lbs' : 'kg'} x ${set.previousDurationSeconds ? Math.floor(set.previousDurationSeconds / 60) + 'm' : '?'}`
            : `${Math.round(isImperial ? set.previousWeight * 2.20462 : set.previousWeight)}${isImperial ? 'lbs' : 'kg'} x ${set.previousReps !== null ? Math.round(set.previousReps) : '?'}`) : '-')}
                </div>

                <div className="col-span-3">
                    <input type="number" className="w-full bg-app rounded-lg text-center h-10 md:h-9 text-base font-black text-text-primary placeholder:text-text-muted/20 outline-none disabled:opacity-50 focus:shadow-neu-inset-focused transition-all" placeholder={(set.previousWeight !== null || set.targetWeightKg !== null)
            ? Math.round(set.previousWeight ?? set.targetWeightKg ?? 0).toString()
            : "0"} value={exercise.type === 'Bodyweight' ? (profileWeight ? Math.round(profileWeight) : '') : (set.weight_kg === null ? '' : Math.round(set.weight_kg))} onChange={(e) => {
            // Bodyweight set rows display profile weight and disable weight input updates.
            if (exercise.type !== 'Bodyweight') {
                onUpdateSet(exercise.exerciseId, set.id, 'weight_kg', e.target.value === '' ? null : parseInt(e.target.value));
            }
        }} disabled={set.isCompleted || exercise.type === 'Bodyweight'} aria-label={`Weight for set ${sIdx + 1}`}/>
                </div>

                <div className="col-span-3">
                    {exercise.targetMetric === 'Time' ? (<TimeInput value={set.duration_seconds} onChange={(v) => onUpdateSet(exercise.exerciseId, set.id, 'duration_seconds', v)} disabled={set.isCompleted}/>) : (<input type="number" className="w-full bg-app rounded-lg text-center h-10 md:h-9 text-base font-black text-text-primary placeholder:text-text-muted/20 focus:ring-2 focus:ring-orange/30 outline-none disabled:opacity-50 transition-all font-mono" placeholder={(set.previousReps !== null || set.targetReps !== null)
                ? (set.previousReps ?? set.targetReps ?? 0).toString()
                : "0"} value={set.reps === null ? '' : set.reps} onChange={(e) => onUpdateSet(exercise.exerciseId, set.id, 'reps', e.target.value === '' ? null : parseInt(e.target.value))} disabled={set.isCompleted} aria-label={`Reps for set ${sIdx + 1}`}/>)}
                </div>

                <div className="col-span-2 flex justify-end pr-1">
                    {/* Toggling this button flips completion state and can trigger rest timer in store logic. */}
                    <button onClick={() => onCompleteSet(exercise.exerciseId, set.id)} className={`w-10 h-10 md:w-9 md:h-9 rounded-2xl flex items-center justify-center transition-all shadow-neu-sm border-2 ${set.isCompleted
            ? 'bg-orange text-white border-white/20'
            : isActiveSet
                ? 'bg-app text-orange shadow-neu-inset border-orange/50'
                : 'bg-app text-text-muted hover:text-orange hover:shadow-neu-inset border-transparent'}`} aria-label={`Complete set ${sIdx + 1}`} aria-pressed={set.isCompleted}>
                        <Check size={20} strokeWidth={set.isCompleted ? 4 : 3}/>
                    </button>
                </div>
            </motion.div>
            <RestProgressBar exerciseId={exercise.exerciseId} setId={set.id}/>
        </>);
});
export default SetRow;


