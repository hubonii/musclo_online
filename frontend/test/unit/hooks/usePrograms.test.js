// Unit tests for usePrograms — training plan CRUD and cache management.
import {
  usePrograms,
  useProgram,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
} from '../../../src/hooks/usePrograms';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../src/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../src/components/ui/Toast';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

describe('usePrograms hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: [], isLoading: false });
    useMutation.mockReturnValue({ mutate: jest.fn() });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
    useToast.mockReturnValue({ toast: jest.fn() });
  });

  test('query hooks register contracts for list and detail', () => {
    usePrograms();
    useProgram(33);

    expect(useQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.programs.all })
    );
    expect(useQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.programs.detail(33),
        enabled: true,
      })
    );

    const listFn = useQuery.mock.calls[0][0].queryFn;
    const detailFn = useQuery.mock.calls[1][0].queryFn;
    listFn();
    detailFn();

    expect(apiGet).toHaveBeenNthCalledWith(1, '/programs');
    expect(apiGet).toHaveBeenNthCalledWith(2, '/programs/33');
  });

  test('detail query stays disabled when no id is provided', () => {
    useProgram(undefined);

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.programs.detail(undefined),
        enabled: false,
      })
    );
  });

  test('mutation hooks wire API calls, cache invalidation, and toasts', async () => {
    const queryClient = { invalidateQueries: jest.fn() };
    const toast = jest.fn();
    useQueryClient.mockReturnValue(queryClient);
    useToast.mockReturnValue({ toast });

    const mutationConfigs = [];
    useMutation.mockImplementation((config) => {
      mutationConfigs.push(config);
      return { mutate: jest.fn() };
    });

    useCreateProgram();
    useUpdateProgram();
    useDeleteProgram();

    await mutationConfigs[0].mutationFn({ name: 'Push/Pull' });
    expect(apiPost).toHaveBeenCalledWith('/programs', { name: 'Push/Pull' });
    mutationConfigs[0].onSuccess();

    await mutationConfigs[1].mutationFn({ id: 10, name: 'Upper/Lower' });
    expect(apiPut).toHaveBeenCalledWith('/programs/10', { name: 'Upper/Lower' });
    mutationConfigs[1].onSuccess({ id: 10 });

    await mutationConfigs[2].mutationFn(10);
    expect(apiDelete).toHaveBeenCalledWith('/programs/10');
    mutationConfigs[2].onSuccess();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.programs.all });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.programs.detail(10) });
    expect(toast).toHaveBeenCalledWith('success', 'Program created successfully');
    expect(toast).toHaveBeenCalledWith('success', 'Program updated successfully');
    expect(toast).toHaveBeenCalledWith('success', 'Program deleted successfully');
  });

  test('mutation hooks show error toasts when operations fail', () => {
    const toast = jest.fn();
    useToast.mockReturnValue({ toast });

    const mutationConfigs = [];
    useMutation.mockImplementation((config) => {
      mutationConfigs.push(config);
      return { mutate: jest.fn() };
    });

    useCreateProgram();
    useUpdateProgram();
    useDeleteProgram();

    mutationConfigs[0].onError(new Error('create failed'));
    mutationConfigs[1].onError(new Error('update failed'));
    mutationConfigs[2].onError(new Error('delete failed'));

    expect(toast).toHaveBeenCalledWith('error', 'Failed to create program');
    expect(toast).toHaveBeenCalledWith('error', 'Failed to update program');
    expect(toast).toHaveBeenCalledWith('error', 'Failed to delete program');
  });
});


