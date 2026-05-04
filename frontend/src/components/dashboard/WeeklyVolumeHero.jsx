// Hero section summarizing weekly workout volume.
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import NumberTicker from '../ui/NumberTicker';
import LoadingSpinner from '../ui/LoadingSpinner';

// Renders weekly volume KPI and bar-chart series from precomputed dashboard data.
export default function WeeklyVolumeHero({ weeklyVolumeData, weeklyVolumeSum, itemVariants, loading }) {
    if (loading) {
        return (
            <motion.div
                variants={itemVariants}
                className="bg-app rounded-2xl md:rounded-3xl shadow-neu px-6 md:px-12 pt-12 md:pt-16 pb-10 md:pb-12 mb-8 md:mb-10 w-full max-w-4xl mx-auto z-10 relative min-h-[400px] flex items-center justify-center"
            >
                {/* Keep layout height stable while data is loading to avoid jumpy UI. */}
                <LoadingSpinner size="lg" message="Analyzing Weekly Volume..." />
            </motion.div>
        );
    }

    return (
        <motion.div variants={itemVariants} className=" rounded-2xl md:rounded-3xl shadow-neu px-6 md:px-12 pt-12 md:pt-16 pb-10 md:pb-12 mb-10 md:mb-10 w-full max-w-4xl mx-auto z-10 relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-[10px] md:text-xs font-bold text-text-primary tracking-wide uppercase mb-1">TOTAL VOLUME PER WEEK</p>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-orange tracking-tighter">
                            <NumberTicker value={Math.round(weeklyVolumeSum)} />
                        </h1>
                        <span className="text-base md:text-lg font-bold text-text-muted">kg</span>
                    </div>
                    <p className="text-xs md:text-sm text-text-secondary mt-2 font-medium">
                        {/* Simple KPIs derived from the weekly total for quick coaching context. */}
                        Strategic Average: {Math.round(weeklyVolumeSum / 7)} kg <span className="ml-4 md:float-right font-black text-orange uppercase tracking-widest text-[10px]">Target: {Math.round((weeklyVolumeSum / 7) * 1.2)} kg</span>
                    </p>
                </div>
            </div>

            <div className="w-full mt-8 relative min-h-[200px]">
                {/* Recharts consumes normalized `weeklyVolumeData` points for each weekday bar. */}
                <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.5 : 2.5}>
                    <BarChart data={weeklyVolumeData} barSize={24}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 800 }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', color: 'var(--text-primary)', fontWeight: 'bold' }} />
                        <Bar dataKey="volume" radius={[8, 8, 8, 8]} fill="var(--accent-orange)">
                            {/* Make all bars orange as requested by the user. */}
                            {weeklyVolumeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="var(--accent-orange)" fillOpacity={1} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

