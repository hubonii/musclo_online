// Workout session page: start, log sets, and save completed workouts.
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, StickyNote } from 'lucide-react';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useRestTimerStore } from '../stores/useRestTimerStore';
import { useToast } from '../components/ui/Toast';
import { MOTION } from '../lib/motion';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import ExercisePicker from '../components/routines/ExercisePicker';
import { apiGet, apiPost } from '../api/axios';
import { cacheSet, cacheGet } from '../lib/offlineCache';
import { queueWorkoutSave } from '../lib/offlineQueue';
import { formatWeight } from '../lib/utils';
import { useSettings } from '../hooks/useSettings';
import { useMeasurements } from '../hooks/useMeasurements';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import ExerciseCard from '../components/workout/ExerciseCard';
import WorkoutFinishDialog from '../components/workout/WorkoutFinishDialog';
import { useAuthStore } from '../stores/useAuthStore';

export default function WorkoutPage() {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    const { routineId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: settings } = useSettings();
    const isImperial = settings?.unit_system === 'imperial';
    const { data: measurements } = useMeasurements();
    
    // Extract the user's most recent logged weight to be used for bodyweight exercises.
    const profileWeight = useMemo(() => {
        return measurements && measurements.length > 0 ? measurements[0].weight_kg : null;
    }, [measurements]);

    // Bind to global workout state to ensure persistence across page navigation.
    const isActive = useWorkoutStore(state => state.isActive);
    const startedAt = useWorkoutStore(state => state.startedAt);
    const notes = useWorkoutStore(state => state.notes);
    const restTimerRunning = useRestTimerStore(state => state.restTimerRunning);
    const restTimerEnd = useRestTimerStore(state => state.restTimerEnd);
    const setNotes = useWorkoutStore(state => state.setNotes);
    const startWorkout = useWorkoutStore(state => state.startWorkout);
    const finishWorkout = useWorkoutStore(state => state.finishWorkout);
    const resetWorkout = useWorkoutStore(state => state.resetWorkout);
    const cancelWorkout = useWorkoutStore(state => state.cancelWorkout);
    const fetchPreviousData = useWorkoutStore(state => state.fetchPreviousData);
    const stopRestTimer = useRestTimerStore(state => state.stopRestTimer);
    const addExercise = useWorkoutStore(state => state.addExercise);
    const removeExercise = useWorkoutStore(state => state.removeExercise);
    const addSet = useWorkoutStore(state => state.addSet);
    const removeSet = useWorkoutStore(state => state.removeSet);
    const updateSet = useWorkoutStore(state => state.updateSet);
    const completeSet = useWorkoutStore(state => state.completeSet);
    const updateExerciseConfig = useWorkoutStore(state => state.updateExerciseConfig);
    const exercises = useWorkoutStore(state => state.exercises);
    const totalVolume = useWorkoutStore(state => state.totalVolume);
    const completedSetsCount = useWorkoutStore(state => state.completedSetsCount);

    const activeSetId = useMemo(() => {
        if (!isActive) return null;
        for (const ex of exercises) {
            const uncompleted = ex.sets?.find((s) => !s.isCompleted);
            if (uncompleted) return uncompleted.id;
        }
        return null;
    }, [exercises, isActive]);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [pendingRoutine, setPendingRoutine] = useState(null);
    const [isLoadingRoutine, setIsLoadingRoutine] = useState(false);
    const [recentRoutines, setRecentRoutines] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (routineId && routineId !== 'undefined' && !isActive && !pendingRoutine && !isLoadingRoutine) {
            const fetchRoutine = async () => {
                setIsLoadingRoutine(true);
                try {
                    const routine = await apiGet(`/routines/${routineId}`);
                    setPendingRoutine(routine);
                    // Cache routine for offline workout starts.
                    cacheSet(`routine-${routineId}`, routine);
                } catch (e) {
                    // Fall back to cached routine when offline.
                    const cached = cacheGet(`routine-${routineId}`, 7 * 24 * 60 * 60 * 1000);
                    if (cached) {
                        setPendingRoutine(cached);
                    } else {
                        toast('error', 'Failed to load workout');
                    }
                } finally {
                    setIsLoadingRoutine(false);
                }
            };
            fetchRoutine();
        }
    }, [routineId, isActive, pendingRoutine, isLoadingRoutine, toast]);

    useEffect(() => {
        if (!isActive && !routineId && !pendingRoutine) {
            const fetchHistory = async () => {
                setIsLoadingHistory(true);
                try {
                    const logs = await apiGet('/workouts/history', { per_page: 20 });
                    const routinesMap = new Map();
                    logs.forEach((log) => {
                        if (log.routine && !routinesMap.has(log.routine.id)) {
                            routinesMap.set(log.routine.id, log.routine);
                        }
                    });
                    setRecentRoutines(Array.from(routinesMap.values()).slice(0, 5));
                } catch (e) {
                    console.error('Failed to load history for workouts');
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [isActive, routineId, pendingRoutine]);

    useEffect(() => {
        if (!isActive || !startedAt) return;
        const checkAndSetTimer = () => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - new Date(startedAt).getTime()) / 1000);
            if (elapsedSeconds > 28800) {
                cancelWorkout();
                toast('info', 'Abandoned session was auto-cleared.');
                return false;
            }
            if (restTimerRunning && restTimerEnd && now >= restTimerEnd) {
                stopRestTimer();
            }
            setElapsed(elapsedSeconds);
            return true;
        };
        if (checkAndSetTimer()) {
            const interval = setInterval(checkAndSetTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, startedAt, cancelWorkout, toast, restTimerRunning, restTimerEnd, stopRestTimer]);

    const handleUpdateExerciseConfig = useCallback((exId, config) => {
        updateExerciseConfig(exId, config);
    }, [updateExerciseConfig]);

    const handleRemoveExercise = useCallback((exId) => {
        removeExercise(exId);
    }, [removeExercise]);

    const handleAddSet = useCallback((exId) => {
        addSet(exId);
    }, [addSet]);

    const handleRemoveSet = useCallback((exId, setId) => {
        removeSet(exId, setId);
    }, [removeSet]);

    const handleUpdateSet = useCallback((exId, setId, field, value) => {
        updateSet(exId, setId, field, value);
    }, [updateSet]);

    const handleCompleteSet = useCallback((exId, setId) => {
        completeSet(exId, setId);
    }, [completeSet]);

    const handleAddExercise = useCallback((exercise) => {
        addExercise({ id: exercise.id, name: exercise.name, muscleGroup: exercise.muscle_group, type: exercise.type, target_metric: exercise.target_metric });
        setIsPickerOpen(false);
        toast('success', `Added ${exercise.name}`);
    }, [addExercise, toast]);

    const handleSetNotes = useCallback((e) => {
        setNotes(e.target.value);
    }, [setNotes]);

    useEffect(() => {
        if (!isActive) return;
        exercises.forEach(ex => {
            if (!ex.hasFetchedHistory) {
                fetchPreviousData(ex.exerciseId);
            }
        });
    }, [isActive, exercises, fetchPreviousData]);

    const handleStartWorkout = () => {
        if (pendingRoutine) {
            const initialExercises = pendingRoutine.exercises.map((ex) => ({
                exerciseId: ex.id,
                exerciseName: ex.name,
                muscleGroup: ex.muscle_group,
                type: ex.pivot?.override_type || (ex.equipment === 'Body Weight' ? 'Bodyweight' : 'Weights'),
                targetMetric: ex.pivot?.override_metric || 'Reps',
                hasFetchedHistory: false,
                restTimerSeconds: ex.pivot?.rest_timer_seconds ?? null,
                sets: (ex.sets?.length ? ex.sets : Array(ex.pivot?.target_sets || 1).fill({})).map((s, i) => ({
                    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    setNumber: i + 1,
                    set_type: s.set_type || 'working',
                    weight_kg: null,
                    reps: null,
                    duration_seconds: null,
                    rir: s.rir ?? null,
                    rpe: s.rpe ?? null,
                    isCompleted: false,
                    isPR: false,
                    previousWeight: null,
                    previousReps: null,
                    previousDurationSeconds: null,
                    targetWeightKg: s.weight_kg ?? null,
                    targetReps: s.reps ?? null,
                    targetDurationSeconds: s.duration_seconds ?? null,
                }))
            }));
            startWorkout(Number(pendingRoutine.id), pendingRoutine.name, initialExercises);
        } else {
            startWorkout(null, 'Freestyle Workout', []);
        }
    };

    const handleFinish = async () => {
        if (completedSetsCount() === 0) {
            toast('error', 'Complete at least one set to save.');
            setFinishModalOpen(false);
            return;
        }
        const payload = finishWorkout();
        if (!payload) return;
        
        payload.sets = payload.sets.map((set) => {
            const exercise = exercises.find((e) => e.exerciseId === set.exercise_id);
            if (exercise?.type === 'Bodyweight' && profileWeight) {
                return { ...set, weight_kg: profileWeight };
            }
            return set;
        });

        try {
            await apiPost('/workouts', payload);
            const volumeKg = payload.sets.reduce((sum, set) => sum + (set.weight_kg * (set.reps ?? 0)), 0);
            const displayWeight = formatWeight(volumeKg, isImperial ? 'lbs' : 'kg');
            queryClient.invalidateQueries({ queryKey: queryKeys.workouts.history });
            queryClient.invalidateQueries({ queryKey: queryKeys.workouts.stats });
            queryClient.invalidateQueries({ queryKey: queryKeys.routines.today });
            resetWorkout();
            toast('success', `Protocol Saved. Volume: ${displayWeight}`);
            navigate('/history');
        } catch (err) {
            // Queue workout for later sync when offline, tagged with current user ID.
            queueWorkoutSave(payload, user?.id);
            resetWorkout();
            toast('success', 'Saved offline — will sync when connected.');
            navigate('/history');
        }
    };

    const handleCancel = () => {
        cancelWorkout();
        setCancelModalOpen(false);
        navigate(-1);
    };

    if (!isActive) {
        return (
            <div className="p-4 md:p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <motion.div {...MOTION.pageEnter} className="space-y-6">
                    <div className="w-20 h-20 bg-orange/10 text-orange rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-neu-sm border border-orange/20">
                        <Play size={32} className="ml-1"/>
                    </div>
                    {isLoadingRoutine ? (
                        <div className="flex justify-center p-4"><LoadingSpinner size="lg" /></div>
                    ) : pendingRoutine ? (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">{pendingRoutine.name}</h1>
                                <p className="text-text-secondary mt-2 font-medium">{pendingRoutine.exercises?.length || 0} exercises planned.</p>
                            </div>
                            <Button size="lg" variant="primary" onClick={handleStartWorkout} className="w-full sm:w-auto px-12 py-7 text-xl shadow-neu-orange border-4 border-white/20">
                                START WORKOUT
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center items-center flex-col pt-4">
                            <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase">Workout <span className="text-orange">Log</span></h1>
                            <p className="text-text-secondary max-w-sm mb-10 mx-auto font-medium">Choose a routine or start a quick session.</p>

                            <Button size="lg" variant="primary" onClick={handleStartWorkout} className="w-full sm:w-auto px-12 py-6 text-lg shadow-neu-orange border-4 border-white/20 mb-12">
                                <Plus className="mr-2" size={24} strokeWidth={3}/>
                                QUICK WORKOUT
                            </Button>

                            <div className="w-full max-w-md text-left">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em] mb-6 border-b border-divider pb-2">Recent Routines</h3>
                                {isLoadingHistory ? (
                                    <div className="flex justify-center p-4"><LoadingSpinner size="sm" /></div>
                                ) : recentRoutines.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentRoutines.map((routine) => (
                                            <Card key={routine.id} className="p-5 flex items-center justify-between cursor-pointer hover:bg-orange/5 group shadow-neu-sm" onClick={() => navigate(`/workout/${routine.id}`)}>
                                                <div>
                                                    <h4 className="font-extrabold text-text-primary group-hover:text-orange transition-colors uppercase tracking-tight">{routine.name}</h4>
                                                    <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-widest">Routine</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-app shadow-neu text-text-muted group-hover:text-orange flex items-center justify-center transition-all group-hover:shadow-neu-inset">
                                                    <Play size={20} className="ml-1"/>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-app shadow-neu-inset rounded-3xl">
                                        <p className="text-sm text-text-muted mb-4 italic font-medium">No recent workouts found.</p>
                                        <Button variant="outline" size="sm" onClick={() => navigate('/programs')} className="shadow-neu-sm">Browse Programs</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-app">
            <WorkoutHeader elapsed={elapsed} totalVolume={totalVolume()} isImperial={isImperial} onCancel={() => setCancelModalOpen(true)} onFinish={() => setFinishModalOpen(true)}/>
            
            <div className="flex-1 overflow-y-auto w-full pt-4 md:pt-8 pb-32">
                <div className="px-4 md:px-8 space-y-6 max-w-4xl mx-auto w-full">
                    <AnimatePresence>
                        {exercises?.map((exercise, eIdx) => (
                            <ExerciseCard key={exercise.exerciseId} exercise={exercise} eIdx={eIdx} isImperial={isImperial} activeSetId={activeSetId} profileWeight={profileWeight} onUpdateExerciseConfig={handleUpdateExerciseConfig} onRemoveExercise={handleRemoveExercise} onAddSet={handleAddSet} onRemoveSet={handleRemoveSet} onUpdateSet={handleUpdateSet} onCompleteSet={handleCompleteSet}/>
                        ))}
                    </AnimatePresence>

                    <motion.div>
                        <Button variant="outline" className="w-full py-8 border-dashed border-2 hover:border-solid text-text-secondary hover:text-orange hover:border-orange bg-app/50 shadow-neu-inset" icon={<Plus size={20}/>} onClick={() => setIsPickerOpen(true)}>
                            ADD EXERCISE
                        </Button>
                    </motion.div>

                    <motion.div>
                        <Card className="shadow-neu-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <StickyNote size={18} className="text-orange"/>
                                <h3 className="text-xs font-bold text-text-secondary uppercase">Workout Notes</h3>
                            </div>
                            <Textarea placeholder="How was your workout? Any notes on performance, feelings, or adjustments..." value={notes} onChange={handleSetNotes} className="min-h-[100px] bg-app shadow-neu-inset border-0 focus:ring-orange/20 text-sm font-medium"/>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <Modal open={isPickerOpen} onOpenChange={setIsPickerOpen} title="Add Exercise" description="Choose an exercise for this workout">
                <div className="-mx-6 -mb-6 mt-4 h-[60vh] sm:h-[70vh] bg-app rounded-b-xl overflow-hidden">
                    <ExercisePicker onClose={() => setIsPickerOpen(false)} onSelect={handleAddExercise} selectedIds={exercises?.map(e => e.exerciseId) || []} hideHeaderInfo/>
                </div>
            </Modal>

            <ConfirmDialog open={cancelModalOpen} onOpenChange={setCancelModalOpen} title="Discard Workout" description="Are you sure you want to discard this workout? Progress will not be saved." confirmLabel="DISCARD" variant="danger" onConfirm={handleCancel}/>

            <WorkoutFinishDialog open={finishModalOpen} onOpenChange={setFinishModalOpen} completedSetsCount={completedSetsCount()} onConfirm={handleFinish}/>
        </div>
    );
}
