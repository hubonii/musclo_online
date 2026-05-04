// Dashboard page that composes summary cards, recent entities, and workout entry actions.
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../components/ui/Button';
import WeeklyVolumeHero from '../components/dashboard/WeeklyVolumeHero';
import StatsStrip from '../components/dashboard/StatsStrip';
import WeightTrendCard from '../components/dashboard/WeightTrendCard';
import RecentWorkoutsCard from '../components/dashboard/RecentWorkoutsCard';
import { useDashboardData } from '../hooks/useDashboardData';
import TodayWorkoutAlert from '../components/dashboard/TodayWorkoutAlert';
import ProgressGallery from '../components/dashboard/ProgressGallery';
import MuscleRadarCard from '../components/dashboard/MuscleRadarCard';
import ProgramCard from '../components/programs/ProgramCard';
import RoutineCard from '../components/programs/RoutineCard';
import { Folder, Dumbbell } from 'lucide-react';
export default function DashboardPage() {
    const navigate = useNavigate();
    const { workoutsLoading, allWorkouts, workoutStats, measurements, progressPhotos, todayRoutine, isChartsLoaded, weightProgress, muscleData, weeklyVolumeData, currentWeight, startWeight, weeklyVolumeSum, recentPrograms, recentRoutines } = useDashboardData();
    // Cap the history feed to the 8 most recent entries to prevent the card from expanding too far vertically.
    const recentWorkouts = allWorkouts.slice(0, 8);
    // Parent/child motion variants coordinate staggered entrance animation.
    // Define staggered animation variants so each dashboard card fades in sequentially.
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };
return (<motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-app pb-24 md:pb-8 w-full px-4 md:px-8 pt-6 max-w-5xl mx-auto">
            <WeeklyVolumeHero weeklyVolumeData={weeklyVolumeData} weeklyVolumeSum={weeklyVolumeSum} itemVariants={itemVariants} loading={workoutsLoading}/>

            <StatsStrip workoutStats={workoutStats} itemVariants={itemVariants} loading={workoutsLoading}/>

            <motion.div variants={itemVariants} className="space-y-10 md:space-y-12 mt-10 md:mt-12">
                {/* Show today's suggested routine when available. */}
                {todayRoutine && (<TodayWorkoutAlert routine={todayRoutine} onStart={() => navigate(todayRoutine.id ? `/workout/${todayRoutine.id}` : '/workout')}/>)}

                {/* Quick progress snapshot section. */}
                <ProgressGallery progressPhotos={progressPhotos} measurements={measurements} onManage={() => navigate('/progress')}/>

                {/* Recently used programs section. */}
                {recentPrograms.length > 0 && (<div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2">
                                <Folder size={20} className="text-orange"/>
                                My Programs
                            </h3>
                            <button onClick={() => navigate('/programs')} className="text-sm font-semibold text-orange hover:underline">
                                See all
                            </button>
                        </div>
                        <div className="flex gap-4 pb-4 snap-x overflow-x-auto hide-scrollbar -mx-2 px-2">
                            {recentPrograms.map(program => (<div key={program.id} className="w-80 shrink-0 snap-start">
                                    <ProgramCard program={program} onClick={() => navigate(`/programs/${program.id}`)} onDelete={() => { }}/>
                                </div>))}
                        </div>
                    </div>)}

                {/* Recently used routines for one-tap workout start. */}
                {recentRoutines.length > 0 && (<div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2">
                                <Dumbbell size={20} className="text-orange"/>
                                Quick Routines
                            </h3>
                        </div>
                        <div className="flex gap-4 pb-4 snap-x overflow-x-auto hide-scrollbar -mx-2 px-2">
                            {recentRoutines.map(routine => (<div key={routine.id} className="w-72 shrink-0 snap-start">
                                    <RoutineCard routine={routine} onLog={() => navigate(routine.id ? `/workout/${routine.id}` : '/workout')} onDelete={() => { }}/>
                                </div>))}
                        </div>
                    </div>)}

                <div className="h-px bg-divider/10 w-full my-8"></div>

                {/* Bodyweight trend + recent workout feed cards. */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <WeightTrendCard weightProgress={weightProgress} currentWeight={currentWeight} startWeight={startWeight} loading={workoutsLoading}/>
                    <RecentWorkoutsCard workouts={recentWorkouts} loading={workoutsLoading}/>
                </div>

                {/* Muscle focus visualization from recent workouts. */}
                <MuscleRadarCard data={muscleData} isLoaded={isChartsLoaded}/>

                {/* Primary call-to-action when user wants to start immediately. */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-12 mb-16 px-4">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]" icon={<Play size={20} className="fill-current"/>} onClick={() => navigate('/workout')}>
                        Start Empty Workout
                    </Button>
                </div>

            </motion.div>

        </motion.div>);
}

