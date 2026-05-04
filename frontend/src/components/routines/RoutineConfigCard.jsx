// Routine metadata form card (name, notes, and day assignment).
import Textarea from '../ui/Textarea';
// Edits routine name/notes and toggles optional day schedule value.
export default function RoutineConfigCard({ routineName, setRoutineName, notes, setNotes, dayOfWeek, setDayOfWeek }) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
return (<div className="bg-surface p-6 rounded-2xl shadow-neu flex flex-col gap-4">
            <input type="text" placeholder="Routine Name" value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="bg-app px-4 py-4 rounded-xl text-xl font-black text-text-primary border-none outline-none focus:ring-2 focus:ring-orange/30 transition-all shadow-neu-inset placeholder:text-text-muted font-display uppercase tracking-tight"/>
            <Textarea placeholder="Workout notes, focus, or cues..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px] shadow-neu-inset bg-app border-0 font-medium"/>
            <div className="flex bg-neu shadow-neu-inset rounded-2xl p-1 gap-1 overflow-x-auto scrollbar-hide shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted self-center px-4 shrink-0">Schedule</span>
                {/* Index-based day value is saved directly as `day_of_week` in routine payloads. */}
                {days.map((day, dIdx) => (<button key={day} onClick={() => setDayOfWeek(dayOfWeek === dIdx ? null : dIdx)} className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${dayOfWeek === dIdx
                ? 'bg-orange text-white shadow-neu-orange border-t border-white/20'
                : 'text-text-muted hover:text-orange hover:bg-app cursor-pointer'}`}>
                        {/* Tap selected day again to clear schedule assignment. */}
                        {day}
                    </button>))}
            </div>
        </div>);
}


