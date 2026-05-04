// Exercise library page with search, category chips, and advanced filter modal.
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, WifiOff } from 'lucide-react';
import { apiClient, API_URL } from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { MOTION } from '../lib/motion';
import ExerciseCard from '../components/exercises/ExerciseCard';
import FilterModal from '../components/exercises/FilterModal';
import ExerciseDetailModal from '../components/exercises/ExerciseDetailModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { cn } from '../lib/utils';
import { cacheSet, cacheGet } from '../lib/offlineCache';

// Loads exercise catalog with search/chip/modal filters and shows detail modal on selection.
import { useMemoryStore } from '../stores/useMemoryStore';

export default function ExercisesPage() {
    const { 
        exercisesSearch: search, setExercisesSearch: setSearch,
        exercisesCategory: selectedCategory, setExercisesCategory: setSelectedCategory,
        exercisesBodyPart: selectedBodyPart, setExercisesBodyPart: setSelectedBodyPart,
        exercisesEquipment: selectedEquipment, setExercisesEquipment: setSelectedEquipment,
        exercisesPage: page, setExercisesPage: setPage
    } = useMemoryStore();

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isOfflineData, setIsOfflineData] = useState(false);
    
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    const [hasMore, setHasMore] = useState(true);
    
    const { toast } = useToast();

    // Reset pagination only when search/filters change (excluding initial mount)
    const prevParams = useRef({ search, selectedCategory, selectedBodyPart, selectedEquipment });
    useEffect(() => {
        const hasChanged = 
            prevParams.current.search !== search ||
            prevParams.current.selectedCategory !== selectedCategory ||
            prevParams.current.selectedBodyPart !== selectedBodyPart ||
            prevParams.current.selectedEquipment !== selectedEquipment;

        if (hasChanged) {
            setPage(1);
            setExercises([]);
            setHasMore(true);
            prevParams.current = { search, selectedCategory, selectedBodyPart, selectedEquipment };
        }
    }, [search, selectedCategory, selectedBodyPart, selectedEquipment, setPage]);

    useEffect(() => {
        const fetchExercises = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            setIsOfflineData(false);
            try {
                const { data } = await apiClient.get('/exercises', {
                    params: {
                        limit: 20,
                        page: page,
                        search: search || undefined,
                        body_part: selectedCategory || selectedBodyPart || undefined,
                        equipment: selectedEquipment || undefined
                    }
                });

                const newExercises = data.data;
                setExercises(prev => page === 1 ? newExercises : [...prev, ...newExercises]);
                setHasMore(data.meta.current_page < data.meta.last_page);

                if (page === 1 && !search && !selectedCategory && !selectedBodyPart && !selectedEquipment) {
                    cacheSet('exercises-catalog', newExercises);
                }
            } catch (err) {
                const cached = cacheGet('exercises-catalog');
                if (cached && page === 1) {
                    let filtered = cached;
                    const bp = selectedCategory || selectedBodyPart;
                    if (search) filtered = filtered.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
                    if (bp) filtered = filtered.filter(ex => (ex.body_part || ex.muscle_group || '').toLowerCase() === bp.toLowerCase());
                    if (selectedEquipment) filtered = filtered.filter(ex => (ex.equipment || '').toLowerCase() === selectedEquipment.toLowerCase());
                    setExercises(filtered);
                    setIsOfflineData(true);
                    setHasMore(false);
                } else {
                    toast('error', 'Failed to load exercises');
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchExercises();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, selectedCategory, selectedBodyPart, selectedEquipment, page, toast]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        const target = document.getElementById('load-more-trigger');
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [hasMore, loading, loadingMore]);

    return (
        <div className="flex flex-col bg-app">
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                {/* Search bar */}
                <div className="max-w-2xl mx-auto w-full relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-text-muted">
                        <Search size={20} strokeWidth={2.5}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for exercises" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full h-14 pl-14 pr-6 bg-app rounded-xl text-text-primary text-sm shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-orange/30 transition-all placeholder:text-text-muted font-medium"
                    />
                </div>

                {/* Quick muscle/category chips + advanced filter button */}
                <div className="w-full hide-scrollbar flex items-center justify-between gap-3 md:gap-6 px-2 md:px-4 py-4 select-none">
                    {[ 
                        { name: 'Cardio', icon: `${API_URL}/storage/exercises/icons/ic_cardio.svg` },
                        { name: 'Chest', icon: `${API_URL}/storage/exercises/icons/ic_chest.svg` },
                        { name: 'Back', icon: `${API_URL}/storage/exercises/icons/ic_back.svg` },
                        { name: 'Biceps', icon: `${API_URL}/storage/exercises/icons/ic_biceps.svg` },
                        { name: 'Triceps', icon: `${API_URL}/storage/exercises/icons/ic_triceps.svg` },
                        { name: 'Quadriceps', icon: `${API_URL}/storage/exercises/icons/ic_quadriceps.svg` },
                        { name: 'Hamstrings', icon: `${API_URL}/storage/exercises/icons/ic_hamstrings.svg` },
                        { name: 'Shoulders', icon: `${API_URL}/storage/exercises/icons/ic_shoulders.svg` },
                        { name: 'Hips', icon: `${API_URL}/storage/exercises/icons/ic_hips.svg` },
                        { name: 'Waist', icon: `${API_URL}/storage/exercises/icons/ic_abs.svg` },
                        { name: 'Upper Arms', icon: `${API_URL}/storage/exercises/icons/ic_biceps.svg` },
                        { name: 'Calves', icon: `${API_URL}/storage/exercises/icons/ic_calves.svg` },
                        { name: 'Forearms', icon: `${API_URL}/storage/exercises/icons/ic_forearms.svg` },
                        { name: 'Neck', icon: `${API_URL}/storage/exercises/icons/ic_neck.svg` }
                    ].map((cat, idx) => (
                        <button 
                            key={`quick-filter-${cat.name}-${idx}`} 
                            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} 
                            className={cn("flex flex-col items-center gap-2 transition-all duration-300", selectedCategory === cat.name ? "opacity-100 scale-110" : "hover:-translate-y-1 opacity-70 hover:opacity-100")}
                        >
                            <div className={cn("w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl transition-all", selectedCategory === cat.name ? "bg-orange/10 shadow-neu-inset scale-105" : "")}>
                                <img 
                                    src={cat.icon} 
                                    alt={cat.name} 
                                    className={cn(
                                        "w-7 h-7 md:w-8 md:h-8 object-contain transition-all duration-300", 
                                        selectedCategory === cat.name 
                                            ? "grayscale-0 brightness-100 [filter:sepia(1)_saturate(15)_hue-rotate(335deg)]" 
                                            : "grayscale brightness-75 contrast-125 opacity-60"
                                    )} 
                                    loading="lazy" 
                                />
                            </div>
                            <span className={cn("text-[9px] md:text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-colors", selectedCategory === cat.name ? "text-orange" : "text-text-muted")}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                    <div className="w-2 md:w-4"></div>
                    <button 
                        onClick={() => setIsFilterModalOpen(true)} 
                        className={cn("flex flex-col items-center justify-center gap-2 transition-all duration-200", (selectedBodyPart || selectedEquipment) ? "opacity-100 scale-110" : "hover:-translate-y-1 opacity-70 hover:opacity-100")}
                    >
                        <div className={cn("w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-app shadow-neu", (selectedBodyPart || selectedEquipment) ? "text-orange bg-orange/5 shadow-neu-inset ring-1 ring-orange/20" : "text-text-secondary")}>
                            <SlidersHorizontal size={18}/>
                        </div>
                        <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", (selectedBodyPart || selectedEquipment) ? "text-orange" : "text-text-muted")}>
                            Filters
                        </span>
                    </button>
                </div>

                <div className="h-2"/>

                {isOfflineData && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2">
                        <WifiOff size={14} className="text-amber-500 flex-shrink-0"/>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Offline — showing cached data</span>
                    </div>
                )}

                <div className="pt-2">
                    {loading && exercises.length === 0 ? (
                        <LoadingSpinner size="xl" message="Loading catalog..." className="min-h-[400px] py-20" />
                    ) : exercises.length === 0 && !loading ? (
                        <EmptyState title="No exercises found" description="Try adjusting your filters or search terms."/>
                    ) : (
                        <>
                            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" variants={MOTION.staggerContainer} initial="initial" animate="animate">
                                {exercises.map((ex, idx) => (
                                    <ExerciseCard key={`exercise-card-${ex.id}-${idx}`} exercise={ex} onClick={setSelectedExercise}/>
                                ))}
                            </motion.div>
                            
                            {/* Scroll trigger target */}
                            <div id="load-more-trigger" className="h-20 flex items-center justify-center mt-8">
                                {loadingMore && (
                                    <div className="flex flex-col items-center gap-2 opacity-50 scale-75">
                                        <LoadingSpinner size="sm" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted">Loading Batch...</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)} 
                selectedBodyPart={selectedBodyPart} 
                setSelectedBodyPart={setSelectedBodyPart} 
                selectedEquipment={selectedEquipment} 
                setSelectedEquipment={setSelectedEquipment}
            />
            <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)}/>
        </div>
    );
}


