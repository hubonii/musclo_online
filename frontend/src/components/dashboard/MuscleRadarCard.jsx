// Dashboard card that visualizes muscle-group balance as radar data.
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function MuscleRadarCard({ data, isLoaded }) {
return (
        <Card className="w-full flex flex-col items-center justify-center min-h-[350px]">
            <h3 className="text-lg font-bold text-text-primary self-start w-full mb-4">Muscle Split Distribution (This Month)</h3>
            <div className="w-full flex items-center justify-center relative min-h-[300px]">
                {/* Delay chart render until transformed radar data is ready. */}
                {!isLoaded ? (
                    <LoadingSpinner size="lg" message="Generating Radar..." />
                ) : (
                    // Responsive chart aspect ratio: 1.2 (mobile), 1.8 (desktop).
                    <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.2 : 1.8}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="var(--border-divider)" strokeWidth={2}/>
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}/>
                            <Radar name="Volume" dataKey="volume" stroke="var(--accent-orange)" strokeWidth={3} fill="var(--accent-orange)" fillOpacity={0.8}/>
                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', color: 'var(--text-primary)' }} cursor={{ fill: 'transparent' }}/>
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    );
}

