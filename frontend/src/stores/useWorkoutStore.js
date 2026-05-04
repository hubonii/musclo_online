// Active workout builder and runtime session state.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet } from '../api/axios';
import { useRestTimerStore } from './useRestTimerStore';
import { calculateTotalVolume, calculateCompletedSetsCount, calculateTotalSetsCount } from '../lib/utils';

export const useWorkoutStore = create()(persist((set, get) => ({
    isActive: false,
    routineId: null,
    routineName: null,
    startedAt: null,
    exercises: [],
    notes: '',
    startWorkout: (routineId, routineName, initialExercises = []) => {
        // Initializes one active session snapshot persisted in local storage.
        set({
            isActive: true,
            routineId,
            routineName,
            startedAt: new Date().toISOString(),
            exercises: initialExercises,
            notes: '',
        });
    },
    addExercise: (exercise) => {
        const exercises = get().exercises;
        // Keep one active entry per exercise in a session.
        if (exercises.find((e) => e.exerciseId === exercise.id))
            return;
        set({
            exercises: [...exercises, {
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    muscleGroup: exercise.muscleGroup,
                    type: exercise.type,
                    targetMetric: exercise.target_metric,
                    restTimerSeconds: null,
                    sets: [{
                            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                            setNumber: 1,
                            set_type: 'working',
                            weight_kg: null,
                            reps: null,
                            duration_seconds: null,
                            rir: null,
                            rpe: null,
                            isCompleted: false,
                            isPR: false,
                            previousWeight: null,
                            previousReps: null,
                            previousDurationSeconds: null,
                            targetWeightKg: null,
                            targetReps: null,
                            targetDurationSeconds: null,
                        }],
                }],
        });
    },
    removeExercise: (exerciseId) => {
        set({ exercises: get().exercises.filter((e) => e.exerciseId !== exerciseId) });
    },
    addSet: (exerciseId) => {
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                const lastSet = e.sets[e.sets.length - 1];
                // Pre-fill next set from last set to speed up logging.
                return {
                    ...e,
                    sets: [...e.sets, {
                            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
                            exerciseId,
                            exerciseName: e.exerciseName,
                            setNumber: e.sets.length + 1,
                            set_type: 'working',
                            weight_kg: lastSet?.weight_kg ?? null,
                            reps: lastSet?.reps ?? null,
                            duration_seconds: lastSet?.duration_seconds ?? null,
                            rir: null,
                            rpe: null,
                            isCompleted: false,
                            isPR: false,
                            previousWeight: null,
                            previousReps: null,
                            previousDurationSeconds: null,
                            targetWeightKg: lastSet?.targetWeightKg ?? null,
                            targetReps: lastSet?.targetReps ?? null,
                            targetDurationSeconds: lastSet?.targetDurationSeconds ?? null,
                        }],
                };
            }),
        });
    },
    removeSet: (exerciseId, setId) => {
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
            }).filter((e) => e.sets.length > 0),
        });
    },
    updateSet: (exerciseId, setId, field, value) => {
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                const setIndex = e.sets.findIndex(s => s.id === setId);
                if (setIndex === -1)
                    return e;
                // Uses immutable array/object copies so Zustand change detection stays reliable.
                const updatedSets = [...e.sets];
                const sourceSet = updatedSets[setIndex];
                updatedSets[setIndex] = { ...sourceSet, [field]: value };
                return { ...e, sets: updatedSets };
            }),
        });
    },
    updateExerciseConfig: (exerciseId, config) => {
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                return {
                    ...e,
                    ...(config.type ? { type: config.type } : {}),
                    ...(config.targetMetric ? { targetMetric: config.targetMetric } : {})
                };
            }),
        });
    },
    completeSet: (exerciseId, setId) => {
        let didJustComplete = false;
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                return {
                    ...e,
                    sets: e.sets.map((s) => {
                        if (s.id === setId) {
                            if (!s.isCompleted)
                                didJustComplete = true;
                            return { ...s, isCompleted: !s.isCompleted };
                        }
                        return s;
                    }),
                };
            }),
        });
        if (didJustComplete) {
            const ex = get().exercises.find(e => e.exerciseId === exerciseId);
            // Resolve timer priority: exercise override -> global setting -> default.
            const timerSeconds = ex?.restTimerSeconds || useRestTimerStore.getState().restTimerSeconds || 90;
            useRestTimerStore.getState().startRestTimer(timerSeconds, exerciseId, setId);
        }
    },
    populatePreviousData: (exerciseId, previousSets) => {
        set({
            exercises: get().exercises.map((e) => {
                if (e.exerciseId !== exerciseId)
                    return e;
                const newSetsCount = Math.max(e.sets.length, previousSets.length);
                const expandedSets = Array.from({ length: newSetsCount }).map((_, i) => {
                    const existingSet = e.sets[i];
                    const prev = previousSets[i];
                    if (existingSet) {
                        return {
                            ...existingSet,
                            previousWeight: prev?.weight ?? null,
                            previousReps: prev?.reps ?? null,
                            previousDurationSeconds: prev?.duration_seconds ?? null,
                        };
                    }
                    else {
                        return {
                            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
                            exerciseId: e.exerciseId,
                            exerciseName: e.exerciseName,
                            setNumber: i + 1,
                            set_type: 'working',
                            weight_kg: null,
                            reps: null,
                            duration_seconds: null,
                            rir: null,
                            rpe: null,
                            isCompleted: false,
                            isPR: false,
                            previousWeight: prev?.weight ?? null,
                            previousReps: prev?.reps ?? null,
                            previousDurationSeconds: prev?.duration_seconds ?? null,
                            targetWeightKg: null,
                            targetReps: null,
                            targetDurationSeconds: null,
                        };
                    }
                });
                return {
                    ...e,
                    sets: expandedSets,
                };
            }),
        });
    },
    // Fetch last-session values to show "previous" hints per set.
    fetchPreviousData: async (exerciseId) => {
        const state = get();
        const ex = state.exercises.find(e => e.exerciseId === exerciseId);
        // Skips history fetch when `hasFetchedHistory` is already true for the exercise.
        if (!ex || ex.hasFetchedHistory)
            return;
        set({
            exercises: get().exercises.map(e => e.exerciseId === exerciseId ? { ...e, hasFetchedHistory: true } : e)
        });
        try {
            const historyGroups = await apiGet(`/workouts/exercise/${exerciseId}/history`, { limit: 1 });
            const dates = Object.keys(historyGroups);
            if (dates.length > 0) {
                // API groups by session date; use the latest one.
                const sortedDates = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                const lastSessionSets = historyGroups[sortedDates[0]];
                lastSessionSets.sort((a, b) => a.set_number - b.set_number);
                const previousSets = lastSessionSets.map((s) => ({
                    weight: s.weight_kg,
                    reps: s.reps,
                    duration_seconds: s.duration_seconds
                }));
                get().populatePreviousData(exerciseId, previousSets);
            }
        }
        catch (e) {
            console.error('Failed to resolve previous history mapping for exercise:', exerciseId, e);
        }
    },
    setNotes: (notes) => set({ notes }),
    cancelWorkout: () => set({
        isActive: false, routineId: null, routineName: null,
        startedAt: null, exercises: [], notes: '',
    }),
    finishWorkout: () => {
        const state = get();
        if (!state.isActive || !state.startedAt)
            return null;
        const completedAt = new Date().toISOString();
        const duration_seconds = Math.floor((new Date(completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000);
        // Flatten completed sets into backend payload format.
        const payload = {
            routine_id: state.routineId,
            name: state.routineName,
            started_at: state.startedAt,
            completed_at: completedAt,
            duration_seconds: duration_seconds,
            notes: state.notes,
            sets: state.exercises.flatMap((e) => e.sets.filter((s) => s.isCompleted).map((s) => ({
                exercise_id: s.exerciseId,
                set_number: s.setNumber,
                set_type: s.set_type,
                weight_kg: s.weight_kg ?? 0,
                // Metric-specific payload fields: reps for rep sets, duration_seconds for timed sets.
                reps: e.targetMetric === 'Time' ? null : (s.reps ?? 0),
                duration_seconds: e.targetMetric === 'Time' ? (s.duration_seconds ?? 0) : null,
                rir: s.rir,
                rpe: s.rpe,
            }))),
        };
        // Clear local session after payload is created.
        get().resetWorkout();
        return payload;
    },
    resetWorkout: () => set({
        isActive: false, routineId: null, routineName: null,
        startedAt: null, exercises: [], notes: '',
    }),
    totalVolume: () => calculateTotalVolume(get().exercises),
    completedSetsCount: () => calculateCompletedSetsCount(get().exercises),
    totalSetsCount: () => calculateTotalSetsCount(get().exercises),
}), { name: 'musclo-active-workout' }));


