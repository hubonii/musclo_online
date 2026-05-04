// Workout history page with month grouping and workout detail modal access.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { apiClient } from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { useSettings } from '../hooks/useSettings';
import { formatWeight, formatDuration } from '../lib/utils';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import WorkoutDetailModal from '../components/history/WorkoutDetailModal';

import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

export default function HistoryPage() {
    const { data: workouts = [], isLoading: loading } = useWorkoutHistory(100);
    // Holds workout id used to open detail modal when a card is selected.
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
    const { toast } = useToast();
    const { data: settings } = useSettings();
    const isImperial = settings?.unit_system === 'imperial';

    // Groups workouts by month/year for sectioned timeline rendering.
    const groupedWorkouts = (workouts || []).reduce((groups, workout) => {
        const date = new Date(workout.started_at);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(workout);
        return groups;
    }, {});

return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto pb-24">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">History</h1>
                <p className="text-sm text-text-secondary mt-0.5">Review your past workouts and progress.</p>
            </motion.div>

            {loading ? (
                <LoadingSpinner size="lg" message="Loading history..." className="min-h-[400px] py-12" />
            ) : workouts.length === 0 ? (
                <EmptyState icon={<ActivityIcon size={48}/>} title="No history yet" description="Complete your first workout to start building your history log."/>
            ) : (
                <div className="space-y-8">
                    {/* Render one month section containing workout cards for that month. */}
                    {Object.entries(groupedWorkouts).map(([month, monthWorkouts]) => (
                        <div key={month} className="space-y-6">
                            <h2 className="text-lg md:text-xl font-black text-orange sticky top-4 mx-auto w-max px-5 py-1.5 bg-surface rounded-xl shadow-neu z-10">
                                {month}
                            </h2>

                            <motion.div className="space-y-4" variants={MOTION.staggerContainer} initial="initial" animate="animate">
                                {monthWorkouts.map((workout) => (
                                    <motion.div key={workout.id} variants={MOTION.staggerItem}>
                                        {/* Selecting a card opens the detail modal for that workout id. */}
                                        <Card hoverable className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer" onClick={() => setSelectedWorkoutId(workout.id)}>
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-divider/10 shadow-neu-inset rounded-xl text-center shrink-0">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        {new Date(workout.started_at).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-xl font-black text-text-primary leading-none mt-0.5">
                                                        {new Date(workout.started_at).getDate()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-lg text-text-primary group-hover:text-orange transition-colors">
                                                        {workout.name || 'Workout'}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary mt-1.5">
                                                        <span className="flex items-center gap-1 bg-divider/5 px-2 py-0.5 rounded-md">
                                                            <Clock size={12} className="text-orange"/> 
                                                            {formatDuration(workout.duration_seconds)}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-divider/5 px-2 py-0.5 rounded-md">
                                                            <Target size={12} className="text-tertiary"/> 
                                                            {formatWeight(parseFloat(workout.total_volume || '0'), isImperial ? 'lbs' : 'kg')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-divider/10 gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    {workout.top_muscles && workout.top_muscles.map((muscle) => (
                                                        <span key={muscle} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-tertiary/10 text-tertiary">
                                                            {muscle}
                                                        </span>
                                                    ))}
                                                    <Badge variant="default" className="font-bold bg-app shadow-neu-sm px-2 py-1">
                                                        {workout.sets?.length || 0} Sets
                                                    </Badge>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-divider/10 flex items-center justify-center group-hover:bg-orange text-text-muted group-hover:text-white transition-colors duration-100 shadow-neu-inset">
                                                    <ChevronRight size={16}/>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}

            <WorkoutDetailModal workoutId={selectedWorkoutId} onClose={() => setSelectedWorkoutId(null)}/>
        </div>
    );
}
