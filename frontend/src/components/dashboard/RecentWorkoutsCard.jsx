import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityIcon, Dumbbell } from 'lucide-react';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import WorkoutDetailModal from '../history/WorkoutDetailModal';

/**
 * RecentWorkoutsCard displays a summary of the most recent workout logs on the dashboard.
 * Clicking a workout now opens the enhanced WorkoutDetailModal instead of navigating.
 */
export default function RecentWorkoutsCard({ workouts, loading }) {
    const navigate = useNavigate();
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

    if (loading) {
        return (
            <Card className="flex flex-col min-h-[350px] items-center justify-center p-8">
                <LoadingSpinner size="md" message="Fetching Performance Data..." />
            </Card>
        );
    }

    return (
        <>
            <Card className="flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
                        <ActivityIcon size={20} className="text-orange"/>
                        Recent Logs
                    </h3>
                    <button 
                        onClick={() => navigate('/history')} 
                        className="text-xs font-black text-orange uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                        Review All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 hide-scrollbar">
                    {(workouts || []).slice(0, 4).map(workout => (
                        <div 
                            key={workout.id} 
                            className="flex items-center justify-between p-4 rounded-2xl bg-app shadow-neu-inset cursor-pointer hover:bg-divider/5 transition-all group" 
                            onClick={() => setSelectedWorkoutId(workout.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface shadow-neu-sm flex items-center justify-center text-orange shrink-0 group-hover:shadow-neu-orange transition-shadow">
                                    <ActivityIcon size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary text-sm uppercase leading-tight tracking-tight">
                                        {workout.name || 'Workout'}
                                    </h4>
                                    <p className="text-[10px] text-text-secondary font-bold mt-1 opacity-60">
                                        {new Date(workout.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right ml-4">
                                <p className="font-black text-text-primary text-sm">
                                    {Math.round((workout.total_volume || 0) / 1000)}k
                                </p>
                                <p className="text-[8px] text-text-muted mt-0.5 font-black uppercase tracking-tighter">kg Volume</p>
                            </div>
                        </div>
                    ))}

                    {(!workouts || workouts.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted py-8 opacity-40">
                            <Dumbbell size={32} className="mb-2"/>
                            <p className="text-[10px] font-black uppercase tracking-widest">No Recent Performance Data</p>
                        </div>
                    )}
                </div>
            </Card>

            <WorkoutDetailModal 
                workoutId={selectedWorkoutId} 
                onClose={() => setSelectedWorkoutId(null)} 
            />
        </>
    );
}
