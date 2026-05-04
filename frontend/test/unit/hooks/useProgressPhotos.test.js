// Unit tests for useProgressPhotos — visual transformation asset management.
import {
  useProgressPhotos,
  useUploadProgressPhoto,
  useDeleteProgressPhoto,
} from '../../../src/hooks/useProgressPhotos';
import { queryKeys } from '../../../src/api/queryKeys';
import { apiGet, apiDelete, apiClient } from '../../../src/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
  apiDelete: jest.fn(),
  apiClient: {
    post: jest.fn(),
  },
}));

describe('useProgressPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({ data: [], isLoading: false });
    useMutation.mockReturnValue({ mutate: jest.fn() });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
  });

  test('useProgressPhotos registers list query', () => {
    useProgressPhotos();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.progressPhotos.all,
      })
    );

    const queryFn = useQuery.mock.calls[0][0].queryFn;
    queryFn();
    expect(apiGet).toHaveBeenCalledWith('/progress-photos');
  });

  test('upload and delete mutations call APIs and invalidate cache', async () => {
    const queryClient = { invalidateQueries: jest.fn() };
    useQueryClient.mockReturnValue(queryClient);

    const mutationConfigs = [];
    useMutation.mockImplementation((config) => {
      mutationConfigs.push(config);
      return { mutate: jest.fn() };
    });

    useUploadProgressPhoto();
    useDeleteProgressPhoto();

    apiClient.post.mockResolvedValue({ data: { data: { id: 1, pose: 'front' } } });
    const uploadResult = await mutationConfigs[0].mutationFn({});
    expect(uploadResult).toEqual({ id: 1, pose: 'front' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/progress-photos',
      {},
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    mutationConfigs[0].onSuccess();

    await mutationConfigs[1].mutationFn(2);
    expect(apiDelete).toHaveBeenCalledWith('/progress-photos/2');
    mutationConfigs[1].onSuccess();

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.progressPhotos.all });
  });
});


