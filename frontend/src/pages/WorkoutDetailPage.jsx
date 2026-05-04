// Workout detail page with analytics, set breakdown, and repeat/delete actions.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Dumbbell, Activity, Trash2, Repeat, Share2 } from 'lucide-react';
import { apiClient } from '../api/axios';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import VolumeDoughnut from '../components/analytics/VolumeDoughnut.jsx';
import MuscleRadarChart from '../components/analytics/MuscleRadarChart.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useSettings } from '../hooks/useSettings';
import LoadingSpinner from '../components/ui/LoadingSpinner';
export default function WorkoutDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const { data: settings } = useSettings();
    const isImperial = settings?.unit_system === 'imperial';
    const { data: workout, isLoading } = useQuery({
        queryKey: ['history', 'detail', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/workouts/${id}`);
            return data.data;
        },
        // Query runs only when route id param exists.
        enabled: !!id,
    });
    if (isLoading) {
return (<div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
                <LoadingSpinner size="lg"/>
                <p className="mt-4 text-text-muted italic font-medium">Retrieving workout details...</p>
            </div>);
    }
    if (!workout) {
return (<div className="p-8 text-center text-text-muted">Workout not found.</div>);
    }
    const totalSets = workout.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;

    // Delete current workout log, then return user to history list.
    const handleDeleteWorkout = async () => {
        try {
            await apiClient.delete(`/workouts/${id}`);
            toast('success', 'Workout deleted');
            navigate('/history');
        }
        catch (err) {
            toast('error', 'Failed to delete workout');
        }
    };
    // Uses Web Share API when available; otherwise writes summary text to clipboard.
    const handleShare = async () => {
        const text = `I just completed a ${workout.name || 'workout'} on Musclo with ${workout.total_volume}kg total volume!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Musclo Workout', text, url: window.location.href });
            }
            catch (err) {
            }
        }
        else {
            navigator.clipboard.writeText(text);
            toast('success', 'Copied to clipboard!');
        }
    };
    // Rebuild a fresh in-progress session from the completed workout template.
    const handleRepeat = () => {
        // Map saved workout sets into fresh in-progress set rows for new session.
        const mappedExercises = workout.exercises.map((ex) => ({
            exerciseId: ex.exercise_id,
            exerciseName: ex.name,
            muscleGroup: ex.muscle_group,
            type: 'Weights',
            targetMetric: 'Reps',
            sets: ex.sets.map((s, idx) => ({
                id: crypto.randomUUID(),
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
                previousDurationSeconds: s.duration_seconds,
                targetWeightKg: null,
                targetReps: null,
                targetDurationSeconds: null
            }))
        }));
        useWorkoutStore.getState().startWorkout(workout.routine_id, workout.name, mappedExercises);
        navigate(workout.routine_id ? `/workout/${workout.routine_id}` : '/workout');
    };
