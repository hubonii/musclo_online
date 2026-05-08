// Redesigned table-less grid for routine template sets to match active workout aesthetic.
import { X, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeInput from '../ui/TimeInput';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { cn } from '../../lib/utils';

export default function TemplateSetsTable({ sets, isBodyweight, isTime, exIndex, onUpdateSet, onRemoveSet, onAddSet }) {
    return (
        <div className="flex flex-col gap-2">
            {/* Header matching ExerciseCard style */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-text-muted mb-1 px-1 text-center uppercase tracking-[0.2em] opacity-60">
                <div className="col-span-1 text-left px-1">Set</div>
                <div className="col-span-3 text-left pl-2">Type</div>
                {!isBodyweight && <div className="col-span-2">kg</div>}
                <div className={cn(isBodyweight ? "col-span-5" : "col-span-3")}>{isTime ? 'Time' : 'Reps'}</div>
                <div className="col-span-2">RIR</div>
                <div className="col-span-1"></div>
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {sets.map((set, setIndex) => (
                        <motion.div 
                            key={set.id || setIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-12 gap-2 items-center py-1 px-1 rounded-xl bg-divider/5 hover:bg-divider/10 transition-all group"
                        >
                            {/* Set Number */}
                            <div className="col-span-1 flex items-center justify-center">
                                <span className="text-[11px] font-black text-text-secondary w-6 h-6 rounded-lg bg-app shadow-neu-inset flex items-center justify-center">
                                    {setIndex + 1}
                                </span>
                            </div>

                            {/* Set Type */}
                            <div className="col-span-3">
                                <Select 
                                    variant="compact" 
                                    className="bg-transparent border-0 shadow-none text-[10px] font-black uppercase tracking-tight h-8"
                                    value={set.set_type} 
                                    onValueChange={(v) => onUpdateSet(exIndex, setIndex, 'set_type', v)} 
                                    options={[
                                        { value: 'working', label: 'Normal' },
                                        { value: 'warmup', label: 'Warmup' },
                                        { value: 'dropset', label: 'Dropset' },
                                        { value: 'failure', label: 'Failure' }
                                    ]}
                                />
                            </div>

                            {/* Weight (if not bodyweight) */}
                            {!isBodyweight && (
                                <div className="col-span-2">
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        value={set.weight_kg !== null ? Math.round(set.weight_kg) : ''} 
                                        onChange={(e) => onUpdateSet(exIndex, setIndex, 'weight_kg', e.target.value ? parseInt(e.target.value) : null)} 
                                        className="w-full bg-app rounded-lg text-center h-8 text-xs font-black text-text-primary outline-none shadow-neu-inset focus:shadow-neu-inset-focused transition-all"
                                    />
                                </div>
                            )}

                            {/* Reps or Time */}
                            <div className={cn(isBodyweight ? "col-span-5" : "col-span-3")}>
                                {isTime ? (
                                    <TimeInput 
                                        value={set.duration_seconds} 
                                        onChange={(v) => onUpdateSet(exIndex, setIndex, 'duration_seconds', v)} 
                                        className="h-8 text-xs font-black bg-app shadow-neu-inset rounded-lg px-2"
                                    />
                                ) : (
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        value={set.reps ?? ''} 
                                        onChange={(e) => onUpdateSet(exIndex, setIndex, 'reps', e.target.value ? parseInt(e.target.value) : null)} 
                                        className="w-full bg-app rounded-lg text-center h-8 text-xs font-black text-text-primary outline-none shadow-neu-inset focus:shadow-neu-inset-focused transition-all"
                                    />
                                )}
                            </div>

                            {/* RIR */}
                            <div className="col-span-2">
                                <input 
                                    type="number" 
                                    placeholder="-" 
                                    value={set.rir ?? ''} 
                                    onChange={(e) => onUpdateSet(exIndex, setIndex, 'rir', e.target.value ? parseInt(e.target.value) : null)} 
                                    className="w-full bg-app rounded-lg text-center h-8 text-xs font-black text-text-primary outline-none shadow-neu-inset focus:shadow-neu-inset-focused transition-all"
                                />
                            </div>

                            {/* Remove Action */}
                            <div className="col-span-1 flex justify-center">
                                <button 
                                    onClick={() => onRemoveSet(exIndex, setIndex)} 
                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <Button 
                variant="outline" 
                className="w-full mt-4 border-dashed border-divider/40 hover:border-orange/50 uppercase tracking-widest font-black text-[10px] py-3 h-auto" 
                onClick={() => onAddSet(exIndex)}
            >
                <Plus size={12} strokeWidth={3} className="mr-1" /> Add Prescribed Set
            </Button>
        </div>
    );
}


