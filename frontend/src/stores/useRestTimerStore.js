// Rest timer store used during active workouts.
import { create } from 'zustand';
export const useRestTimerStore = create()((set, get) => ({
    restTimerSeconds: 90,
    restTimerRunning: false,
    restTimerEnd: null,
    restTimerExerciseId: null,
    restTimerSetId: null,
    isRestTimerPaused: false,
    restTimeRemaining: null,
    startRestTimer: (seconds, exerciseId = null, setId = null) => set({
        // Stores absolute end time (`Date.now() + seconds`) for countdown calculations.
        restTimerRunning: true,
        restTimerSeconds: seconds,
        restTimerEnd: Date.now() + seconds * 1000,
        restTimerExerciseId: exerciseId,
        restTimerSetId: setId,
        isRestTimerPaused: false,
        restTimeRemaining: seconds,
    }),
    stopRestTimer: () => set({
        restTimerRunning: false,
        restTimerEnd: null,
        restTimerExerciseId: null,
        restTimerSetId: null,
        isRestTimerPaused: false,
        restTimeRemaining: null,
    }),
    pauseRestTimer: () => {
        const { restTimerEnd, restTimerRunning, isRestTimerPaused } = get();
        if (!restTimerRunning || isRestTimerPaused || !restTimerEnd)
            return;
        const remaining = Math.max(0, Math.floor((restTimerEnd - Date.now()) / 1000));
        // Converts running timer state to paused state with a fixed remaining value.
        set({
            isRestTimerPaused: true,
            restTimeRemaining: remaining,
            restTimerEnd: null,
        });
    },
    resumeRestTimer: () => {
        const { restTimerRunning, isRestTimerPaused, restTimeRemaining } = get();
        if (!restTimerRunning || !isRestTimerPaused || restTimeRemaining === null)
            return;
        // Rebuilds end timestamp from `restTimeRemaining` and resumes countdown.
        set({
            isRestTimerPaused: false,
            restTimerEnd: Date.now() + restTimeRemaining * 1000
        });
    },
    updateRestTimerRemaining: (seconds) => set({ restTimeRemaining: seconds }),
}));


