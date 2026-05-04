// One timeline entry showing measurements and pose photos for a date.
import { motion } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';
const hasAnyMeasurementData = (m) => {
    if (!m)
        return false;
    // Detects whether at least one measurement key contains a non-empty value.
    const keys = ['weight_kg', 'body_fat_percent', 'chest_cm', 'waist_cm', 'left_arm_cm', 'right_arm_cm', 'left_leg_cm', 'right_leg_cm', 'calves_cm', 'shoulders_cm', 'neck_cm'];
    return keys.some(k => m[k] !== null && m[k] !== undefined && m[k] !== '');
};
export default function ProgressSessionCard({
    date,
    session,
    measurement,
    onDeletePhoto,
    onSessionClick,
    allowDelete = true,
    showOtherPhotos = true,
    compact = false,
}) {
    const poses = ['front', 'side', 'back'];
return (<motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-3 md:space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-divider/50 pb-2 px-2 flex-col sm:flex-row w-full mb-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Clock size={14} className="text-tertiary shrink-0"/>
                    <h4 className="text-base md:text-lg font-bold text-text-primary whitespace-nowrap">
                        {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </h4>
                </div>
            </div>

            {measurement && hasAnyMeasurementData(measurement) && (<div className="w-full mt-2 sm:mt-0 grid grid-cols-4 md:grid-cols-8 gap-x-1 gap-y-1 bg-divider/10 p-1 md:p-4 rounded-2xl shadow-neu-inset mb-4">
                    {measurement.weight_kg && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Weight</span>
                            <span className="text-xs md:text-sm font-black text-orange whitespace-nowrap">{measurement.weight_kg}k</span>
                        </div>)}
                    {measurement.body_fat_percent && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Fat %</span>
                            <span className="text-xs md:text-sm font-black text-text-primary whitespace-nowrap">{measurement.body_fat_percent}%</span>
                        </div>)}
                    {measurement.chest_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Chest</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.chest_cm}</span>
                        </div>)}
                    {measurement.waist_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Waist</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.waist_cm}</span>
                        </div>)}
                    {measurement.left_arm_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Arm (L)</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.left_arm_cm}</span>
                        </div>)}
                    {measurement.left_leg_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Leg (L)</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.left_leg_cm}</span>
                        </div>)}
                    {measurement.shoulders_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Shoulders</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.shoulders_cm}</span>
                        </div>)}
                    {measurement.calves_cm && (<div className="flex flex-col items-center sm:items-start overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Calves</span>
                            <span className="text-xs md:text-sm font-bold text-text-primary whitespace-nowrap">{measurement.calves_cm}</span>
                        </div>)}
                </div>)}

            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {poses.map(pose => {
            const photo = session[pose];
            // `compact` is used by dashboard previews, full mode by the progress page.
return (<div key={pose} className={`relative aspect-[3/4] ${compact ? 'rounded-xl md:rounded-2xl' : 'rounded-2xl md:rounded-2xl'} overflow-hidden shadow-neu-sm bg-surface flex flex-col group`} onClick={onSessionClick}>
                            {photo ? (<>
                                    <img src={photo.photo_url} alt={`${pose}`} className="w-full h-full object-cover" loading="lazy"/>
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"/>
                                     <div className={`absolute ${compact ? 'bottom-3 left-3' : 'bottom-2.5 left-2.5 md:bottom-4 md:left-4'} bg-app ${compact ? 'px-2 py-0.5' : 'px-1.5 py-0.25'} rounded-lg text-text-primary`}>
                                         <span className={`${compact ? 'text-[10px]' : 'text-[10px] md:text-xs'} font-bold capitalize`}>{pose}</span>
                                     </div>
                                    {allowDelete && onDeletePhoto && (<button onClick={(e) => {
                // Stops card click propagation when delete button is pressed.
                e.stopPropagation();
                onDeletePhoto(photo.id);
            }} className="absolute top-2 right-2 p-1.5 bg-danger/10 text-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-white" type="button">
                                        <Trash2 size={12}/>
                                    </button>)}
                                </>) : (<div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-divider/30 rounded-2xl md:rounded-2xl opacity-40 hover:opacity-100 transition-opacity cursor-pointer shadow-neu-inset">
                                    <p className="text-xs font-semibold text-text-secondary capitalize">{pose}</p>
                                    <p className={`${compact ? 'text-[10px]' : 'text-[9px]'} text-text-muted mt-1 whitespace-nowrap`}>Tap to add</p>
                                </div>)}
                        </div>);
        })}
            </div>

            {showOtherPhotos && session.other.length > 0 && (<div className="flex gap-4  pb-2 hide-scrollbar">
                    {session.other.map((photo) => (<div key={photo.id} className="relative w-32 aspect-square rounded-2xl overflow-hidden shadow-neu-sm shrink-0 group">
                            <img src={photo.photo_url} alt="Extra progress view" className="w-full h-full object-cover" loading="lazy"/>
                            {allowDelete && onDeletePhoto && (<button onClick={() => onDeletePhoto(photo.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-danger/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" type="button">
                                <Trash2 size={12}/>
                            </button>)}
                        </div>))}
                </div>)}
        </motion.div>);
}


