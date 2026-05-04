// Unit tests for useRoutineBuilder — routine construction and exercise selection.
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoutineBuilder } from '../../../src/hooks/useRoutineBuilder';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../src/api/axios';
import { useToast } from '../../../src/components/ui/Toast';
import { useSettings } from '../../../src/hooks/useSettings';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../src/api/queryKeys';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../src/hooks/useSettings', () => ({
  useSettings: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('useRoutineBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (!global.crypto) {
      global.crypto = {};
    }
    global.crypto.randomUUID = jest.fn(() => 'uuid-1');
  });

  test('adds exercise using settings default rest timer', async () => {
    const toast = jest.fn();

    useParams.mockReturnValue({ programId: 'standalone', routineId: 'new' });
    useNavigate.mockReturnValue(jest.fn());
    useToast.mockReturnValue({ toast });
    useSettings.mockReturnValue({ data: { default_rest_timer_seconds: 120 } });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });

    const { result } = renderHook(() => useRoutineBuilder());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAddExercise({ id: 11, name: 'Bench Press' });
    });

    expect(result.current.exercises.length).toBe(1);
    expect(result.current.exercises[0].rest_timer_seconds).toBe(120);
    expect(result.current.exercises[0].sets.length).toBe(1);
    expect(toast).toHaveBeenCalledWith('success', 'Added Bench Press');
  });

  test('validates save and posts routine for standalone new routine', async () => {
    const toast = jest.fn();
    const navigate = jest.fn();
    const queryClient = { invalidateQueries: jest.fn() };

    useParams.mockReturnValue({ programId: 'standalone', routineId: 'new' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast });
    useSettings.mockReturnValue({ data: { default_rest_timer_seconds: 90 } });
    useQueryClient.mockReturnValue(queryClient);
    apiClient.post.mockResolvedValue({});

    const { result } = renderHook(() => useRoutineBuilder());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSave();
    });
    expect(toast).toHaveBeenCalledWith('error', 'Routine name is required');

    act(() => {
      result.current.setRoutineName('Upper A');
      result.current.handleAddExercise({ id: 7, name: 'Rows' });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/routines',
      expect.objectContaining({ name: 'Upper A' })
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.programs.all });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.routines.today });
    expect(navigate).toHaveBeenCalledWith('/programs');
  });

  test('updates existing routine and returns to the parent program', async () => {
    const toast = jest.fn();
    const navigate = jest.fn();
    const queryClient = { invalidateQueries: jest.fn() };

    useParams.mockReturnValue({ programId: '55', routineId: '12' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast });
    useSettings.mockReturnValue({ data: { default_rest_timer_seconds: 90 } });
    useQueryClient.mockReturnValue(queryClient);

    apiClient.get
      .mockResolvedValueOnce({ data: { data: { id: 55, name: 'Program 55' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 12,
            name: 'Routine 12',
            notes: 'existing notes',
            day_of_week: 2,
            exercises: [
              {
                id: 99,
                name: 'Barbell Row',
                pivot: { sort_order: 0, target_sets: 1, target_reps: 8, rest_timer_seconds: 90 },
                sets: [{ id: 1, set_type: 'working', weight_kg: 60, reps: 8, duration_seconds: null, rir: 2, rpe: 8 }],
              },
            ],
          },
        },
      });

    apiClient.put.mockResolvedValue({});

    const { result } = renderHook(() => useRoutineBuilder());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      '/routines/12',
      expect.objectContaining({
        name: 'Routine 12',
        exercises: expect.any(Array),
      })
    );
    expect(toast).toHaveBeenCalledWith('success', 'Workout committed successfully!');
    expect(navigate).toHaveBeenCalledWith('/programs/55');
  });
});


