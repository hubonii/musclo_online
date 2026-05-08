/**
 * Hook for fetching paginated workout history records.
 */
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';


export const useWorkoutHistory = (limit = 30) => {
    return useQuery({

        queryKey: [...queryKeys.workouts.history, { limit }],
        queryFn: () => apiGet('/workouts/history', { per_page: limit }),
    });
};


