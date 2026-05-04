// Sidebar summary of program composition and estimated muscle split.
import { useMemo } from 'react';
import { Activity, TrendingUp } from 'lucide-react';

// Computes lightweight aggregate stats from routines for the right-side summary panel.
export default function ProgramBreakdown({ routines, totalExercises }) {
    const { totalVolume, muscleSplit } = useMemo(() => {
        let vol = 0;
        const muscleCounts = {};
        
        routines.forEach(r => {
            (r.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(s => {
                    // Estimated set volume formula: weight x reps.
                    const sVol = (Number(s.weight_kg) || 0) * (Number(s.reps) || 0);
                    vol += sVol;
                    
                    const m = ex.muscle_group || 'Other';
                    const muscleKey = m.charAt(0).toUpperCase() + m.slice(1);
                    muscleCounts[muscleKey] = (muscleCounts[muscleKey] || 0) + 1;
                });
            });
        });

        const totalSets = Object.values(muscleCounts).reduce((a, b) => a + b, 0);
        const split = Object.entries(muscleCounts)
            .map(([name, count]) => ({
                name,
                percentage: totalSets > 0 ? Math.round((count / totalSets) * 100) : 0
            }))
            .sort((a, b) => b.percentage - a.percentage)
            // Limits chart rows to top five muscle groups by calculated percentage.
            .slice(0, 5);

        // Memo output feeds KPI cards and muscle split bars.
        return { totalVolume: vol, muscleSplit: split };
    }, [routines]);

return (
        <div className="hidden lg:flex flex-col lg:col-span-4 sticky top-24 gap-6">
            <div className="bg-surface rounded-2xl p-6 shadow-neu">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-orange" size={24}/>
                    <h2 className="text-xl font-black text-text-primary tracking-tight">Program Breakdown</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-app p-4 rounded-2xl shadow-neu-inset">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Workouts</p>
                        <p className="text-2xl font-black text-text-primary">{routines.length}</p>
                    </div>
                    <div className="bg-app p-4 rounded-2xl shadow-neu-inset">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Exercises</p>
                        <p className="text-2xl font-black text-text-primary">{totalExercises}</p>
                    </div>
                    <div className="bg-app p-4 rounded-2xl shadow-neu-inset col-span-2">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Projected Volume</p>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-orange" size={18}/>
                            <p className="text-xl font-bold text-text-primary">
                                {totalVolume > 0 ? `${totalVolume.toLocaleString()} kg` : 'No Data'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 shadow-neu">
                <h2 className="text-xl font-black text-text-primary tracking-tight mb-6">Muscle Split Distribution</h2>

                <div className="space-y-4">
                    {muscleSplit.length === 0 ? (
                        <p className="text-sm text-text-secondary text-center py-4">Add exercises to see your split</p>
                    ) : (
                        muscleSplit.map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-sm font-semibold mb-1.5">
                                    <span className="text-text-secondary">{item.name}</span>
                                    <span className="text-text-muted">{item.percentage}%</span>
                                </div>
                                <div className="w-full bg-app rounded-full h-2 shadow-neu-inset overflow-hidden">
                                    <div 
                                        className="bg-orange h-2 rounded-full shadow-[0_0_10px_rgba(var(--orange-rgb),0.5)] transition-all duration-500" 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


