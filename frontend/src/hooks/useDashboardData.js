/**
 * Hook to compose and compute dashboard metrics from multiple data sources.
 * @returns {{
 *   workoutsLoading: boolean,
 *   allWorkouts: Array,
 *   workoutStats: Object|null,
 *   measurements: Array,
 *   progressPhotos: Array,
 *   todayRoutine: Object|null,
 *   isChartsLoaded: boolean,
 *   weightProgress: Array,
 *   muscleData: Array,
 *   weeklyVolumeData: Array,
 *   currentWeight: number,
 *   startWeight: number,
 *   weeklyVolumeSum: number,
 *   recentPrograms: Array,
 *   recentRoutines: Array
 * }} Dashboard metrics, charts data, and loading state.
 */
import { useMemo } from 'react';
import { useWorkoutHistory } from './useWorkoutHistory';
import { useWorkoutStats } from './useWorkoutStats';
import { useMeasurements } from './useMeasurements';
import { useProgressPhotos } from './useProgressPhotos';
import { useTodayRoutine } from './useTodayRoutine';
export function useDashboardData() {
    const { data: allWorkouts = [], isLoading: workoutsLoading } = useWorkoutHistory(30);
    const { data: workoutStats } = useWorkoutStats();
    const { data: measurements = [] } = useMeasurements();
    const { data: progressPhotos = [] } = useProgressPhotos();
    const { data: todayRoutine } = useTodayRoutine();
    const recentPrograms = workoutStats?.recent_programs || [];
    const recentRoutines = workoutStats?.recent_routines || [];
    const isChartsLoaded = !workoutsLoading;


    const weightProgress = useMemo(() => measurements
        .map((m) => ({
        date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weight: Number(m.weight_kg)
    }))
        .filter((m) => m.weight !== null && !isNaN(m.weight))
        .reverse(), [measurements]);

    const muscleData = useMemo(() => {
        const muscleVols = {};
        allWorkouts.forEach((w) => {
            if (w.top_muscles && w.top_muscles.length > 0) {
                w.top_muscles.forEach(m => {

                    muscleVols[m] = (muscleVols[m] || 0) + 1000;
                });
            }
            else {
                w.sets?.forEach((s) => {
                    const m = s.exercise?.muscle_group;
                    if (m && s.set_type === 'working') {
                        const weight = Number(s.weight_kg) || 0;
                        const reps = s.reps ?? 0;
                        const muscleKey = m.charAt(0).toUpperCase() + m.slice(1);
                        muscleVols[muscleKey] = (muscleVols[muscleKey] || 0) + (weight * reps);
                    }
                });
            }
        });
        const defaultMuscleData = [
            { subject: 'Chest', volume: 0 }, { subject: 'Back', volume: 0 },
            { subject: 'Legs', volume: 0 }, { subject: 'Shoulders', volume: 0 },
            { subject: 'Arms', volume: 0 }, { subject: 'Core', volume: 0 },
        ];
        const mData = Object.entries(muscleVols)
            .map(([subject, vol]) => ({ 
                subject, 
                volume: vol > 0 ? Math.max(1, Math.round(vol / 1000)) : 0 
            }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 6);
        return mData.length > 0 ? mData : defaultMuscleData;
    }, [allWorkouts]);

    const weeklyVolumeData = useMemo(() => {
        const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const today = new Date();
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            const dateStr = d.toISOString().split('T')[0];
            const dayStr = d.getDate().toString().padStart(2, '0');
            const dayWorkouts = allWorkouts.filter(w => w.started_at && w.started_at.startsWith(dateStr));
            const vol = dayWorkouts.reduce((sum, w) => sum + (Number(w.total_volume) || 0), 0);
            let jsDay = d.getDay();
            let arrDay = jsDay === 0 ? 6 : jsDay - 1;
            weekData.push({
                name: `${dayNames[arrDay]} ${dayStr}`,
                dateStr: dateStr,
                volume: Math.round(vol),
                isToday: i === 0,
            });
        }
        return weekData;
    }, [allWorkouts]);
    const currentWeight = weightProgress.length > 0 ? weightProgress[weightProgress.length - 1].weight : 0;
    const startWeight = weightProgress.length > 0 ? weightProgress[0].weight : 0;
    const weeklyVolumeSum = weeklyVolumeData.reduce((sum, d) => sum + d.volume, 0);
    return {
        workoutsLoading,
        allWorkouts,
        workoutStats,
        measurements,
        progressPhotos,
        todayRoutine,
        isChartsLoaded,
        weightProgress,
        muscleData,
        weeklyVolumeData,
        currentWeight,
        startWeight,
        weeklyVolumeSum,
        recentPrograms,
        recentRoutines
    };
}


