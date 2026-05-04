// Editable routine exercise card with params, sets, and expand/collapse behavior.
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, ChevronRight } from 'lucide-react';
import Select from '../ui/Select';
import TemplateSetsTable from './TemplateSetsTable';
import { cn } from '../../lib/utils';
export default function RoutineExerciseItem({ item, exIndex, onToggleExpand, onRemove, onUpdateParam, onAddSet, onRemoveSet, onUpdateSet }) {
    // Fall back to equipment defaults when routine-level overrides are not set yet.
    const isBodyweight = (item.override_type || (item.exercise.equipment === 'Body Weight' ? 'Bodyweight' : 'Weights')) === 'Bodyweight';
    const isTime = (item.override_metric || 'Reps') === 'Time';
return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="bg-surface rounded-2xl shadow-neu overflow-hidden flex flex-col">
            <div className="bg-divider/5 p-4 flex items-center justify-between cursor-pointer hover:bg-divider/10 transition-colors" onClick={(e) => {
            // Keep card clickable for expand/collapse, but ignore clicks from inner controls.
            if (e.target.closest('button, select'))
                return;
            onToggleExpand(exIndex);
        }}>
                <div className="flex items-center gap-4">
                    <div className="cursor-grab text-text-muted hidden md:block" onClick={(e) => e.stopPropagation()}>
                        <GripVertical size={20}/>
                    </div>
                    <div className="w-12 h-12 bg-app rounded-lg flex items-center justify-center shadow-neu-inset overflow-hidden">
                        {(item.exercise.thumbnail_url || item.exercise.gif_url) ? (<img src={item.exercise.thumbnail_url || item.exercise.gif_url || ''} alt={item.exercise.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen"/>) : (<span className="text-xs font-bold text-text-muted uppercase">IMG</span>)}
                    </div>
                    <div>
                        <h3 className="font-black text-base text-text-primary capitalize tracking-tight">{item.exercise.name}</h3>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                            <p className="text-[10px] font-black text-orange uppercase tracking-[0.15em] opacity-80">{item.exercise.muscle_group}</p>
                            <span className="text-divider/40 inline-block">•</span>
                            <Select variant="ghost-orange" className="uppercase tracking-widest text-[9px] font-black" value={item.override_type || (item.exercise.equipment === 'Body Weight' ? 'Bodyweight' : 'Weights')} onValueChange={(v) => onUpdateParam(exIndex, 'override_type', v)} options={[
            { value: 'Weights', label: 'WEIGHTS' },
            { value: 'Bodyweight', label: 'BODYWEIGHT' }
        ]}/>
                            <span className="text-divider/40 inline-block">•</span>
                            <Select variant="ghost-orange" className="uppercase tracking-widest text-[9px] font-black" value={item.override_metric || 'Reps'} onValueChange={(v) => onUpdateParam(exIndex, 'override_metric', v)} options={[
            { value: 'Reps', label: 'REPS' },
            { value: 'Time', label: 'TIME' }
        ]}/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-app px-3 py-1.5 rounded-lg shadow-neu-inset">
                        <span className="text-xs font-bold text-text-muted uppercase">Rest</span>
                        <Select variant="compact" className="min-w-[80px]" value={(item.rest_timer_seconds || 'none').toString()} onValueChange={(v) => onUpdateParam(exIndex, 'rest_timer_seconds', v === 'none' ? null : parseInt(v))} options={[
            { value: 'none', label: 'Off' },
            { value: '30', label: '30s' },
            { value: '60', label: '1m' },
            { value: '90', label: '1m 30s' },
            { value: '120', label: '2m' },
            { value: '180', label: '3m' },
            { value: '300', label: '5m' }
        ]} placeholder="Off"/>
                    </div>
                    <button onClick={() => onRemove(exIndex)} className="p-2 text-text-muted hover:text-danger hover:bg-app rounded-lg transition-colors shadow-neu-sm hover:shadow-neu-inset">
                        <Trash2 size={18}/>
                    </button>
                    <div className={cn("p-2 text-text-muted transition-transform duration-200", item.isExpanded && "rotate-90")}>
                        <ChevronRight size={20}/>
                    </div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {item.isExpanded && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="overflow-hidden">
                        <div className="p-4 ">
                            <TemplateSetsTable sets={item.sets} // Cast since TemplateSetsTable uses local TemplateSet interface
         isBodyweight={isBodyweight} isTime={isTime} exIndex={exIndex} onUpdateSet={onUpdateSet} onRemoveSet={onRemoveSet} onAddSet={onAddSet}/>
                        </div>
                    </motion.div>)}
            </AnimatePresence>
        </motion.div>);
}


