// Compact dashboard stat tiles for core performance metrics.
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityIcon, TrendingUp as TrendingUpIcon, Flame, Clock } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
export default function StatsStrip({ workoutStats, itemVariants, loading }) {
    const navigate = useNavigate();

    // Render a full-width placeholder if stats are still loading or unavailable.
    if (loading || !workoutStats) {
        return (<motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-6 px-6 md:px-12 max-w-4xl mx-auto relative z-20 mb-4">
            <div className="col-span-2 md:col-span-4 bg-app rounded-2xl shadow-neu-sm flex items-center justify-center p-8 min-h-[116px]">
                <LoadingSpinner size="md" />
            </div>
        </motion.div>);
    }
    return (<motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-6 px-6 md:px-12 max-w-4xl mx-auto relative z-20 mb-4">
        <div className="rounded-2xl p-5 shadow-neu flex flex-col items-center text-center transition-all border border-transparent">
            <ActivityIcon size={24} className="text-orange mb-2" />
            <span className="text-xl font-black text-text-primary tracking-tighter">{workoutStats.workouts.total}</span>
            <span className="text-[9px] uppercase font-black text-text-muted tracking-[0.2em] mt-1.5 opacity-70">Total Logs</span>
        </div>
        <div className="rounded-2xl p-5 shadow-neu flex flex-col items-center text-center transition-all border border-transparent">
            <TrendingUpIcon size={24} className="text-orange/80 mb-2" />
            <span className="text-xl font-black text-text-primary tracking-tighter">{workoutStats.workouts.this_week}</span>
            <span className="text-[9px] uppercase font-black text-text-muted tracking-[0.2em] mt-1.5 opacity-70">This Week</span>
        </div>
        <div className="rounded-2xl p-5 shadow-neu flex flex-col items-center text-center transition-all border border-transparent">
            <Flame size={24} className="text-orange/60 mb-2" />
            {/* Convert kilograms to a short "k" format to keep the tile compact. */}
            <span className="text-xl font-black text-text-primary tracking-tighter">{Math.round(workoutStats.volume.total_kg / 1000)}K</span>
            <span className="text-[9px] uppercase font-black text-text-muted tracking-[0.2em] mt-1.5 opacity-70">Kg Lifted</span>
        </div>
        <div className="rounded-2xl p-5 shadow-neu flex flex-col items-center text-center transition-all border border-transparent">
            <Clock size={24} className="text-orange/40 mb-2" />
            {/* Convert total seconds to hours for easier long-term tracking. */}
            <span className="text-xl font-black text-text-primary tracking-tighter">{Math.round((workoutStats.time.total_seconds || 0) / 3600)}H</span>
            <span className="text-[9px] uppercase font-black text-text-muted tracking-[0.2em] mt-1.5 opacity-70">Total Time</span>
        </div>
    </motion.div>);
}

