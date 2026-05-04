// Unit tests for useProfile — user profile state and bio management.
import {
  useProfile,
  useAchievements,
  useSharedWorkouts,
  useUpdateProfile,
} from '../../../src/hooks/useProfile';
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

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: null, isLoading: false });
    useMutation.mockReturnValue({ mutate: jest.fn() });
    useQueryClient.mockReturnValue({ setQueryData: jest.fn() });
  });

  test('registers profile queries with expected keys and endpoints', async () => {
    useProfile();
    let config = useQuery.mock.calls[0][0];
    expect(config.queryKey).toEqual(queryKeys.profile.detail('me'));
    await config.queryFn();
    expect(apiGet).toHaveBeenCalledWith('/profile/me');

    useAchievements(12);
    config = useQuery.mock.calls[1][0];
    expect(config.queryKey).toEqual(queryKeys.profile.achievements(12));
    await config.queryFn();
    expect(apiGet).toHaveBeenCalledWith('/profile/12/achievements');

    useSharedWorkouts(5);
    config = useQuery.mock.calls[2][0];
    expect(config.queryKey).toEqual(queryKeys.profile.routines(5));
    await config.queryFn();
    expect(apiGet).toHaveBeenCalledWith('/profile/5/routines');
  });

  test('update mutation writes merged profile cache for user id and me alias', async () => {
    const setQueryData = jest.fn();
    useQueryClient.mockReturnValue({ setQueryData });

    let mutationConfig;
    useMutation.mockImplementation((config) => {
      mutationConfig = config;
      return { mutate: jest.fn() };
    });

    useUpdateProfile();

    const payload = { name: 'Updated Name' };
    await mutationConfig.mutationFn(payload);
    expect(apiPut).toHaveBeenCalledWith('/profile', payload);

    mutationConfig.onSuccess({ id: 7, name: 'Updated Name' });

    expect(setQueryData).toHaveBeenCalledTimes(2);
    expect(setQueryData).toHaveBeenNthCalledWith(1, queryKeys.profile.detail(7), expect.any(Function));
    expect(setQueryData).toHaveBeenNthCalledWith(2, queryKeys.profile.detail('me'), expect.any(Function));

    const mergeFn = setQueryData.mock.calls[0][1];
    expect(mergeFn({ bio: 'existing' })).toEqual({ bio: 'existing', id: 7, name: 'Updated Name' });
  });
});

