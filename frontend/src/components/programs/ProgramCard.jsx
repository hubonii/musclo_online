// Program summary card used in program list and dashboard rails.
import { motion } from 'framer-motion';
import { Folder, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { MOTION } from '../../lib/motion';
export default function ProgramCard({ program, onClick, onDelete }) {
return (<motion.div variants={MOTION.staggerItem}>
            <Card className="p-0 overflow-hidden shadow-neu bg-surface">
                <div className="p-6 cursor-pointer hover:bg-divider/5 transition-colors" onClick={onClick}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-app shadow-neu-inset rounded-2xl flex items-center justify-center text-orange shrink-0">
                                <Folder size={24}/>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-text-primary mb-1 uppercase tracking-tight">{program.name}</h1>
                                <div className="flex items-center gap-3">
                                    {program.description && (<p className="text-xs font-medium text-text-secondary mt-1 max-w-2xl">
                                            {program.description}
                                        </p>)}
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <Badge variant="accent" className="shadow-neu-orange/10 font-black px-3 py-1 text-[10px] uppercase tracking-widest outline-none">
                                        {/* Optional chaining keeps card stable when routines are not populated yet. */}
                                        {program.routines?.length || 0} PROTOCOLS
                                    </Badge>
                                    {program.is_active && (<Badge variant="success" className="font-black border-orange/40 bg-orange/5 text-orange uppercase tracking-widest text-[9px] shadow-neu-inset px-2">
                                            ACTIVE
                                        </Badge>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={(e) => {
            // Stops parent card click handler when delete button is clicked.
            e.stopPropagation();
            onDelete(program);
        }} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-colors" type="button">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>);
}

