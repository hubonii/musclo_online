// Routine summary card with edit, delete, and workout-log actions.
import { motion } from 'framer-motion';
import { Pencil, Trash2, Clock, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

// Formats last performed for API or UI output.
function formatLastPerformed(dateStr) {
    // Converts absolute timestamp to relative label used in compact card subtitle.
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Displays one routine summary card with edit/delete/log-session actions.
export default function RoutineCard({ routine, lastPerformed, onEdit, onDelete, onLog }) {
    const exercises = routine?.exercises || [];

return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-surface rounded-2xl p-6 shadow-neu flex flex-col transition-colors group h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-black text-text-primary cursor-pointer hover:text-orange transition-colors uppercase tracking-tight" onClick={onEdit}>
                        {routine?.name || 'Tactical Protocol'}
                    </h3>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.15em]">
                        {exercises.length} Strategic Objectives
                    </p>
                    {lastPerformed && (
                        <p className="text-[10px] text-orange mt-2 flex items-center gap-1 font-bold uppercase">
                            <Clock size={10} className="inline"/>
                            ARCHIVED: {formatLastPerformed(lastPerformed)}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onEdit} 
                        className="p-2.5 bg-app rounded-xl shadow-neu-sm text-text-muted hover:text-orange transition-all active:shadow-neu-inset" 
                        type="button"
                    >
                        <Pencil size={16}/>
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-2.5 bg-app rounded-xl shadow-neu-sm text-text-muted hover:text-danger transition-all active:shadow-neu-inset" 
                        type="button"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>

            {/* Preview list shows up to three exercises to keep card compact. */}
            <div className="flex-1 space-y-3 mb-8">
                {exercises.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium truncate pr-4">
                            {ex.pivot?.target_sets ?? 0}x {ex.name}
                        </span>
                        <span className="text-xs font-bold text-text-muted bg-app px-2 py-1 rounded-lg shrink-0">
                            {ex.muscle_group}
                        </span>
                    </div>
                ))}
                {exercises.length > 3 && (
                    <div className="text-xs font-bold text-text-muted pt-2 uppercase tracking-widest text-center">
                        + {exercises.length - 3} More
                    </div>
                )}
            </div>

            <Button 
                variant="secondary" 
                className="w-full font-bold hover:shadow-neu-sm transition mt-auto"
                icon={<ArrowRight size={16}/>} 
                onClick={onLog}
            >
                Log Session
            </Button>
        </motion.div>
    );
}


