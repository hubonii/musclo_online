// Program details page: search routines, open builder, and manage routine cards.
import { AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgramDetailsData } from '../hooks/useProgramDetailsData';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import RoutineCard from '../components/programs/RoutineCard';
import ProgramBreakdown from '../components/programs/ProgramBreakdown';
// Program detail route showing routines, search, and routine-management actions.
export default function ProgramDetailsPage() {
    const navigate = useNavigate();
    // Hook combines program query, routine filtering, and delete-dialog state.
    const { programId, program, routines, loading, search, setSearch, filteredWorkouts, deleteModalRoutine, setDeleteModalRoutine, isDeleting, lastLogMap, handleDeleteRoutine, totalExercises } = useProgramDetailsData();
return (<div className="min-h-screen bg-app font-sans text-text-primary selection:bg-accent-primary/30">
            {/* Sticky breadcrumb-style top bar */}
            <div className="sticky top-0 z-40 bg-surface w-full shadow-neu-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                    <span className="text-text-muted cursor-pointer hover:text-emerald transition-colors" onClick={() => navigate('/programs')}>
                        Programs
                    </span>
                    <ChevronRight size={16} className="text-text-muted/40"/>
                    <span className="text-text-primary">{program ? program.name : 'Loading...'}</span>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-24">
                {/* Main content column */}
                <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">{program?.name || 'Program'}</h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
                            {program?.description || 'Manage the workouts dedicated to this training program.'}
                        </p>
                    </div>

                    {/* Search input + create routine action */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-72">
                            <Input placeholder="Search workouts..." icon={<Search size={18}/>} value={search} onChange={(e) => setSearch(e.target.value)}/>
                        </div>
                        <Button variant="primary" className="w-full sm:w-auto font-bold shadow-neu-sm" onClick={() => navigate(`/programs/${programId}/routines/new`)}>
                            + Build Workout
                        </Button>
                    </div>

                    {/* Routine grid with loading/empty states */}
                    <div className="pt-2">
                        {loading ? (<div className="flex flex-col items-center justify-center min-h-[400px] py-16">
                                <LoadingSpinner size="lg"/>
                                <p className="text-sm font-black text-text-secondary mt-4 animate-pulse uppercase tracking-widest text-center">
                                    Loading program details...
                                </p>
                            </div>) : filteredWorkouts.length === 0 ? (<EmptyState icon={<Dumbbell size={48}/>} title={search ? 'No workouts found' : 'No workouts yet in this program'} description={search ? `Try adjusting your search for "${search}".` : 'Add your first workout to start organizing your workouts.'} action={!search && <Button variant="primary" onClick={() => navigate(`/programs/${programId}/routines/new`)}>Build Workout</Button>}/>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Uses filtered list so search text updates card grid immediately. */}
                                <AnimatePresence>
                                    {filteredWorkouts.map((routine) => (<RoutineCard key={routine.id} routine={routine} lastPerformed={lastLogMap[routine.id]} onEdit={() => navigate(`/programs/${programId}/routines/${routine.id}`)} onDelete={() => setDeleteModalRoutine(routine)} onLog={() => navigate(routine.id ? `/workout/${routine.id}` : '/workout')}/>))}
                                </AnimatePresence>
                            </div>)}
                    </div>
                </div>

                {/* Right-side summary panel */}
                <ProgramBreakdown routines={routines} totalExercises={totalExercises}/>

            </div>

            <ConfirmDialog open={!!deleteModalRoutine} onOpenChange={(open) => { if (!open)
        setDeleteModalRoutine(null); }} title="Delete Workout" description={`Are you sure you want to delete "${deleteModalRoutine?.name}"? Its workout history will be untouched.`} confirmLabel="Delete" variant="danger" onConfirm={handleDeleteRoutine} isLoading={isDeleting}/>
        </div>);
}

