import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgramDetailsData } from '../../../src/hooks/useProgramDetailsData';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../src/api/axios';
import { useToast } from '../../../src/components/ui/Toast';
import { useProgram } from '../../../src/hooks/usePrograms';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

jest.mock('../../../src/hooks/usePrograms', () => ({
  useProgram: jest.fn(),
}));

describe('useProgramDetailsData', () => {
  let queryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('loads program details, builds filtered list, and deletes a routine', async () => {
    const navigate = jest.fn();
    const toast = jest.fn();

    useParams.mockReturnValue({ id: '5' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast });

    useProgram.mockReturnValue({
      data: {
        id: 5,
        name: 'Main Program',
        routines: [
          { id: 1, name: 'Push Alpha', exercises: [{ id: 1 }] },
          { id: 2, name: 'Leg Beta', exercises: [{ id: 2 }, { id: 3 }] },
        ],
      },
      isLoading: false,
    });

    apiClient.get.mockResolvedValue({ data: { data: { started_at: '2026-04-01T10:00:00Z' } } });
    apiClient.delete.mockResolvedValue({});

    const { result } = renderHook(() => useProgramDetailsData(), { wrapper });

    expect(result.current.loading).toBe(false);
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
    
    useProgram.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('load failed')
    });

    renderHook(() => useProgramDetailsData(), { wrapper });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Failed to load program details');
    });
    expect(navigate).toHaveBeenCalledWith('/programs');
  });
});
