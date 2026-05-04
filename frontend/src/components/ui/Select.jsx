// Styled select/dropdown abstraction used across forms.
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
export default function Select({ value, onValueChange, options, placeholder = 'Select...', label, className, variant = 'default' }) {
    // Trigger class variants used by form, compact, and inline select layouts.
    const triggerVariants = {
        default: 'bg-surface border-divider hover:bg-surface shadow-sm',
        'neu-inset': 'bg-surface shadow-neu-inset border-none focus-within:ring-1 focus-within:ring-orange/30',
        'neu-flat': 'bg-surface shadow-neu border-none hover:shadow-neu-sm transition-colors',
        'ghost-orange': 'bg-transparent text-orange font-black border-none hover:bg-orange/5 px-1 h-auto',
        compact: 'bg-surface h-[38px] px-2 text-xs border-none shadow-neu-inset'
    };
return (<div className={className}>
            {label && (<label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-1">
                    {label}
                </label>)}
            <RadixSelect.Root value={value} onValueChange={onValueChange}>
                <RadixSelect.Trigger className={cn('inline-flex items-center justify-between w-full h-[46px] px-4 rounded-xl transition-all outline-none', 'text-text-primary text-sm font-black uppercase tracking-tight', triggerVariants[variant], 'data-[placeholder]:text-text-muted')}>
                    <RadixSelect.Value placeholder={placeholder}/>
                    <RadixSelect.Icon>
                        <ChevronDown size={variant === 'compact' ? 12 : 16} className={cn(variant === 'ghost-orange' ? "text-orange" : "text-text-muted", "ml-1")}/>
                    </RadixSelect.Icon>
                </RadixSelect.Trigger>

                <RadixSelect.Portal>
                    <RadixSelect.Content className={cn('z-[100] overflow-hidden rounded-2xl bg-surface border border-orange/10 shadow-2xl p-1.5', 'animate-in fade-in-0 zoom-in-95 duration-100 ease-out fill-mode-forwards', 'shadow-neu-orange/10')} position="popper" sideOffset={8}>
                        <RadixSelect.Viewport className="min-w-[160px]">
                            {options.map((option) => (<RadixSelect.Item key={option.value} value={option.value} className={cn('relative flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer outline-none mb-0.5 last:mb-0', 'text-text-secondary transition-all', 'hover:bg-orange/5 hover:text-orange', 'focus:bg-orange/5 focus:text-orange focus:pl-5', 'data-[state=checked]:bg-orange/10 data-[state=checked]:text-orange')}>
                                    {/* Indicator is shown only on currently selected option. */}
                                    <RadixSelect.ItemIndicator className="absolute right-3 flex items-center justify-center">
                                        <Check size={14} strokeWidth={3} className="text-orange"/>
                                    </RadixSelect.ItemIndicator>
                                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                                </RadixSelect.Item>))}
                        </RadixSelect.Viewport>
                    </RadixSelect.Content>
                </RadixSelect.Portal>
            </RadixSelect.Root>
        </div>);
}

