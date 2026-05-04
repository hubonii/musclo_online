// Tooltip wrapper for short contextual hints.
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
export function TooltipProvider({ children }) {
    // Tooltip provider delay is set to 300 ms.
    return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}
export default function Tooltip({ children, content, side = 'top', className }) {
return (<RadixTooltip.Root>
            <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
            <RadixTooltip.Portal>
                {/* Portal keeps tooltip above overflow/stacking contexts. */}
                <RadixTooltip.Content side={side} sideOffset={6} className={cn('z-50 px-3 py-1.5 text-xs font-medium rounded-lg', 'bg-surface text-text-primary border border-divider shadow-lg', 'animate-in fade-in-0 zoom-in-95', className)}>
                    {content}
                    <RadixTooltip.Arrow className="fill-surface"/>
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>);
}


