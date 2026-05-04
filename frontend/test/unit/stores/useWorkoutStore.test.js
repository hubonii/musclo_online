// Unit tests for useWorkoutStore — session lifecycle and live training metrics.
import { useWorkoutStore } from '../../../src/stores/useWorkoutStore';
import { useRestTimerStore } from '../../../src/stores/useRestTimerStore';
import { apiGet } from '../../../src/api/axios';

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
}));

describe('useWorkoutStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Reset both interconnected stores to ensure test boundaries are completely clean.
    useWorkoutStore.getState().resetWorkout();
    useRestTimerStore.setState({
      restTimerSeconds: 90,
      restTimerRunning: false,
      restTimerEnd: null,
      restTimerExerciseId: null,
      restTimerSetId: null,
      isRestTimerPaused: false,
      restTimeRemaining: null,
    });
  });

  test('startWorkout initializes active session', () => {
    useWorkoutStore.getState().startWorkout(5, 'Pull Day', []);

    const state = useWorkoutStore.getState();
    // Validate that the new session metadata binds cleanly to the store state payload.
    expect(state.isActive).toBe(true);
    expect(state.routineId).toBe(5);
    expect(state.routineName).toBe('Pull Day');
    expect(state.startedAt).toBeTruthy();
  });

  test('addExercise does not add duplicate exercise ids', () => {
    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);

    const exercise = {
      id: 99,
      name: 'Bench Press',
      muscleGroup: 'Chest',
      type: 'Weights',
      target_metric: 'Reps',
    };

    // Prevent accidental duplicate tracking which would bloat the payload and corrupt volume calculation.
    useWorkoutStore.getState().addExercise(exercise);
    useWorkoutStore.getState().addExercise(exercise);

    const state = useWorkoutStore.getState();
    expect(state.exercises).toHaveLength(1);
    expect(state.exercises[0].exerciseId).toBe(99);
  });

  test('completeSet starts rest timer for newly completed set', () => {
    const startRestTimer = jest.fn();
    useRestTimerStore.setState({ startRestTimer, restTimerSeconds: 75 });

    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);
    useWorkoutStore.getState().addExercise({
      id: 44,
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      type: 'Weights',
      target_metric: 'Reps',
    });

    const firstSetId = useWorkoutStore.getState().exercises[0].sets[0].id;
    useWorkoutStore.getState().completeSet(44, firstSetId);

    expect(startRestTimer).toHaveBeenCalledWith(75, 44, firstSetId);
    expect(useWorkoutStore.getState().exercises[0].sets[0].isCompleted).toBe(true);
  });

  test('addSet copies previous set values and increments set number', () => {
    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);
    useWorkoutStore.getState().addExercise({
      id: 10,
      name: 'Overhead Press',
      muscleGroup: 'Shoulders',
      type: 'Weights',
      target_metric: 'Reps',
    });

    const firstSetId = useWorkoutStore.getState().exercises[0].sets[0].id;
    useWorkoutStore.getState().updateSet(10, firstSetId, 'weight_kg', 42.5);
    useWorkoutStore.getState().updateSet(10, firstSetId, 'reps', 8);

    useWorkoutStore.getState().addSet(10);

    const sets = useWorkoutStore.getState().exercises[0].sets;
    expect(sets).toHaveLength(2);
    expect(sets[1].setNumber).toBe(2);
    expect(sets[1].weight_kg).toBe(42.5);
    expect(sets[1].reps).toBe(8);
  });

  test('removeSet removes entire exercise when no sets remain', () => {
    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);
    useWorkoutStore.getState().addExercise({
      id: 11,
      name: 'Barbell Row',
      muscleGroup: 'Back',
      type: 'Weights',
      target_metric: 'Reps',
    });

    const onlySetId = useWorkoutStore.getState().exercises[0].sets[0].id;
    useWorkoutStore.getState().removeSet(11, onlySetId);

    expect(useWorkoutStore.getState().exercises).toEqual([]);
  });

  test('finishWorkout returns null when workout is inactive', () => {
    expect(useWorkoutStore.getState().finishWorkout()).toBeNull();
  });

  test('finishWorkout returns completed sets payload and resets store', () => {
    useRestTimerStore.setState({ startRestTimer: jest.fn() });
    useWorkoutStore.getState().startWorkout(7, 'Mixed Day', []);
    useWorkoutStore.setState({ startedAt: new Date(Date.now() - 61000).toISOString() });

    useWorkoutStore.getState().addExercise({
      id: 21,
      name: 'Bench Press',
      muscleGroup: 'Chest',
      type: 'Weights',
      target_metric: 'Reps',
    });
    useWorkoutStore.getState().addExercise({
      id: 22,
      name: 'Plank',
      muscleGroup: 'Core',
      type: 'Bodyweight',
      target_metric: 'Time',
    });

    const benchSetId = useWorkoutStore.getState().exercises[0].sets[0].id;
    useWorkoutStore.getState().updateSet(21, benchSetId, 'weight_kg', 80);
    useWorkoutStore.getState().updateSet(21, benchSetId, 'reps', 5);
    useWorkoutStore.getState().completeSet(21, benchSetId);

    const plankSetId = useWorkoutStore.getState().exercises[1].sets[0].id;
    useWorkoutStore.getState().updateSet(22, plankSetId, 'duration_seconds', 60);
    useWorkoutStore.getState().completeSet(22, plankSetId);
    useWorkoutStore.getState().setNotes('Felt strong');

    const payload = useWorkoutStore.getState().finishWorkout();

    expect(payload.routine_id).toBe(7);
    expect(payload.name).toBe('Mixed Day');
    expect(payload.notes).toBe('Felt strong');
    expect(payload.duration_seconds).toBeGreaterThan(0);
    expect(payload.sets).toHaveLength(2);
    expect(payload.sets[0]).toEqual(expect.objectContaining({
      exercise_id: 21,
      weight_kg: 80,
      reps: 5,
      duration_seconds: null,
    }));
    expect(payload.sets[1]).toEqual(expect.objectContaining({
      exercise_id: 22,
      reps: null,
      duration_seconds: 60,
    }));
    expect(useWorkoutStore.getState().isActive).toBe(false);
    expect(useWorkoutStore.getState().exercises).toEqual([]);
  });

  test('fetchPreviousData maps latest history once and skips duplicate fetches', async () => {
    apiGet.mockResolvedValue({
      '2026-01-01T00:00:00.000Z': [
        { set_number: 2, weight_kg: 105, reps: 4, duration_seconds: null },
        { set_number: 1, weight_kg: 100, reps: 5, duration_seconds: null },
      ],
    });

    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);
    useWorkoutStore.getState().addExercise({
      id: 31,
      name: 'Deadlift',
      muscleGroup: 'Back',
      type: 'Weights',
      target_metric: 'Reps',
    });

    await useWorkoutStore.getState().fetchPreviousData(31);
    await useWorkoutStore.getState().fetchPreviousData(31);

    const [firstSet, secondSet] = useWorkoutStore.getState().exercises[0].sets;
    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(firstSet.previousWeight).toBe(100);
    expect(firstSet.previousReps).toBe(5);
    expect(secondSet.previousWeight).toBe(105);
    expect(secondSet.previousReps).toBe(4);
    expect(useWorkoutStore.getState().exercises[0].hasFetchedHistory).toBe(true);
  });

  test('fetchPreviousData swallows api errors without throwing', async () => {
    apiGet.mockRejectedValue(new Error('network failure'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    useWorkoutStore.getState().startWorkout(null, 'Freestyle', []);
    useWorkoutStore.getState().addExercise({
      id: 32,
      name: 'Cable Fly',
      muscleGroup: 'Chest',
      type: 'Weights',
      target_metric: 'Reps',
    });

    await expect(useWorkoutStore.getState().fetchPreviousData(32)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

