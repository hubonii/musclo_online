// Measurements query and CRUD mutations.
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
            // Invalidates measurements collection query after create mutation.
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
            // Invalidates measurements collection query after delete mutation.
            queryClient.invalidateQueries({ queryKey: queryKeys.measurements.all });
        },
    });
};


