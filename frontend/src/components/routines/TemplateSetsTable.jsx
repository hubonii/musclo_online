// Editable table for routine template sets.
import { X } from 'lucide-react';
import TimeInput from '../ui/TimeInput';
import Button from '../ui/Button';
import Select from '../ui/Select';
// Renders editable template-set rows for one routine exercise.
export default function TemplateSetsTable({ sets, isBodyweight, isTime, exIndex, onUpdateSet, onRemoveSet, onAddSet }) {
return (<>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] md:text-xs uppercase tracking-widest text-text-muted border-b border-divider/10">
                        <th className="font-bold pb-2 w-8 md:w-10 text-center">Set</th>
                        <th className="font-bold pb-2 min-w-[100px] md:w-28">Type</th>
                        {!isBodyweight && <th className="font-bold pb-2 w-16 md:w-20 text-center">kg</th>}
                        <th className="font-bold pb-2 w-20 md:w-24 text-center">{isTime ? 'Time' : 'Reps'}</th>
                        <th className="font-bold pb-2 w-14 md:w-16 text-center">RIR</th>
                        <th className="font-bold pb-2 w-8 md:w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {/* Each row maps one template set object and writes edits back to parent state. */}
                    {sets.map((set, setIndex) => (<tr key={set.id} className="border-b border-divider/5 last:border-0 hover:bg-surface/30 transition-colors">
                            <td className="py-3 text-center">
                                <span className="w-6 h-6 rounded-md bg-surface shadow-neu-sm flex items-center justify-center text-xs font-bold text-text-secondary mx-auto">
                                    {setIndex + 1}
                                </span>
                            </td>
                            <td className="py-3 pr-2">
                                {/* Set type helps downstream logging classify warmups/drops/failure sets. */}
                                <Select variant="compact" value={set.set_type} onValueChange={(v) => onUpdateSet(exIndex, setIndex, 'set_type', v)} options={[
                { value: 'working', label: 'Normal' },
                { value: 'warmup', label: 'Warmup' },
                { value: 'dropset', label: 'Drop Set' },
                { value: 'failure', label: 'Failure' }
            ]}/>
                            </td>
                            {!isBodyweight && (<td className="py-2.5 md:py-3 pr-1 md:pr-2">
                                    <input type="number" placeholder="-" value={set.weight_kg !== null ? Math.round(set.weight_kg) : ''} onChange={(e) => onUpdateSet(exIndex, setIndex, 'weight_kg', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-surface text-xs md:text-sm font-bold text-center text-text-primary px-1.5 md:px-2 py-1.5 rounded-lg shadow-neu-inset outline-none placeholder:text-text-muted/50"/>
                                </td>)}
                            <td className="py-2.5 md:py-3 pr-1 md:pr-2">
                                {/* Metric switch keeps one table for reps-based and time-based templates. */}
                                {isTime ? (<TimeInput value={set.duration_seconds} onChange={(v) => onUpdateSet(exIndex, setIndex, 'duration_seconds', v)} className="flex items-center gap-0.5 w-full bg-surface rounded-lg shadow-neu-inset px-0.5 md:px-1 py-1 focus-within:ring-1 focus-within:ring-orange/50 transition-all"/>) : (<input type="number" placeholder="-" value={set.reps ?? ''} onChange={(e) => onUpdateSet(exIndex, setIndex, 'reps', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-surface text-xs md:text-sm font-bold text-center text-text-primary px-1.5 md:px-2 py-1.5 rounded-lg shadow-neu-inset outline-none placeholder:text-text-muted/50"/>)}
                            </td>
                            <td className="py-2.5 md:py-3 pr-1 md:pr-2">
                                <input type="number" placeholder="-" value={set.rir ?? ''} onChange={(e) => onUpdateSet(exIndex, setIndex, 'rir', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-surface text-xs md:text-sm font-bold text-center text-text-primary px-1.5 md:px-2 py-1.5 rounded-lg shadow-neu-inset outline-none placeholder:text-text-muted/50"/>
                            </td>
                            <td className="py-3 text-center">
                                <button onClick={() => onRemoveSet(exIndex, setIndex)} className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Remove set">
                                    <X size={14}/>
                                </button>
                            </td>
                        </tr>))}
                </tbody>
            </table>
            <Button variant="secondary" className="w-full mt-6 border-dashed border-divider/40 hover:border-orange/50 uppercase tracking-widest font-black text-[10px]" onClick={() => onAddSet(exIndex)}>
                {/* Adds a new template set row for the current exercise card. */}
                + Add Set
            </Button>
        </>);
}


