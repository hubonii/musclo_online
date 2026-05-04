// Unit tests for useRestTimerStore — timer countdown and pause/resume logic.
import { useRestTimerStore } from '../../../src/stores/useRestTimerStore';

describe('useRestTimerStore', () => {
  beforeEach(() => {
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

  test('startRestTimer initializes timer state', () => {
    useRestTimerStore.getState().startRestTimer(75, 12, 'set-a');

    const state = useRestTimerStore.getState();
    expect(state.restTimerRunning).toBe(true);
    expect(state.restTimerSeconds).toBe(75);
    expect(state.restTimerExerciseId).toBe(12);
    expect(state.restTimerSetId).toBe('set-a');
    expect(state.restTimeRemaining).toBe(75);
    expect(typeof state.restTimerEnd).toBe('number');
  });

  test('pause and resume roundtrip keeps timer active', () => {
    useRestTimerStore.getState().startRestTimer(30);
    useRestTimerStore.getState().pauseRestTimer();

    const paused = useRestTimerStore.getState();
    expect(paused.isRestTimerPaused).toBe(true);
    expect(paused.restTimerEnd).toBeNull();

    useRestTimerStore.getState().resumeRestTimer();

    const resumed = useRestTimerStore.getState();
    expect(resumed.isRestTimerPaused).toBe(false);
    expect(typeof resumed.restTimerEnd).toBe('number');
  });

  test('stopRestTimer clears timer state', () => {
    useRestTimerStore.getState().startRestTimer(30);
    useRestTimerStore.getState().stopRestTimer();

    const state = useRestTimerStore.getState();
    expect(state.restTimerRunning).toBe(false);
    expect(state.restTimerEnd).toBeNull();
    expect(state.isRestTimerPaused).toBe(false);
    expect(state.restTimeRemaining).toBeNull();
  });
});


