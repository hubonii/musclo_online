// Exercise picker used by the routine/workout builders.
import { useState, useEffect, memo } from 'react';
import { Search, Info, Plus } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useToast } from '../ui/Toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import ExerciseDetailModal from '../exercises/ExerciseDetailModal';
import { cn } from '../../lib/utils';
import { cacheSet, cacheGet } from '../../lib/offlineCache';
const ExerciseItem = memo(({ ex, isSelected, isFocused, onSelect, onPreview }) => {
    const imageUrl = ex.thumbnail_url || ex.gif_url;
return (<div id={`ex-${ex.id}`} onClick={() => onPreview(ex)} className={cn("flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer border", isSelected
            ? 'bg-divider/20 border-emerald opacity-70'
            : isFocused
                ? 'bg-emerald/5 border-emerald shadow-neu-sm ring-1 ring-emerald/30'
                : 'bg-surface border-divider hover:bg-app shadow-neu-sm')}>
            <div className="w-16 h-16 bg-divider/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-neu-inset p-0">
                {imageUrl && !imageUrl.endsWith('/') ? (<img src={imageUrl} alt={ex.name} className="w-full h-full object-contain filter drop-shadow-sm mix-blend-multiply dark:mix-blend-normal" loading="lazy"/>) : (<span className="text-[10px] text-text-muted">No Img</span>)}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-text-primary capitalize truncate" title={ex.name}>{ex.name}</h4>
                <p className="text-xs font-semibold text-text-muted capitalize mt-0.5 truncate">{ex.muscle_group} • {ex.equipment || 'Bodyweight'}</p>
            </div>
            <Button variant="secondary" size="sm" disabled={isSelected} onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isSelected) {
                onSelect(ex);
            }
        }} className={cn("shrink-0 rounded-lg w-10 h-10 p-0 flex items-center justify-center", isSelected ? "bg-emerald text-white" : "")} aria-label={isSelected ? `${ex.name} already added` : `Add ${ex.name} to workout`}>
                {isSelected ? '✓' : <Plus size={18}/>}
            </Button>
        </div>);
});
export default function ExercisePicker({ onSelect, onClose, selectedIds = [], hideHeaderInfo = false }) {
const [exercises, setExercises] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [search, setSearch] = useState('');
const [bodyPart, setBodyPart] = useState(null);
const [bodyPartOptions, setBodyPartOptions] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const [selectedExercise, setSelectedExercise] = useState(null);
const [focusedIndex, setFocusedIndex] = useState(-1);
    const { toast } = useToast();
useEffect(() => {
        setFocusedIndex(-1);
    }, [exercises]);
    const handleKeyDown = (e) => {
        if (exercises.length === 0)
            return;
        // Arrow navigation + Enter-to-add supports keyboard-only picker usage.
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => (prev < exercises.length - 1 ? prev + 1 : prev));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        else if (e.key === 'Enter' && focusedIndex >= 0) {
            e.preventDefault();
            // Enter selects the currently focused row when it is not already added.
            const exercise = exercises[focusedIndex];
            const isSelected = selectedIds.includes(exercise.id);
            if (!isSelected) {
                onSelect(exercise);
            }
        }
    };
