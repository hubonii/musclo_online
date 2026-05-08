/**
 * Hook for fetching aggregated workout statistics for the dashboard.
 */
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';


export const useWorkoutStats = () => {
    return useQuery({

        queryKey: queryKeys.workouts.stats,
        queryFn: () => apiGet('/workouts/stats'),
    });
};


