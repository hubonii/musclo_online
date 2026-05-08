/**
 * Hook for fetching and updating user profile information.
 * @param {string|number} [userId='me'] - The user ID to fetch.
 * @returns {Object} React Query result for user profile.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../api/axios';
import { queryKeys } from '../api/queryKeys';

export const useProfile = (userId) => {

    const id = userId || 'me';
    return useQuery({
        queryKey: queryKeys.profile.detail(id),
        queryFn: () => apiGet(`/profile/${id}`),
    });
};

export const useAchievements = (userId) => {
    const id = userId || 'me';
    return useQuery({
        queryKey: queryKeys.profile.achievements(id),
        queryFn: () => apiGet(`/profile/${id}/achievements`),
    });
};

export const useSharedWorkouts = (userId) => {
    const id = userId || 'me';
    return useQuery({
        queryKey: queryKeys.profile.routines(id),
        queryFn: () => apiGet(`/profile/${id}/routines`),
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => apiPut('/profile', payload),
        onSuccess: (updatedProfile) => {

            queryClient.setQueryData(queryKeys.profile.detail(updatedProfile.id), (old) => ({ ...(old ?? {}), ...updatedProfile }));
            queryClient.setQueryData(queryKeys.profile.detail('me'), (old) => ({ ...(old ?? {}), ...updatedProfile }));
        },
    });
};


