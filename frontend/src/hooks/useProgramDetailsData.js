// Program details hook: load routines, search them, and handle routine deletion.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { queryKeys } from '../api/queryKeys';

// Coordinates program detail page data, search filtering, and routine deletion state.
import { useProgram } from './usePrograms';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useProgramDetailsData() {
    const { id: programId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: program, isLoading: loading } = useProgram(programId);
    const routines = program?.routines || [];
    
    const [search, setSearch] = useState('');
    const [deleteModalRoutine, setDeleteModalRoutine] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch last logs using react-query for caching
    const { data: lastLogMap = {} } = useQuery({
        queryKey: ['routines', 'last-logs', programId],
        queryFn: async () => {
            const results = {};
            await Promise.allSettled(routines.map(async (r) => {
                try {
                    const { data } = await apiClient.get(`/routines/${r.id}/last-log`);
                    results[r.id] = data.data?.started_at || null;
                } catch {
                    results[r.id] = null;
                }
            }));
            return results;
        },
        enabled: routines.length > 0,
        staleTime: 60000 // 1 minute
    });
    // Derived list updates immediately as search text changes.
    const filteredWorkouts = routines.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    const handleDeleteRoutine = async () => {
        if (!deleteModalRoutine)
            return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/routines/${deleteModalRoutine.id}`);
            toast('success', 'Routine deleted');
            setDeleteModalRoutine(null);
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(programId) });
        }
        catch (err) {
            toast('error', 'Failed to delete routine');
        }
        finally {
            setIsDeleting(false);
        }
    };
    // Summary count used by ProgramBreakdown sidebar card.
    const totalExercises = routines.reduce((acc, r) => acc + (r.exercises?.length || 0), 0);
    return {
        programId,
        program,
        routines,
        loading,
        search,
        setSearch,
        filteredWorkouts,
        deleteModalRoutine,
        setDeleteModalRoutine,
        isDeleting,
        lastLogMap,
        handleDeleteRoutine,
        totalExercises
    };
}


