// Detailed exercise preview modal with media and muscle information.
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

// Shows full exercise details with media preview and optional add-action CTA.
export default function ExerciseDetailModal({ exercise, onClose, actionButtonText, onAction, isAdded = false }) {
    if (!exercise)
        return null;
return (<AnimatePresence>
            <motion.div key="detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50" onClick={onClose}/>

            <motion.div key="detail-content" initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 pointer-events-none">
                <div className="w-full max-w-[700px] max-h-[92vh] bg-surface rounded-xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
                    <div className="flex items-center justify-between p-4 bg-surface shrink-0">
                        <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors text-text-secondary">
                            <X size={20}/>
                        </button>
                        <h2 className="text-lg font-bold text-text-primary capitalize truncate">{exercise.name}</h2>
                        <button className="p-2 hover:bg-surface rounded-xl transition-colors text-text-secondary">
                            <div className="w-5 h-5 flex flex-col justify-center gap-1 items-center">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="w-full bg-app relative min-h-[300px] sm:min-h-[400px] flex items-center justify-center p-4">
                            {/* Prefer video, then static/gif thumbnail, then a clear no-media fallback. */}
                            {exercise.video_url ? (<video src={exercise.video_url} className="w-full h-full max-h-[400px] object-contain" autoPlay muted playsInline controls/>) : exercise.thumbnail_url || exercise.gif_url ? (<img src={exercise.thumbnail_url || exercise.gif_url || undefined} alt={exercise.name} className="w-full h-full max-h-[400px] object-contain mix-blend-multiply dark:mix-blend-screen"/>) : (<div className="text-text-muted flex flex-col items-center">
                                    <AlertCircle size={48} className="mb-4"/>
                                    <p>No video available</p>
                                </div>)}
                        </div>

                        <div className="p-6 sm:p-10 bg-app flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 lg:gap-16">
                            <div className="w-full sm:w-auto shrink-0 flex items-start justify-center relative min-h-[200px]">
                                {exercise.instructional_images && (() => {
            const data = exercise.instructional_images;
            const frontLayers = data.front_layers || [];
            const backLayers = data.back_layers || [];
            if (frontLayers.length === 0 && backLayers.length === 0)
                return false;
            // Renders ordered front/back anatomy layer arrays from instructional_images.
return (<div className="flex flex-row items-start justify-center gap-2 sm:gap-4">
                                            {frontLayers.length > 0 && (<div className="relative w-[100px] sm:w-[120px] aspect-[1/2.2]">
                                                    {frontLayers.map((imgUrl, idx) => (<img key={`front-${idx}`} src={imgUrl} alt={`${exercise.name} front layer ${idx}`} className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" style={{ zIndex: idx }} loading="lazy"/>))}
                                                </div>)}
                                            {backLayers.length > 0 && (<div className="relative w-[100px] sm:w-[120px] aspect-[1/2.2]">
                                                    {backLayers.map((imgUrl, idx) => (<img key={`back-${idx}`} src={imgUrl} alt={`${exercise.name} back layer ${idx}`} className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" style={{ zIndex: idx }} loading="lazy"/>))}
                                                </div>)}
                                        </div>);
        })() || (<div className="flex flex-col items-center gap-2">
                                            <div className="w-32 h-40 bg-surface rounded-2xl flex items-center justify-center relative shadow-neu-inset overflow-hidden">
                                                <div className="text-center">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Target</p>
                                                    <p className="font-display font-black text-xl text-orange capitalize">{exercise.muscle_group}</p>
                                                </div>
                                            </div>
                                        </div>)}
                            </div>

                            <div className="flex-1 w-full space-y-5 pt-2 sm:pt-4">
                                <h3 className="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase pb-4 border-b border-divider/10 mb-6">Exercise Details</h3>

                                <div className="grid grid-cols-[130px_1fr] lg:grid-cols-[150px_1fr] gap-y-7 text-[15px] items-start">
                                    <div className="text-[11px] font-black text-orange uppercase tracking-wider pt-0.5">Body Part</div>
                                    <div className="text-text-primary capitalize font-black leading-snug">{exercise.muscle_group}</div>

                                    <div className="text-[11px] font-black text-text-muted uppercase tracking-wider pt-0.5">Equipment</div>
                                    <div className="text-text-primary capitalize font-bold leading-snug">{exercise.equipment || 'No equipment'}</div>

                                    <div className="text-[11px] font-black text-text-muted uppercase tracking-wider pt-0.5">Primary Muscles</div>
                                    <div className="text-text-primary capitalize font-bold leading-snug">
                                        {/* Support legacy stringified arrays and native arrays from API. */}
                                        {exercise.primary_muscles ? (typeof exercise.primary_muscles === 'string'
            ? JSON.parse(exercise.primary_muscles).join(', ').replace(/_/g, ' ')
            : exercise.primary_muscles.join(', ').replace(/_/g, ' ')) : exercise.muscle_group}
                                    </div>

                                    {exercise.secondary_muscles && (<>
                                            <div className="text-[11px] font-black text-text-muted uppercase tracking-wider pt-0.5 leading-tight">Secondary Muscles</div>
                                            <div className="text-text-primary capitalize font-bold leading-snug opacity-70">
                                                {(() => {
                // Parses secondary_muscles from string or array payload formats.
                try {
                    return typeof exercise.secondary_muscles === 'string'
                        ? exercise.secondary_muscles.startsWith('[')
                            ? JSON.parse(exercise.secondary_muscles).join(', ').replace(/_/g, ' ')
                            : exercise.secondary_muscles.replace(/_/g, ' ')
                        : exercise.secondary_muscles.join(', ').replace(/_/g, ' ');
                }
                catch (e) {
                    return typeof exercise.secondary_muscles === 'string'
                        ? exercise.secondary_muscles
                        : 'Multiple';
                }
            })()}
                                            </div>
                                        </>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer action is optional so the same modal can be read-only or selectable. */}
                    {onAction && actionButtonText && (<div className="p-4 bg-app border-t border-divider/10 shrink-0">
                            <button onClick={() => {
                if (!isAdded) {
                    onAction(exercise);
                    onClose();
                }
            }} disabled={isAdded} className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${isAdded
                ? 'bg-divider/10 text-text-muted cursor-not-allowed shadow-neu-inset'
                : 'bg-orange text-white shadow-neu-orange border-t border-white/20 hover:brightness-110 active:shadow-neu-inset'}`}>
                                {isAdded ? 'Added' : actionButtonText}
                            </button>
                        </div>)}
                </div>
            </motion.div>
        </AnimatePresence>);
}

