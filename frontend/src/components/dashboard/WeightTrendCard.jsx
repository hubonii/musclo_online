// Dashboard chart card showing bodyweight trend over time.
import React from 'react';
import Card from '../ui/Card';
import NumberTicker from '../ui/NumberTicker';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Displays current/start weight KPIs and bodyweight trend chart points.
export default function WeightTrendCard({ weightProgress, currentWeight, startWeight, loading }) {
    if (loading) {
return (
            <Card className="min-h-[350px] flex items-center justify-center p-8">
                <LoadingSpinner size="md" message="Tracking Weight Trend..." />
            </Card>
        );
    }

return (
        <Card className="min-h-[350px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    {/* Current/starting values are displayed as quick KPI context above the chart. */}
                    <p className="text-xs font-bold text-text-primary tracking-wide uppercase mb-1">CURRENT WEIGHT</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-orange">
                            <NumberTicker value={currentWeight} decimals={1}/>
                        </span>
                        <span className="text-lg font-bold text-text-muted">kg</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-text-muted tracking-wide uppercase mb-1">STARTING WEIGHT</p>
                    <p className="text-xl font-bold text-text-primary">{startWeight} kg</p>
                </div>
            </div>

            <div className="flex-1 w-full mt-4 bg-app rounded-2xl p-4 shadow-neu-inset min-h-[220px] relative">
                {/* Show a clear empty state when no bodyweight logs exist yet. */}
                {weightProgress.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-muted font-medium">No weight data logged</div>
                ) : (
                    <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.5 : 2}>
                        <AreaChart data={weightProgress}>
                            <defs>
                                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent-orange)" stopOpacity={0.4}/>
                                    <stop offset="100%" stopColor="var(--accent-orange)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide/>
                            {/* Add +/- 2kg padding so the curve doesn't stick to chart edges. */}
                            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']}/>
                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} cursor={{ stroke: 'var(--border-divider)', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                            <Area type="monotone" dataKey="weight" stroke="var(--accent-orange)" strokeWidth={4} fill="url(#weightGrad)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    );
}

