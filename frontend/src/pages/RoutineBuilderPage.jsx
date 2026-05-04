// Routine builder page for creating/editing workout templates.
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ExercisePicker from '../components/routines/ExercisePicker';
import { useRoutineBuilder } from '../hooks/useRoutineBuilder';
import BuilderHeader from '../components/routines/BuilderHeader';
import RoutineConfigCard from '../components/routines/RoutineConfigCard';
import RoutineExerciseItem from '../components/routines/RoutineExerciseItem';
// Routine builder route that edits metadata, exercise list, and template sets.
export default function RoutineBuilderPage() {
    const { isNew, programId, programName, routineName, setRoutineName, notes, setNotes, dayOfWeek, setDayOfWeek, exercises, isSaving, loading, showMobileLibrary, setShowMobileLibrary, handleAddExercise, handleRemoveExercise, addSet, removeSet, updateSet, updateExerciseParam, toggleExpand, handleSave, navigate } = useRoutineBuilder();
    if (loading) {
        // Builder remains blocked until program/routine bootstrap data finishes loading.
return (<div className="min-h-screen bg-app flex items-center justify-center p-6">
                <LoadingSpinner size="lg"/>
            </div>);
    }
return (<div className="min-h-screen bg-app font-sans text-text-primary">
            <BuilderHeader programId={programId} programName={programName} routineName={routineName} isNew={isNew} isSaving={isSaving} onSave={handleSave} onDiscard={() => navigate(-1)} onNavigate={navigate}/>
            {/* Main two-column layout */}
            <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6 w-full">

                    <RoutineConfigCard routineName={routineName} setRoutineName={setRoutineName} notes={notes} setNotes={setNotes} dayOfWeek={dayOfWeek} setDayOfWeek={setDayOfWeek}/>

                    {/* Routine exercise cards */}
                    <div className="flex flex-col gap-6 pb-32 lg:pb-0">
                        <AnimatePresence mode="popLayout">
                            {exercises.length === 0 ? (<motion.div className="bg-surface p-12 rounded-2xl shadow-neu flex flex-col items-center justify-center text-center border-2 border-dashed border-divider/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h4 className="text-xl font-bold text-text-primary mb-2">No Exercises Added</h4>
                                    <p className="text-text-secondary max-w-sm">Use the Exercise Library to build your workout piece by piece.</p>
                                    <Button variant="primary" className="mt-6 lg:hidden" onClick={() => setShowMobileLibrary(true)}>
                                        Browse Library
                                    </Button>
                                </motion.div>) : (exercises.map((item, exIndex) => (<RoutineExerciseItem key={item._uiId} item={item} exIndex={exIndex} onToggleExpand={toggleExpand} onRemove={handleRemoveExercise} onUpdateParam={updateExerciseParam} onAddSet={addSet} onRemoveSet={removeSet} onUpdateSet={updateSet}/>)))}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Desktop exercise library */}
                <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-120px)] bg-surface rounded-2xl shadow-neu overflow-hidden flex-col">
                    <ExercisePicker onSelect={handleAddExercise} onClose={() => { }} hideHeaderInfo={true}/>
                </div>
            </div>
            {/* Mobile full-screen library sheet */}
            <AnimatePresence>
                {showMobileLibrary && (<motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-50 bg-app flex flex-col lg:hidden">
                        {/* Mobile sheet reuses ExercisePicker and closes after selection/done action. */}
                        <div className="p-4 bg-surface flex justify-between items-center shadow-neu-sm shrink-0">
                            <h2 className="text-xl font-black text-text-primary">Exercise Library</h2>
                            <button onClick={() => setShowMobileLibrary(false)} className="p-2 bg-app rounded-xl shadow-neu-sm text-text-primary">
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-surface">
                            <ExercisePicker onSelect={(ex) => {
                                handleAddExercise(ex);
                            }} onClose={() => setShowMobileLibrary(false)} hideHeaderInfo={true}/>
                        </div>
                        <div className="p-4 bg-surface shadow-[0_-10px_20px_rgba(0,0,0,0.1)] shrink-0 pb-8">
                            <Button variant="primary" className="w-full font-bold" onClick={() => setShowMobileLibrary(false)}>
                                Done
                            </Button>
                        </div>
                    </motion.div>)}
            </AnimatePresence>

            {/* Floating action to reopen mobile library while editing */}
            {exercises.length > 0 && !showMobileLibrary && (<div className="fixed bottom-6 right-6 lg:hidden z-40 mb-safe-bottom">
                    <button onClick={() => setShowMobileLibrary(true)} className="w-16 h-16 bg-emerald text-white rounded-xl flex items-center justify-center shadow-neu focus:outline-none">
                        <Plus size={32}/>
                    </button>
                </div>)}
        </div>);
}

