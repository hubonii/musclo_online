// Unit tests for useDashboardData — aggregation of workout and metric trends.
import { renderHook } from '@testing-library/react';
import { useDashboardData } from '../../../src/hooks/useDashboardData';
import { useWorkoutHistory } from '../../../src/hooks/useWorkoutHistory';
import { useWorkoutStats } from '../../../src/hooks/useWorkoutStats';
import { useMeasurements } from '../../../src/hooks/useMeasurements';
import { useProgressPhotos } from '../../../src/hooks/useProgressPhotos';
import { useTodayRoutine } from '../../../src/hooks/useTodayRoutine';

jest.mock('../../../src/hooks/useWorkoutHistory', () => ({ useWorkoutHistory: jest.fn() }));
jest.mock('../../../src/hooks/useWorkoutStats', () => ({ useWorkoutStats: jest.fn() }));
jest.mock('../../../src/hooks/useMeasurements', () => ({ useMeasurements: jest.fn() }));
jest.mock('../../../src/hooks/useProgressPhotos', () => ({ useProgressPhotos: jest.fn() }));
jest.mock('../../../src/hooks/useTodayRoutine', () => ({ useTodayRoutine: jest.fn() }));

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('builds derived dashboard metrics from source hooks', () => {
    const today = new Date().toISOString().split('T')[0];

    useWorkoutHistory.mockReturnValue({
      data: [
        {
          started_at: `${today}T09:00:00.000Z`,
          total_volume: 1250,
          top_muscles: ['Chest', 'Back'],
          sets: [],
        },
      ],
      isLoading: false,
    });

    useWorkoutStats.mockReturnValue({
      data: {
        recent_programs: [{ id: 1, name: 'Hypertrophy' }],
        recent_routines: [{ id: 4, name: 'Push A' }],
      },
    });

    useMeasurements.mockReturnValue({
      data: [
        { date: '2026-04-10', weight_kg: '81.5' },
        { date: '2026-04-11', weight_kg: '82.0' },
      ],
    });

    useProgressPhotos.mockReturnValue({ data: [{ id: 99 }] });
    useTodayRoutine.mockReturnValue({ data: { id: 7, name: 'Today' } });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.workoutsLoading).toBe(false);
    expect(result.current.recentPrograms).toEqual([{ id: 1, name: 'Hypertrophy' }]);
    expect(result.current.recentRoutines).toEqual([{ id: 4, name: 'Push A' }]);
    expect(result.current.currentWeight).toBe(81.5);
    expect(result.current.startWeight).toBe(82);
    expect(result.current.weeklyVolumeSum).toBe(1250);
    expect(result.current.progressPhotos).toEqual([{ id: 99 }]);
    expect(result.current.todayRoutine).toEqual({ id: 7, name: 'Today' });
    expect(result.current.muscleData.length).toBeGreaterThan(0);
  });
});


