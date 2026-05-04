// Workout exercise card with set rows and per-exercise controls.
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import SetRow from './SetRow';
// Renders one exercise block with editable set rows inside active workout page.
const ExerciseCard = memo(({ exercise, eIdx, isImperial, activeSetId, profileWeight, onUpdateExerciseConfig, onRemoveExercise, onAddSet, onRemoveSet, onUpdateSet, onCompleteSet }) => {
return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            <Card className="overflow-visible">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-divider/10 text-text-secondary flex-shrink-0">
                            <span className="font-bold">{eIdx + 1}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary text-balance leading-tight">{exercise.exerciseName}</h3>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                                <p className="text-[11px] text-text-muted capitalize font-medium">{exercise.muscleGroup}</p>
                                <span className="text-divider inline-block">•</span>
                                {/* Type controls downstream row behavior (weight input, completion flow). */}
                                <Select variant="ghost-orange" value={exercise.type} onValueChange={(v) => onUpdateExerciseConfig(exercise.exerciseId, { type: v })} options={[
                                    { value: 'Weights', label: 'Weights' },
                                    { value: 'Bodyweight', label: 'Bodyweight' }
                                ]}/>
                                <span className="text-divider inline-block">•</span>
                                {/* Metric switches third column between reps and duration entry. */}
                                <Select variant="ghost-orange" value={exercise.targetMetric} onValueChange={(v) => onUpdateExerciseConfig(exercise.exerciseId, { targetMetric: v })} options={[
                                    { value: 'Reps', label: 'Reps' },
                                    { value: 'Time', label: 'Time' }
                                ]}/>
                            </div>
                        </div>
                    </div>
                    <button className="text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg p-2 transition-colors" onClick={() => window.confirm(`Remove ${exercise.exerciseName} from workout?`) && onRemoveExercise(exercise.exerciseId)} aria-label={`Remove ${exercise.exerciseName} from workout`}>
                        <Trash2 size={20}/>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-text-muted mb-3 px-1 text-center uppercase tracking-[0.2em]">
                    <div className="col-span-1 text-left px-1">Phase</div>
                    <div className="col-span-3 text-left pl-2">Recent</div>
                    {/* Header labels reflect selected unit system and target metric mode. */}
                    <div className="col-span-3">{isImperial ? 'lbs' : 'kg'}</div>
                    <div className="col-span-3">{exercise.targetMetric === 'Time' ? 'Time' : 'Reps'}</div>
                    <div className="col-span-2 flex justify-end pr-3"><Check size={14}/></div>
                </div>

                <div className="space-y-2 focus-within:ring-0">
                    <AnimatePresence>
                        {/* Each set row owns input/edit/complete interactions for one set. */}
                        {exercise.sets?.map((set, sIdx) => (<SetRow key={set.id} set={set} exercise={exercise} sIdx={sIdx} activeSetId={activeSetId} profileWeight={profileWeight} isImperial={isImperial} onRemoveSet={onRemoveSet} onUpdateSet={onUpdateSet} onCompleteSet={onCompleteSet}/>))}
                    </AnimatePresence>
                </div>

                <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => onAddSet(exercise.exerciseId)} className="w-full text-orange border-orange/20 hover:bg-orange/5 font-black uppercase tracking-widest text-[10px] py-4 h-auto shadow-neu-sm">
                        <Plus size={14} strokeWidth={3}/> ADD DATA SET
                    </Button>
                </div>
            </Card>
        </motion.div>);
});
export default ExerciseCard;

