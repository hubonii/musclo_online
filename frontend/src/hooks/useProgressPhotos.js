/**
 * Hooks for managing progress photos via React Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete, apiClient } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
/**
 * Hook for fetching user progress photos.
 * @returns {Object} React Query result for photos.
 */
export const useProgressPhotos = () => {
    return useQuery({
        queryKey: queryKeys.progressPhotos.all,
        queryFn: () => apiGet('/progress-photos'),
    });
};
/**
 * Hook for uploading a new progress photo.
 * @returns {Object} React Query mutation for photo upload.
 */
export const useUploadProgressPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {

            const { data } = await apiClient.post('/progress-photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: queryKeys.progressPhotos.all });
        },
    });
};
export const useDeleteProgressPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiDelete(`/progress-photos/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.progressPhotos.all });
        },
    });
};


