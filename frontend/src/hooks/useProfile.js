// Profile-related queries (profile, achievements, routines) + update mutation.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../api/axios';
import { queryKeys } from '../api/queryKeys';

export const useProfile = (userId) => {
    // Resolves profile target id; defaults to `me` for authenticated user endpoints.
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
            // Updates both cache keys: specific user id and `me` alias.
            queryClient.setQueryData(queryKeys.profile.detail(updatedProfile.id), (old) => ({ ...(old ?? {}), ...updatedProfile }));
            queryClient.setQueryData(queryKeys.profile.detail('me'), (old) => ({ ...(old ?? {}), ...updatedProfile }));
        },
    });
};


