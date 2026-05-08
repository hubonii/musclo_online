/**
 * Hooks for managing application and user settings via React Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
export const useSettings = () => {
    return useQuery({
        queryKey: queryKeys.settings.all,
        queryFn: () => apiGet('/settings'),

        staleTime: Infinity,
    });
};
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => apiPut('/settings', payload),
        onSuccess: (updatedSettings) => {

            queryClient.setQueryData(queryKeys.settings.all, updatedSettings);
        },
    });
};


