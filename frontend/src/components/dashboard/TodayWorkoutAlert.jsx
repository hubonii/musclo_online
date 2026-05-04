// Banner card that highlights the routine scheduled for today.
import { Play } from 'lucide-react';
import Button from '../ui/Button';

// Expects a `routine` object with `name` and optional `exercises` list.
// Renders today's routine hero and emits `onStart` when CTA is clicked.
export default function TodayWorkoutAlert({ routine, onStart }) {
return (<div className="bg-surface shadow-neu rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-none">
            {/* Decorative glow behind content to keep the hero card visually focused. */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-app shadow-neu-inset flex items-center justify-center shrink-0">
                    <Play size={24} className="text-orange ml-1"/>
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-orange tracking-[0.2em] uppercase mb-1">Today's Workout</h3>
                    <h2 className="text-xl md:text-2xl font-black text-text-primary leading-none uppercase tracking-tight">{routine.name}</h2>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-widest">
                        {/* Summary line displays planned exercise count for this routine card. */}
                        {/* Optional chaining avoids a crash if exercises are not loaded yet. */}
                        {routine.exercises?.length || 0} Exercises
                    </p>
                </div>
            </div>
            <Button variant="primary" size="lg" className="w-full md:w-auto px-10 rounded-2xl z-10 font-black uppercase tracking-widest shadow-neu-orange/10" onClick={onStart}>
                Start Workout
            </Button>
        </div>);
}


