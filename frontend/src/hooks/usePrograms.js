// Program list/detail queries with create/update/delete mutations.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import { useToast } from '../components/ui/Toast';
export function usePrograms() {
    return useQuery({
        queryKey: queryKeys.programs.all,
        queryFn: () => apiGet('/programs'),
    });
}
export function useProgram(id) {
    return useQuery({
        queryKey: queryKeys.programs.detail(id),
        queryFn: () => apiGet(`/programs/${id}`),
        // Avoid firing detail requests until route param or selected id is available.
        enabled: !!id,
    });
}
export function useCreateProgram() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (program) => apiPost('/programs', program),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
            toast('success', 'Program created successfully');
        },
        onError: () => {
            toast('error', 'Failed to create program');
        },
    });
}
export function useUpdateProgram() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ id, ...data }) => apiPut(`/programs/${id}`, data),
        onSuccess: (data) => {
            // Invalidates list and detail query caches after update mutation.
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(data.id) });
            toast('success', 'Program updated successfully');
        },
        onError: () => {
            toast('error', 'Failed to update program');
        },
    });
}
export function useDeleteProgram() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (id) => apiDelete(`/programs/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
            toast('success', 'Program deleted successfully');
        },
        onError: () => {
            toast('error', 'Failed to delete program');
        },
    });
}


