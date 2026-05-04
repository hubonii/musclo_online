// Fetch aggregated workout stats for dashboard widgets.
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';

// Query wrapper for aggregated workout stats endpoint.
export const useWorkoutStats = () => {
    return useQuery({
        // Shared query key used by all widgets that read aggregated workout stats.
        queryKey: queryKeys.workouts.stats,
        queryFn: () => apiGet('/workouts/stats'),
    });
};


