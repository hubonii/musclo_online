// Unit tests for useMeasurements — body metrics and tracking history.
import {
  useMeasurements,
  useAddMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
} from '../../../src/hooks/useMeasurements';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../src/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

describe('useMeasurements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: [], isLoading: false });
    useMutation.mockReturnValue({ mutate: jest.fn() });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
  });

  test('useMeasurements registers list query', () => {
    useMeasurements();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.measurements.all,
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    queryFn();
    expect(apiGet).toHaveBeenCalledWith('/measurements');
  });

  test('mutations call APIs and invalidate measurements query', async () => {
    const queryClient = { invalidateQueries: jest.fn() };
    useQueryClient.mockReturnValue(queryClient);

    const mutationConfigs = [];
    useMutation.mockImplementation((config) => {
      mutationConfigs.push(config);
      return { mutate: jest.fn() };
    });

    useAddMeasurement();
    useUpdateMeasurement();
    useDeleteMeasurement();

    const payload = { date: '2026-01-01', weight_kg: 80 };
    await mutationConfigs[0].mutationFn(payload);
    expect(apiPost).toHaveBeenCalledWith('/measurements', payload);
    mutationConfigs[0].onSuccess();

    await mutationConfigs[1].mutationFn({ id: 7, weight_kg: 81 });
    expect(apiPut).toHaveBeenCalledWith('/measurements/7', { weight_kg: 81 });
    mutationConfigs[1].onSuccess();

    await mutationConfigs[2].mutationFn(9);
    expect(apiDelete).toHaveBeenCalledWith('/measurements/9');
    mutationConfigs[2].onSuccess();

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.measurements.all });
  });
});


