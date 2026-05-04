// React Query hooks for reading and mutating settings records.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
export const useSettings = () => {
    return useQuery({
        queryKey: queryKeys.settings.all,
        queryFn: () => apiGet('/settings'),
        // Settings query uses persistent cache (no automatic staleness timeout).
        staleTime: Infinity,
    });
};
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => apiPut('/settings', payload),
        onSuccess: (updatedSettings) => {
            // Writes server response directly into the settings cache entry.
            queryClient.setQueryData(queryKeys.settings.all, updatedSettings);
        },
    });
};


