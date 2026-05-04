// Small status/value label component.
import { cn } from '../../lib/utils';
const variantStyles = {
    default: 'bg-divider/50 text-text-secondary',
    success: 'bg-orange/10 text-orange border border-orange/10',
    warning: 'bg-orange/20 text-orange font-bold uppercase tracking-widest',
    danger: 'bg-danger/15 text-danger',
    accent: 'bg-orange text-white font-black uppercase tracking-tighter',
    outline: 'border border-divider text-text-secondary bg-transparent',
};

// Maps semantic variant name to badge color styling and renders inline label.
export default function Badge({ children, variant = 'default', className, ...props }) {
    // Variant map resolves badge color classes by status key.
return (<span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variantStyles[variant], className)} {...props}>
            {children}
        </span>);
}

