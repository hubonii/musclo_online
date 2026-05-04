// Unit tests for useProgramDetailsData — program routine and exercise mapping.
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgramDetailsData } from '../../../src/hooks/useProgramDetailsData';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../src/api/axios';
import { useToast } from '../../../src/components/ui/Toast';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

describe('useProgramDetailsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads program details, builds filtered list, and deletes a routine', async () => {
    const navigate = jest.fn();
    const toast = jest.fn();

    useParams.mockReturnValue({ id: '5' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast });

    apiClient.get
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 5,
            name: 'Main Program',
            routines: [
              { id: 1, name: 'Push Alpha', exercises: [{ id: 1 }] },
              { id: 2, name: 'Leg Beta', exercises: [{ id: 2 }, { id: 3 }] },
            ],
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { started_at: '2026-04-01T10:00:00Z' } } })
      .mockResolvedValueOnce({ data: { data: { started_at: null } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 5,
            name: 'Main Program',
            routines: [{ id: 1, name: 'Push Alpha', exercises: [{ id: 1 }] }],
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { started_at: '2026-04-01T10:00:00Z' } } });

    apiClient.delete.mockResolvedValue({});

    const { result } = renderHook(() => useProgramDetailsData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.program?.id).toBe(5);
    expect(result.current.routines.length).toBe(2);
    expect(result.current.totalExercises).toBe(3);

    act(() => {
      result.current.setSearch('push');
    });
    expect(result.current.filteredWorkouts.length).toBe(1);
    expect(result.current.filteredWorkouts[0].name).toBe('Push Alpha');

    act(() => {
      result.current.setDeleteModalRoutine({ id: 2, name: 'Leg Beta' });
    });
    await act(async () => {
      await result.current.handleDeleteRoutine();
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/routines/2');
    expect(toast).toHaveBeenCalledWith('success', 'Routine deleted');
  });

  test('shows error toast and redirects when initial load fails', async () => {
    const navigate = jest.fn();
    const toast = jest.fn();

    useParams.mockReturnValue({ id: '999' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast });
    apiClient.get.mockRejectedValue(new Error('network failure'));

    renderHook(() => useProgramDetailsData());

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Failed to load program details');
    });
    expect(navigate).toHaveBeenCalledWith('/programs');
  });
});


