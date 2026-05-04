// Expandable measurement form used on the progress page.
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, ChevronUp, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
export default function MeasurementAccordion({ isOpen, onToggle, measurementForm, setMeasurementForm, onSave, isSaving }) {
    // Static field configuration used to render measurement inputs.
    const fields = [
        { key: 'weight_kg', label: 'Weight (kg)' },
        { key: 'chest_cm', label: 'Chest (cm)' },
        { key: 'waist_cm', label: 'Waist (cm)' },
        { key: 'shoulders_cm', label: 'Shoulders (cm)' },
        { key: 'neck_cm', label: 'Neck (cm)' },
        { key: 'left_arm_cm', label: 'L Arm (cm)' },
        { key: 'right_arm_cm', label: 'R Arm (cm)' },
        { key: 'left_leg_cm', label: 'L Leg (cm)' },
        { key: 'right_leg_cm', label: 'R Leg (cm)' },
        { key: 'calves_cm', label: 'Calves (cm)' },
        { key: 'body_fat_percent', label: 'Body Fat (%)' },
    ];
return (<Card className="overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-3 md:p-6 bg-transparent hover:bg-divider/10 transition-colors" type="button">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-app shadow-neu flex items-center justify-center text-orange">
                        <Ruler size={18}/>
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm md:text-lg font-black text-text-primary mb-1">Body Measurements</h3>
                        <p className="text-[10px] md:text-xs text-text-secondary font-medium">Weight, chest, arms, waist, fat</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={24} className="text-text-muted"/> : <ChevronDown size={24} className="text-orange shadow-sm"/>}
            </button>

            <AnimatePresence>
                {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-divider/10 overflow-hidden">
                        <form onSubmit={onSave} className="p-3 md:p-6 space-y-4 md:space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                {fields.map(field => (<div key={field.key} className="space-y-1.5">
                                        <label htmlFor={field.key} className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">
                                            {field.label}
                                        </label>
                                        {/* Immutable update avoids stale form values when typing quickly. */}
                                        <input id={field.key} type="number" step="0.1" value={measurementForm[field.key]} onChange={e => setMeasurementForm((f) => ({ ...f, [field.key]: e.target.value }))} className="w-full h-10 md:h-12 px-3 md:px-4 rounded-xl bg-app text-text-primary text-xs md:text-sm shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-orange/30 font-bold transition-all"/>
                                    </div>))}
                            </div>
                            <div className="flex justify-end pt-6 border-t border-divider/10">
                                <Button type="submit" variant="primary" isLoading={isSaving} className="px-8 font-black uppercase tracking-widest shadow-neu-orange/10">
                                    Save Measurements
                                </Button>
                            </div>
                        </form>
                    </motion.div>)}
            </AnimatePresence>
        </Card>);
}

