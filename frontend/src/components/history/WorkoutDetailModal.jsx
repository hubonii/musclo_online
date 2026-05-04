import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Dumbbell, Activity, Trash2, Repeat, Share2, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import VolumeDoughnut from '../analytics/VolumeDoughnut.jsx';
import MuscleRadarChart from '../analytics/MuscleRadarChart.jsx';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { useSettings } from '../../hooks/useSettings';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { formatWeight, cn } from '../../lib/utils';

// Fetches one workout detail payload and renders stats, charts, and set tables.
export default function WorkoutDetailModal({ workoutId, onClose }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: settings } = useSettings();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const isImperial = settings?.unit_system === 'imperial';

    const { data: workout, isLoading } = useQuery({
        queryKey: ['history', 'detail', workoutId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/workouts/${workoutId}`);
            return data.data;
        },
        enabled: !!workoutId,
    });

    if (!workoutId) return null;

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/workouts/${workoutId}`);
            queryClient.invalidateQueries({ queryKey: ['history'] });
            toast('success', 'Workout deleted');
            onClose();
        } catch (err) {
            toast('error', 'Failed to delete workout');
        }
    };

    const handleRepeat = () => {
        const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        
        const mappedExercises = workout.exercises.map((ex) => ({
            exerciseId: ex.exercise_id,
            exerciseName: ex.name,
            muscleGroup: ex.muscle_group,
            type: 'Weights',
            targetMetric: 'Reps',
            sets: ex.sets.map((s, idx) => ({
                id: generateId(),
                exerciseId: ex.exercise_id,
                exerciseName: ex.name,
                setNumber: idx + 1,
                set_type: s.set_type,
                weight_kg: s.weight_kg,
                reps: s.reps,
                duration_seconds: s.duration_seconds,
                rir: null,
                rpe: s.rpe,
                isCompleted: false,
                isPR: false,
                previousWeight: s.weight_kg,
                previousReps: s.reps,
                previousDurationSeconds: s.duration_seconds
            }))
        }));
        
        useWorkoutStore.getState().startWorkout(workout.routine_id, workout.name, mappedExercises);
        onClose();
        navigate('/workout'); // Navigate to active workout view
    };

    const handleShare = async () => {
        const text = `Check out my ${workout.name || 'workout'} on Musclo! ${workout.total_volume}kg total volume.`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Musclo Workout', text, url: window.location.href }); } catch (err) {}
        } else {
            navigator.clipboard.writeText(text);
            toast('success', 'Copied to clipboard!');
        }
    };

    const totalSets = workout?.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;

    return (
        <Modal open={!!workoutId} onOpenChange={(isOpen) => !isOpen && onClose()} title={workout?.name || 'Workout Details'}>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-text-muted italic font-medium uppercase tracking-widest text-[10px]">Retrieving Athlete Data...</p>
                </div>
            ) : !workout ? (
                <div className="p-8 text-center text-text-muted uppercase font-bold">Log Record Obscured.</div>
            ) : (
                <div className="space-y-6 pb-20">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-60">
                            {new Date(workout.started_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-text-muted hover:text-danger transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-divider/5 shadow-neu-inset rounded-[28px] p-4 flex flex-col items-center justify-center text-center">
                            <Clock size={16} className="text-text-muted mb-2" />
                            <span className="text-lg font-black text-text-primary">{Math.max(1, Math.round(workout.duration_seconds / 60))}</span>
                            <span className="text-[8px] uppercase font-black text-text-muted tracking-tighter mt-1">Minutes</span>
                        </div>
                        <div className="bg-divider/10 shadow-neu-inset rounded-[28px] p-4 flex flex-col items-center justify-center text-center border border-orange/10 min-w-0 overflow-hidden">
                            <Dumbbell size={16} className="text-orange mb-2" />
                            <span className="text-lg font-black text-text-primary truncate w-full">{formatWeight(workout.total_volume, isImperial ? 'lbs' : 'kg')}</span>
                            <span className="text-[8px] uppercase font-black text-text-muted tracking-tighter mt-1">{isImperial ? 'Lbs' : 'Kg'}</span>
                        </div>
                        <div className="bg-divider/5 shadow-neu-inset rounded-[28px] p-4 flex flex-col items-center justify-center text-center">
                            <Activity size={16} className="text-orange/60 mb-2" />
                            <span className="text-lg font-black text-text-primary">{totalSets}</span>
                            <span className="text-[8px] uppercase font-black text-text-muted tracking-tighter mt-1">Sets</span>
                        </div>
                    </div>

                    {workout.notes && (
                        <div className="bg-divider/5 shadow-neu-inset rounded-[28px] p-5 border border-divider/10">
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                <MessageSquare size={14} className="text-orange" /> Notes
                            </h3>
                            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap font-medium italic opacity-80">
                                "{workout.notes}"
                            </p>
                        </div>
                    )}

                    {workout.analytics && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 rounded-[32px] overflow-hidden">
                                    <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4 text-center">Muscle Focus</h3>
                                    <div className="bg-app shadow-neu-inset rounded-[24px] p-2">
                                        <MuscleRadarChart data={workout.analytics.radar} height={180} />
                                    </div>
                                </Card>
                                <Card className="p-4 rounded-[32px] overflow-hidden">
                                    <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4 text-center">Volume Load</h3>
                                    <div className="bg-app shadow-neu-inset rounded-[24px] p-2">
                                        <VolumeDoughnut data={workout.analytics.doughnut} height={180} />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <div className="h-4 w-1 bg-orange rounded-full" />
                            <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">Exercise Intelligence</h2>
                        </div>
                        
                        {workout.exercises?.map((exercise) => (
                            <div key={exercise.exercise_id} className="space-y-3">
                                <div className="flex items-center gap-4 px-2">
                                    {exercise.gif_url && (
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-neu-sm overflow-hidden p-1">
                                            <img src={exercise.gif_url} alt={exercise.name} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-black text-text-primary text-sm uppercase leading-tight tracking-tight">{exercise.name}</h3>
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange/10 text-orange-600 inline-block mt-1">
                                            {exercise.muscle_group}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-app shadow-neu-inset rounded-[28px] overflow-hidden border border-divider/5">
                                    <table className="w-full text-[11px] text-left">
                                        <thead className="text-[8px] uppercase tracking-widest text-text-muted border-b border-divider/5">
                                            <tr>
                                                <th className="px-5 py-3 font-black w-14 text-center">Set</th>
                                                <th className="px-5 py-3 font-black text-center">Load</th>
                                                <th className="px-5 py-3 font-black text-center">Reps</th>
                                                <th className="px-5 py-3 font-black text-center">RPE</th>
                                                <th className="px-5 py-3 font-black text-right"><Star size={10} className="inline" /></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exercise.sets.map((set) => (
                                                <tr key={set.id} className={cn("border-b border-divider/5 last:border-0", set.set_type === 'warmup' ? 'text-text-muted opacity-60' : 'text-text-primary')}>
                                                    <td className="px-5 py-3 text-center font-black">
                                                        {set.set_type === 'warmup' ? 'W' : set.set_number}
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-bold">
                                                        {isImperial ? (set.weight_kg * 2.20462).toFixed(1) : set.weight_kg}
                                                        <span className="text-[9px] text-text-muted ml-1">{isImperial ? 'lb' : 'kg'}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-bold">{set.reps}</td>
                                                    <td className="px-5 py-3 text-center font-bold opacity-60">{set.rpe || '-'}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        {set.is_pr && <Star size={14} className="text-orange fill-orange inline" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-surface p-2 rounded-[32px] shadow-neu-lg border border-divider/20 flex gap-2 z-40">
                        <Button variant="primary" className="flex-1 rounded-[24px] text-xs font-black uppercase tracking-widest h-12" onClick={handleRepeat} icon={<Repeat size={16} />}>
                            Repeat Workout
                        </Button>
                        <Button variant="secondary" className="px-5 rounded-[24px] h-12 hover:text-orange" onClick={handleShare}>
                            <Share2 size={18} />
                        </Button>
                    </div>

                    <ConfirmDialog 
                        open={deleteModalOpen} 
                        onOpenChange={setDeleteModalOpen} 
                        title="Purge Performance Log" 
                        description="Are you sure you want to permanently remove this performance record?" 
                        confirmLabel="Purge" 
                        variant="danger" 
                        onConfirm={handleDelete} 
                    />
                </div>
            )}
        </Modal>
    );
}
