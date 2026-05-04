// Unit tests for useWorkoutStats — high-level dashboard metric requests.
import { useWorkoutStats } from '../../../src/hooks/useWorkoutStats';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet } from '../../../src/api/axios';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
}));

describe('useWorkoutStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: null, isLoading: false });
  });

  test('registers workout stats query contract', () => {
    useWorkoutStats();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.workouts.stats,
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    queryFn();
    expect(apiGet).toHaveBeenCalledWith('/workouts/stats');
  });
});


