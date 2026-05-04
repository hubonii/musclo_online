// Sticky workout session header with timer, totals, and primary actions.
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import NumberTicker from '../ui/NumberTicker';
import { formatDuration } from '../../lib/utils';
// Displays active workout timer, volume summary, and finish/cancel controls.
export default function WorkoutHeader({ elapsed, totalVolume, isImperial, onCancel, onFinish }) {
return (<div className="sticky top-0 z-30 bg-surface p-4 safe-area-top shadow-neu-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" aria-label="Cancel workout">
                        <ArrowLeft size={20}/>
                    </button>
                    <div>
                        {/* Live region announces timer updates for assistive technologies. */}
                        <div className="text-lg font-bold text-text-primary tabular-nums tracking-tight" aria-live="polite" aria-label={`Duration: ${formatDuration(elapsed)}`}>
                            {formatDuration(elapsed)}
                        </div>
                        <div className="text-[11px] text-orange font-black tracking-[0.2em] uppercase">
                            Operational
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end pr-4">
                        <span className="text-[11px] text-text-muted uppercase">Total Volume</span>
                        <span className="text-sm font-semibold text-text-primary tabular-nums">
                            {/* Display in lbs when imperial mode is enabled in user settings. */}
                            <NumberTicker value={isImperial ? totalVolume * 2.20462 : totalVolume} suffix={isImperial ? ' lbs' : ' kg'}/>
                        </span>
                    </div>
                    <Button variant="primary" onClick={onFinish} className="px-6">
                        {/* Parent page handles submit validation and final save flow. */}
                        Finish
                    </Button>
                </div>
            </div>
        </div>);
}


