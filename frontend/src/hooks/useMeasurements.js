/**
 * Hook for managing user body measurements and tracking history.
 * @returns {Object} React Query result for measurements.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
export const useMeasurements = () => {
    return useQuery({
        queryKey: queryKeys.measurements.all,
        queryFn: () => apiGet('/measurements'),
    });
};
export const useAddMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (measurement) => apiPost('/measurements', measurement),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: queryKeys.measurements.all });
        },
    });
};
export const useUpdateMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...measurement }) => apiPut(`/measurements/${id}`, measurement),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.measurements.all });
        },
    });
};
export const useDeleteMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiDelete(`/measurements/${id}`),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: queryKeys.measurements.all });
        },
    });
};


