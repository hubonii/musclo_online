// Unit tests for useWorkoutHistory — paginated list of completed sessions.
import { useWorkoutHistory } from '../../../src/hooks/useWorkoutHistory';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet } from '../../../src/api/axios';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
}));

describe('useWorkoutHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: [], isLoading: false });
  });

  test('registers workouts history query with default limit', () => {
    useWorkoutHistory();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [...queryKeys.workouts.history, { limit: 30 }],
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    queryFn();
    expect(apiGet).toHaveBeenCalledWith('/workouts/history', { per_page: 30 });
  });

  test('registers workouts history query with custom limit', () => {
    useWorkoutHistory(10);

    const callConfig = useQuery.mock.calls[0][0];
    expect(callConfig.queryKey).toEqual([...queryKeys.workouts.history, { limit: 10 }]);

    callConfig.queryFn();
    expect(apiGet).toHaveBeenCalledWith('/workouts/history', { per_page: 10 });
  });
});