return (<div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-6">

                <div className="flex items-center justify-between sticky top-0 bg-app z-30 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-divider shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-divider/10 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-text-primary"/>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">{workout.name || 'Workout'}</h1>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">
                                {new Date(workout.started_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                        <Trash2 size={24}/>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-divider/10 shadow-neu-inset rounded-3xl p-4 flex flex-col items-center justify-center text-center">
                        <Clock size={20} className="text-text-secondary mb-2"/>
                        <span className="text-xl font-black text-text-primary">{Math.max(1, Math.round(workout.duration_seconds / 60))}</span>
                        <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mt-1">Min</span>
                    </div>
                    <div className="bg-divider/10 shadow-neu-inset rounded-3xl p-4 flex flex-col items-center justify-center text-center border border-emerald/20">
                        <Dumbbell size={20} className="text-emerald mb-2"/>
                        <span className="text-xl font-black text-text-primary">{isImperial ? (workout.total_volume * 2.20462).toLocaleString(undefined, { maximumFractionDigits: 1 }) : workout.total_volume.toLocaleString()}</span>
                        <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mt-1">{isImperial ? 'Lbs' : 'Kg'}</span>
                    </div>
                    <div className="bg-divider/10 shadow-neu-inset rounded-3xl p-4 flex flex-col items-center justify-center text-center">
                        <Activity size={20} className="text-tertiary mb-2"/>
                        <span className="text-xl font-black text-text-primary">{totalSets}</span>
                        <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mt-1">Sets</span>
                    </div>
                </div>

                {workout.notes && (<div className="bg-divider/10 shadow-neu-inset rounded-3xl p-5 border border-divider pt-4 mt-6">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity size={16}/> Notes
                        </h3>
                        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                            {workout.notes}
                        </p>
                    </div>)}

                {workout.analytics && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Card className="flex flex-col">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 text-center">Muscle Focus</h3>
                            <div className="flex-1 min-h-0 bg-divider/10 shadow-neu-inset rounded-3xl p-4">
                                <MuscleRadarChart data={workout.analytics.radar} height={250}/>
                            </div>
                        </Card>
                        <Card className="flex flex-col">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 text-center">Volume Split</h3>
                            <div className="flex-1 min-h-0 bg-divider/10 shadow-neu-inset rounded-3xl p-4">
                                <VolumeDoughnut data={workout.analytics.doughnut} height={250}/>
                            </div>
                        </Card>
                    </div>)}

                <Card className="mt-8">
                    <h2 className="text-lg font-bold text-text-primary border-b border-divider pb-4 mb-4">Set Breakdown</h2>

                    <div className="space-y-6">
                        {workout.exercises?.map((exercise) => (<div key={exercise.exercise_id}>
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="font-bold text-text-primary">{exercise.name}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-tertiary/10 text-tertiary">
                                        {exercise.muscle_group}
                                    </span>
                                </div>

                                <div className="bg-divider/10 rounded-3xl shadow-neu-inset overflow-hidden border border-divider">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-[10px] uppercase tracking-widest text-text-muted border-b border-divider">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold w-12 text-center">Set</th>
                                                <th className="px-4 py-3 font-semibold text-center">Weight</th>
                                                <th className="px-4 py-3 font-semibold text-center">Reps</th>
                                                <th className="px-4 py-3 font-semibold text-center">RPE</th>
                                                <th className="px-4 py-3 font-semibold text-right">🏆</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exercise.sets.map((set) => (<tr key={set.id} className={`border-b border-divider last:border-0 ${set.set_type === 'warmup' ? 'text-text-muted bg-app' : 'text-text-primary'}`}>
                                                    <td className="px-4 py-3 text-center font-bold">
                                                        {set.set_type === 'warmup' ? 'W' : set.set_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold">{isImperial ? (set.weight_kg * 2.20462).toFixed(1) : set.weight_kg} <span className="text-xs text-text-muted font-normal">{isImperial ? 'lbs' : 'kg'}</span></td>
                                                    <td className="px-4 py-3 text-center font-bold">{set.reps}</td>
                                                    <td className="px-4 py-3 text-center">{set.rpe || '-'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {set.is_pr && (<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-tertiary/20 text-tertiary shadow-sm">
                                                                ★
                                                            </span>)}
                                                    </td>
                                                </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>))}
                    </div>
                </Card>

                {/* Sticky action bar keeps repeat/share actions reachable at the bottom. */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-surface p-2 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-divider flex gap-2 z-40">
                    <Button variant="primary" className="flex-1 rounded-full text-sm" onClick={handleRepeat}>
                        <Repeat size={16} className="mr-2"/> Repeat
                    </Button>
                    <Button variant="secondary" className="px-6 rounded-full text-sm" onClick={handleShare}>
                        <Share2 size={16}/>
                    </Button>
                </div>

                <ConfirmDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen} title="Delete Workout" description="Are you sure you want to delete this workout? This action cannot be undone." confirmLabel="Delete" variant="danger" onConfirm={handleDeleteWorkout}/>

            </motion.div>
        </div>);
}


