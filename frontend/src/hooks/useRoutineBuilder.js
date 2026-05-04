// Routine builder hook: load/edit routine data and prepare save payloads.
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { useSettings } from './useSettings';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
export function useRoutineBuilder() {
    const queryClient = useQueryClient();
    const { data: settings } = useSettings();
    const { programId, routineId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isNew = routineId === 'new';
    const [programName, setProgramName] = useState('Loading...');
    const [routineName, setRoutineName] = useState('');
    const [notes, setNotes] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showMobileLibrary, setShowMobileLibrary] = useState(false);
    useEffect(() => {
        // Load program/routine data needed by the builder screen.
        const fetchData = async () => {
            setLoading(true);
            try {
                if (programId && programId !== 'standalone') {
                    const progRes = await apiClient.get(`/programs/${programId}`);
                    setProgramName(progRes.data.data.name);
                }
                else {
                    setProgramName('My Workouts');
                }
                if (!isNew && routineId) {
                    const routRes = await apiClient.get(`/routines/${routineId}`);
                    const r = routRes.data.data;
                    setRoutineName(r.name);
                    setNotes(r.notes || '');
                    setDayOfWeek(r.day_of_week ?? null);
                    const mappedEx = r.exercises.map((ex, idx) => ({
                        _uiId: crypto.randomUUID(),
                        isExpanded: true,
                        exercise: ex,
                        sort_order: ex.pivot?.sort_order ?? idx,
                        target_sets: ex.pivot?.target_sets ?? 0,
                        target_reps: ex.pivot?.target_reps ?? 0,
                        override_type: ex.pivot?.override_type ?? null,
                        override_metric: ex.pivot?.override_metric ?? null,
                        rest_timer_seconds: ex.pivot?.rest_timer_seconds ?? null,
                        sets: (ex.sets || []).map((s) => ({
                            id: s.id.toString(),
                            set_type: s.set_type || 'working',
                            weight_kg: s.weight_kg ?? null,
                            reps: s.reps ?? null,
                            duration_seconds: s.duration_seconds ?? null,
                            rir: s.rir ?? null,
                            rpe: s.rpe ?? null,
                        }))
                    }));
                    setExercises(mappedEx);
                }
            }
            catch (err) {
                toast('error', 'Failed to load builder data');
                navigate('/programs');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [programId, routineId]);
    const handleAddExercise = (exercise) => {
        // Adds one builder row with default targets plus one starter set template.
        setExercises(prev => [
            ...prev,
            {
                _uiId: crypto.randomUUID(),
                isExpanded: false,
                exercise,
                sort_order: prev.length,
                target_sets: 1,
                target_reps: 10,
                override_type: null,
                override_metric: null,
                rest_timer_seconds: settings?.default_rest_timer_seconds ?? 90,
                sets: [{
                        id: crypto.randomUUID(),
                        set_type: 'working',
                        weight_kg: null,
                        reps: null,
                        duration_seconds: null,
                        rir: null,
                        rpe: null
                    }]
            }
        ]);
        toast('success', `Added ${exercise.name}`);
    };
    const handleRemoveExercise = (index) => {
        setExercises(prev => prev.filter((_, i) => i !== index));
    };
    const addSet = (exerciseIndex) => {
        setExercises(prev => {
            const next = prev.map((ex, i) => {
                if (i !== exerciseIndex)
                    return ex;
                const lastSet = ex.sets[ex.sets.length - 1];
                const newSet = {
                    id: crypto.randomUUID(),
                    set_type: 'working',
                    weight_kg: lastSet ? lastSet.weight_kg : null,
                    reps: lastSet ? lastSet.reps : null,
                    duration_seconds: lastSet ? lastSet.duration_seconds : null,
                    rir: lastSet ? lastSet.rir : null,
                    rpe: lastSet ? lastSet.rpe : null
                };
                return {
                    ...ex,
                    sets: [...ex.sets, newSet],
                    target_sets: ex.sets.length + 1,
                };
            });
            return next;
        });
    };
    const removeSet = (exerciseIndex, setIndex) => {
        setExercises(prev => prev.map((ex, i) => {
            if (i !== exerciseIndex)
                return ex;
            const newSets = ex.sets.filter((_, si) => si !== setIndex);
            return { ...ex, sets: newSets, target_sets: newSets.length };
        }));
    };
    const updateSet = (exerciseIndex, setIndex, field, value) => {
        setExercises(prev => {
            const next = [...prev];
            const ex = { ...next[exerciseIndex] };
            const sets = [...ex.sets];
            const sourceSet = { ...sets[setIndex] };
            const oldValue = sourceSet[field];
            sets[setIndex] = { ...sourceSet, [field]: value };
            if (field === 'weight_kg' || field === 'reps' || field === 'duration_seconds' || field === 'rir' || field === 'rpe') {
                // Propagates field update to subsequent sets with unchanged or null field value.
                for (let i = setIndex + 1; i < sets.length; i++) {
                    const currentSet = sets[i];
                    if (currentSet[field] === oldValue || currentSet[field] === null) {
                        sets[i] = { ...currentSet, [field]: value };
                    }
                }
            }
            ex.sets = sets;
            next[exerciseIndex] = ex;
            return next;
        });
    };
    const updateExerciseParam = (exerciseIndex, field, value) => {
        setExercises(prev => {
            const next = [...prev];
            next[exerciseIndex] = { ...next[exerciseIndex], [field]: value };
            return next;
        });
    };
    const toggleExpand = (index) => {
        setExercises(prev => {
            const next = [...prev];
            next[index] = { ...next[index], isExpanded: !next[index].isExpanded };
            return next;
        });
    };
    const handleSave = async () => {
        if (!routineName.trim()) {
            toast('error', 'Routine name is required');
            return;
        }
        if (exercises.length === 0) {
            toast('error', 'Add at least one exercise');
            return;
        }
        setIsSaving(true);
        try {
            // Keep payload shape aligned with backend routine create/update endpoints.
            const payload = {
                name: routineName.trim(),
                notes: notes.trim() || undefined,
                day_of_week: dayOfWeek,
                exercises: exercises.map((item, idx) => ({
                    id: item.exercise.id,
                    sort_order: idx,
                    target_sets: item.sets.length,
                    target_reps: item.sets[0]?.reps || 10,
                    override_type: item.override_type,
                    override_metric: item.override_metric,
                    rest_timer_seconds: item.rest_timer_seconds,
                    sets: item.sets.map(s => ({
                        set_type: s.set_type,
                        weight_kg: s.weight_kg,
                        reps: s.reps,
                        duration_seconds: s.duration_seconds,
                        rir: s.rir,
                        rpe: s.rpe,
                    }))
                }))
            };
            const actualProgramId = programId === 'standalone' ? null : programId;
            let endpoint = '';
            // Create goes through program-scoped route; update goes through routine id route.
            if (isNew) {
                endpoint = actualProgramId ? `/programs/${actualProgramId}/routines` : '/routines';
                await apiClient.post(endpoint, payload);
                toast('success', 'Workout initialized successfully!');
            }
            else {
                endpoint = `/routines/${routineId}`;
                await apiClient.put(endpoint, payload);
                toast('success', 'Workout committed successfully!');
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.routines.today });
            
            navigate(actualProgramId ? `/programs/${actualProgramId}` : '/programs');
        }
        catch (err) {
            toast('error', err.response?.data?.message || 'Failed to save routine');
        }
        finally {
            setIsSaving(false);
        }
    };
    return {
        isNew,
        programId,
        programName,
        routineName,
        setRoutineName,
        notes,
        setNotes,
        dayOfWeek,
        setDayOfWeek,
        exercises,
        isSaving,
        loading,
        showMobileLibrary,
        setShowMobileLibrary,
        handleAddExercise,
        handleRemoveExercise,
        addSet,
        removeSet,
        updateSet,
        updateExerciseParam,
        toggleExpand,
        handleSave,
        navigate
    };
}


