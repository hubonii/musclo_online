/**
 * Hook for fetching today's scheduled workout routine.
 */
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';


export const useTodayRoutine = () => {
    return useQuery({
        queryKey: queryKeys.routines.today,

        queryFn: () => apiGet('/routines/today').catch(() => null),
        staleTime: 5 * 60 * 1000, // 5 min — routine schedule rarely changes mid-session
    });
};


