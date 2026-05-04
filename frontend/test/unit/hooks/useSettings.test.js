// Unit tests for useSettings — user preferences and unit system syncing.
import { useSettings, useUpdateSettings } from '../../../src/hooks/useSettings';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet, apiPut } from '../../../src/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
  apiPut: jest.fn(),
}));

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: null, isLoading: false });
    useMutation.mockReturnValue({ mutate: jest.fn() });
    useQueryClient.mockReturnValue({ setQueryData: jest.fn() });
  });

  test('useSettings registers the expected query contract', () => {
    useSettings();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.settings.all,
        staleTime: Infinity,
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    queryFn();
    expect(apiGet).toHaveBeenCalledWith('/settings');
  });

  test('useUpdateSettings writes updated settings into cache on success', async () => {
    const queryClient = { setQueryData: jest.fn() };
    useQueryClient.mockReturnValue(queryClient);

    let mutationConfig;
    useMutation.mockImplementation((config) => {
      mutationConfig = config;
      return { mutate: jest.fn() };
    });

    useUpdateSettings();

    const payload = { theme: 'dark' };
    mutationConfig.mutationFn(payload);
    expect(apiPut).toHaveBeenCalledWith('/settings', payload);

    const updated = { theme: 'dark', unit_system: 'metric' };
    mutationConfig.onSuccess(updated);
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKeys.settings.all, updated);
  });
});


