// Fetch paged workout history with configurable item count.
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';

// Query wrapper for paginated workout history endpoint.
export const useWorkoutHistory = (limit = 30) => {
    return useQuery({
        // Query key includes `limit` to create separate cache entries per page size.
        queryKey: [...queryKeys.workouts.history, { limit }],
        queryFn: () => apiGet('/workouts/history', { per_page: limit }),
    });
};


