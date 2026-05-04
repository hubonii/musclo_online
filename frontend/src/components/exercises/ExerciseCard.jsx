// Exercise grid card used in library and picker-style lists.
import { motion } from 'framer-motion';
export default function ExerciseCard({ exercise, onClick }) {
    // Image source priority: `thumbnail_url` first, then `gif_url`.
    const imageUrl = exercise.thumbnail_url || exercise.gif_url;
return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            {/* Return full exercise object so parent can open details or add it directly. */}
            <div onClick={() => onClick(exercise)} className="relative bg-surface rounded-3xl overflow-hidden cursor-pointer group flex flex-col h-[300px] sm:h-[340px] shadow-neu hover:shadow-neu-lg hover:-translate-y-1 active:shadow-neu-inset active:translate-y-0.5 transition-colors duration-100">
                <div className="relative flex-1 bg-transparent overflow-hidden flex items-center justify-center p-4 mt-6">
                    {imageUrl && !imageUrl.endsWith('/') ? (<>
                            <img src={imageUrl} alt={exercise.name} className="w-full h-full object-contain filter hover:scale-105 transition-transform duration-500 scale-95" loading="lazy"/>
                        </>) : (<motion.div className="w-full h-full flex items-center justify-center text-text-muted/50 text-sm font-medium">No Image</motion.div>)}
                </div>

                <div className="p-4 sm:p-5 pt-2 shrink-0">
                    <h3 className="font-black text-text-primary capitalize text-[13px] sm:text-[15px] leading-tight mb-1.5 line-clamp-1">
                        {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-text-secondary text-[11px] font-bold capitalize">
                            {exercise.muscle_group}
                        </p>
                        {exercise.equipment && (<>
                                <span className="text-text-secondary text-[10px]">•</span>
                                <p className="text-text-secondary text-[11px] font-medium capitalize">
                                    {exercise.equipment}
                                </p>
                            </>)}
                    </div>
                </div>
            </div>
        </motion.div>);
}

