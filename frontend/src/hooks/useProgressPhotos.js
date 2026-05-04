// Progress photo query + upload/delete mutation helpers.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete, apiClient } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
export const useProgressPhotos = () => {
    return useQuery({
        queryKey: queryKeys.progressPhotos.all,
        queryFn: () => apiGet('/progress-photos'),
    });
};
export const useUploadProgressPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            // Uses axios instance directly for multipart upload request construction.
            const { data } = await apiClient.post('/progress-photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },
        onSuccess: () => {
            // Invalidates photo list cache after a successful upload mutation.
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


