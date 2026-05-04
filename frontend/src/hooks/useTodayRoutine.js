// Fetch today's suggested routine (returns null when none is scheduled).
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/axios';
import { queryKeys } from '../api/queryKeys';

// Query wrapper for today's routine endpoint with tolerant null fallback.
export const useTodayRoutine = () => {
    return useQuery({
        queryKey: queryKeys.routines.today,
        // Converts API errors to `null` when no routine is scheduled for today.
        queryFn: () => apiGet('/routines/today').catch(() => null),
        staleTime: 5 * 60 * 1000, // 5 min — routine schedule rarely changes mid-session
    });
};


