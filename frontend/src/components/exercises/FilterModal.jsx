// Advanced filter modal for exercises (equipment + body part).
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, User as UserIcon, Weight, Link as LinkIcon, Waves, Circle, Settings as SettingsIcon, Shield, Activity as ActivityIcon, Hexagon, Target, Component as ComponentIcon, Box } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { cn } from '../../lib/utils';

const getEqIcon = (n) => {
    const l = n.toLowerCase();
    if (l.includes('body')) return UserIcon;
    if (l.includes('dumb') || l.includes('barbell')) return Dumbbell;
    if (l.includes('band') || l.includes('rope')) return Waves;
    if (l.includes('cable')) return LinkIcon;
    if (l.includes('weighted') || l.includes('kettle')) return Weight;
    if (l.includes('machine') || l.includes('smith')) return SettingsIcon;
    if (l.includes('ball') || l.includes('roll')) return Circle;
    if (l.includes('trap')) return Hexagon;
    return Box;
};

const getBpIcon = (n) => {
    const l = n.toLowerCase();
    if (l.includes('chest')) return Shield;
    if (l.includes('back')) return ComponentIcon;
    if (l.includes('leg') || l.includes('calf') || l.includes('thigh')) return ActivityIcon;
    if (l.includes('arm') || l.includes('bicep') || l.includes('tricep')) return Dumbbell;
    if (l.includes('shoulder')) return Target;
    if (l.includes('abs') || l.includes('core')) return Box;
    return Target;
};

// Modal used to choose advanced body-part and equipment filters.
export default function FilterModal({ isOpen, onClose, selectedBodyPart, setSelectedBodyPart, selectedEquipment, setSelectedEquipment }) {
const [equipmentList, setEquipmentList] = useState([]);
const [bodyPartList, setBodyPartList] = useState([]);
const [isLoading, setIsLoading] = useState(false);
useEffect(() => {
        if (!isOpen)
            return;
        if (equipmentList.length > 0)
            return; // already loaded
        // Load filter options when modal opens for the first time.
        const fetchFilters = async () => {
            setIsLoading(true);
            try {
                const { data } = await apiClient.get('/exercises/filters');
                
                // Only keep equipment types explicitly requested by the user for a cleaner UX.
                const allowedEquipment = ['dumbbell', 'barbell', 'cable', 'machine', 'leverage machine', 'smith machine', 'body weight', 'bodyweight'];
                const filteredEquipment = (data.data.equipment || []).filter(eq => 
                    allowedEquipment.includes(eq.toLowerCase())
                );
                
                setBodyPartList(data.data.body_parts || []);
                setEquipmentList(filteredEquipment);
            }
            catch (err) {
                console.error("Failed to fetch filters", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchFilters();
    }, [isOpen, equipmentList.length]);
    // Render modal only when open so fetch and motion lifecycle stay scoped.
return (<AnimatePresence>
            {isOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90" onClick={onClose}/>
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="relative bg-app md:rounded-3xl shadow-2xl w-full h-full md:h-auto md:w-[600px] max-h-[100vh] md:max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-6 shrink-0 border-b border-divider/5">
                            <h2 className="text-xl font-bold text-text-primary tracking-tight">Browse Filters</h2>
                            <button onClick={onClose} className="p-2 hover:bg-divider/10 rounded-full transition-colors text-text-secondary">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8 flex-1">
                            <section>
                                <h3 className="text-sm font-bold text-text-primary mb-4 tracking-wide font-display">Equipment</h3>
                                {isLoading ? (<div className="text-sm text-text-muted">Loading equipment...</div>) : (<div className="grid grid-cols-3 gap-3">
                                        {equipmentList.map(eq => (<button key={`eq-${eq}`} onClick={() => setSelectedEquipment(selectedEquipment === eq ? null : eq)} className={cn("flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-100 min-h-[60px]", selectedEquipment === eq
                        ? "bg-orange/10 text-orange shadow-neu-inset ring-1 ring-orange/20 scale-95"
                        : "bg-surface text-text-secondary hover:bg-divider/10 hover:scale-105 shadow-neu-sm")}>
                                                <span className="text-[11px] font-black text-center leading-tight capitalize uppercase tracking-tight">{eq}</span>
                                            </button>))}
                                    </div>)}
                            </section>

                        </div>

                         <div className="p-6 bg-app rounded-b-[32px] gap-4 flex shadow-neu-inset border-t border-divider/10">
                            <button onClick={() => { setSelectedBodyPart(null); setSelectedEquipment(null); }} className="flex-1 py-4 px-6 rounded-full font-bold text-text-secondary hover:bg-surface hover:shadow-neu transition-colors duration-100">
                                Clear All
                            </button>
                            <button onClick={onClose} className="flex-1 py-4 px-6 rounded-full font-bold bg-orange text-white hover:brightness-110 transition-all duration-100 shadow-neu hover:shadow-neu-lg hover:-translate-y-1">
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </div>)}
        </AnimatePresence>);
}