useEffect(() => {
        if (focusedIndex >= 0) {
            const el = document.getElementById(`ex-${exercises[focusedIndex].id}`);
            el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [focusedIndex, exercises]);
useEffect(() => {
        setPage(1);
    }, [search, bodyPart]);
useEffect(() => {
        // Load body-part filter options once.
        const fetchFilters = async () => {
            try {
                const { data } = await apiClient.get('/exercises/filters');
                const parts = data.data.body_parts || [];
                setBodyPartOptions(parts);
                cacheSet('exercises-filters', parts);
            }
            catch (err) {
                // Fall back to cached filter options when offline.
                const cached = cacheGet('exercises-filters');
                if (cached) setBodyPartOptions(cached);
                else console.error('Failed to load body part filters', err);
            }
        };
        fetchFilters();
    }, []);
useEffect(() => {
        // Load exercises with pagination and lightweight debounce.
        const loadExercises = async () => {
            if (page === 1)
                setIsLoading(true);
            else
                setLoadingMore(true);
            try {
                const { data } = await apiClient.get('/exercises', {
                    params: {
                        limit: 30,
                        page,
                        search: search || undefined,
                        body_part: bodyPart || undefined,
                    }
                });
                            // Replaces list on page 1, appends rows for subsequent pages.
                setExercises(prev => page === 1 ? data.data : [...prev, ...data.data]);
                setHasMore(data.meta && data.meta.current_page < data.meta.last_page);
                // Cache the first page of unfiltered results for offline picker use.
                if (page === 1 && !search && !bodyPart) {
                    cacheSet('exercises-picker', data.data);
                }
            }
            catch (err) {
                // Fall back to cached exercises when network is unavailable.
                if (page === 1) {
                    const cached = cacheGet('exercises-catalog') || cacheGet('exercises-picker');
                    if (cached) {
                        let filtered = cached;
                        if (search) filtered = filtered.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
                        if (bodyPart) filtered = filtered.filter(ex => (ex.body_part || ex.muscle_group || '').toLowerCase() === bodyPart.toLowerCase());
                        setExercises(filtered);
                        setHasMore(false);
                    } else {
                        toast('error', 'Failed to retrieve exercises');
                    }
                }
            }
            finally {
                setIsLoading(false);
                setLoadingMore(false);
            }
        };
        const debounceTimer = setTimeout(loadExercises, 300);
return () => clearTimeout(debounceTimer);
    }, [toast, search, bodyPart, page]);
return (<div className="flex flex-col h-full w-full overflow-hidden bg-app outline-none" onKeyDown={handleKeyDown} tabIndex={-1}>
            <div className="p-4 border-b border-divider shrink-0 space-y-3">
                {!hideHeaderInfo && (<div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-text-primary">Add Exercise</h3>
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors" aria-label="Close exercise picker">
                            ✕
                        </button>
                    </div>)}

                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input placeholder="Search exercises..." icon={<Search size={18}/>} value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search exercises"/>
                    </div>

                </div>

                <div className="flex gap-2  pb-2 scrollbar-hide">
                    <Badge variant={bodyPart === null ? 'accent' : 'default'} className="cursor-pointer shrink-0" onClick={() => setBodyPart(null)}>
                        All
                    </Badge>
                    {bodyPartOptions.map((bp) => (<Badge key={bp} variant={bodyPart === bp ? 'accent' : 'default'} className="cursor-pointer shrink-0" onClick={() => setBodyPart(bp)}>
                            {bp}
                        </Badge>))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (<div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg"/>
                        <p className="text-text-muted mt-4 font-medium italic">Fetching exercises...</p>
                    </div>) : exercises.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <Info size={32} className="mb-2 opacity-50"/>
                        <p>No exercises found.</p>
                    </div>) : (<div className="space-y-1">
                        {exercises.map((ex, index) => (<ExerciseItem key={ex.id} ex={ex} isSelected={selectedIds.includes(ex.id)} isFocused={index === focusedIndex} onSelect={onSelect} onPreview={setSelectedExercise}/>))}

                        {hasMore && (<div className="pt-4 pb-2 flex justify-center">
                                <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={loadingMore} className="w-full shadow-neu-sm">
                                    {loadingMore ? 'Loading more...' : 'Load More'}
                                </Button>
                            </div>)}
                    </div>)}
            </div>

            <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} actionButtonText="Add to Workout" isAdded={selectedExercise ? selectedIds.includes(selectedExercise.id) : false} onAction={(ex) => {
            onSelect(ex);
            setSelectedExercise(null);
        }}/>
        </div>);
}


