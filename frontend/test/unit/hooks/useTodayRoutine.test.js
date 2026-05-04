// Unit tests for useTodayRoutine — fetching and caching of current daily routine.
import { useTodayRoutine } from '../../../src/hooks/useTodayRoutine';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet } from '../../../src/api/axios';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
}));

describe('useTodayRoutine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: null, isLoading: false });
  });

  test('registers today routine query contract', async () => {
    apiGet.mockResolvedValue({ id: 11, name: 'Monday A' });

    useTodayRoutine();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.routines.today,
        staleTime: 5 * 60 * 1000,
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    await expect(queryFn()).resolves.toEqual({ id: 11, name: 'Monday A' });
    expect(apiGet).toHaveBeenCalledWith('/routines/today');
  });

  test('returns null when today routine endpoint fails', async () => {
    apiGet.mockRejectedValue(new Error('not found'));

    useTodayRoutine();

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    await expect(queryFn()).resolves.toBeNull();
  });
});


