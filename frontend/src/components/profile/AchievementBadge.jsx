// Achievement icon tile with unlocked/locked visual state.
import { motion } from 'framer-motion';
import { Lock as LockIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
// Shows unlocked/locked achievement tile and tooltip metadata.
export default function AchievementBadge({ name, icon, description, unlocked, unlocked_at }) {
return (<Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} className={`
            relative w-full aspect-square rounded-3xl flex flex-col items-center justify-center p-2 cursor-pointer
            ${unlocked ? 'bg-app shadow-neu border border-divider' : 'bg-divider/10 shadow-neu-inset border border-transparent'}
          `}>
                    <div className={`text-4xl mb-2 ${unlocked ? 'drop-shadow-sm' : 'grayscale opacity-30'}`}>
                        {icon}
                    </div>
                    {/* Lock marker appears only for locked achievements to keep unlocked tiles cleaner. */}
                    {!unlocked && (<div className="absolute top-2 right-2 text-text-muted/50">
                            <LockIcon size={14}/>
                        </div>)}
                    <span className={`text-[10px] font-bold text-center leading-tight tracking-tight break-words line-clamp-2 ${unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                        {name}
                    </span>
                </motion.div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                {/* Tooltip panel renders metadata without increasing grid tile height. */}
                <Tooltip.Content sideOffset={8} className="bg-surface shadow-neu-lg rounded-2xl p-3 max-w-[200px] border border-divider z-50 animate-in fade-in zoom-in-95">
                    <p className="font-bold text-text-primary text-sm mb-1">{name}</p>
                    <p className="text-xs text-text-secondary leading-snug">{description}</p>
                    {/* Show earned date when available so users can track milestone progression. */}
                    {unlocked && unlocked_at && (<p className="text-[10px] font-semibold text-emerald mt-2">
                            Unlocked: {new Date(unlocked_at).toLocaleDateString()}
                        </p>)}
                    <Tooltip.Arrow className="fill-surface"/>
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>);
}


