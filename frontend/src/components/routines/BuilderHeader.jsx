// Header actions for routine builder (save/discard/navigation).
import { ChevronRight, Save, X } from 'lucide-react';
import Button from '../ui/Button';
// Shows routine breadcrumb and save/discard actions in sticky header.
export default function BuilderHeader({ programId, programName, routineName, isNew, isSaving, onSave, onDiscard, onNavigate }) {
return (<div className="sticky top-0 z-40 bg-surface w-full shadow-neu-sm p-3 md:p-4 flex items-center justify-between overflow-x-hidden safe-area-top">
            <div className="flex items-center gap-1.5 md:gap-2 text-sm font-semibold tracking-wide min-w-0">
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-text-muted cursor-pointer hover:text-orange transition-colors shrink-0" onClick={() => onNavigate('/programs')}>
                        Programs
                    </span>
                    <ChevronRight size={16} className="text-divider/40 shrink-0"/>
                    <span className="text-text-muted cursor-pointer hover:text-orange transition-colors truncate max-w-[150px]" onClick={() => onNavigate(programId === 'standalone' ? '/programs' : `/programs/${programId}`)}>
                        {/* Standalone routines return to programs list because there is no parent program page. */}
                        {programName}
                    </span>
                    <ChevronRight size={16} className="text-divider/40 shrink-0"/>
                </div>
                <span className="text-text-primary truncate font-bold text-base md:text-lg tracking-tight">{routineName || 'New Routine'}</span>
            </div>
            <div className="flex gap-2 shrink-0">
                {/* Action buttons are delegated to parent hook handlers (discard/save). */}
                <Button variant="ghost" onClick={onDiscard} className="px-3 md:px-5 font-bold text-xs uppercase tracking-widest text-text-muted hover:text-danger">
                    <span className="hidden xs:inline">Discard</span>
                    <X size={18} className="xs:hidden"/>
                </Button>
                <Button variant="primary" onClick={onSave} disabled={isSaving} className="px-4 md:px-8 font-black uppercase tracking-widest shadow-neu-orange/10 text-[10px] md:text-xs">
                    {isSaving ? '...' : (<div className="flex items-center gap-2">
                            <Save size={16} strokeWidth={3}/>
                            {/* Short labels prevent button overflow on narrow viewports. */}
                            <span className="hidden sm:inline">{isNew ? 'Save Routine' : 'Update Routine'}</span>
                            <span className="sm:hidden">{isNew ? 'Save' : 'Update'}</span>
                        </div>)}
                </Button>
            </div>
        </div>);
}


