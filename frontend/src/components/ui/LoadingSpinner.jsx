// Reusable loading indicator with size variants and optional label.
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
};

const iconSizeMap = {
    sm: 18,
    md: 28,
    lg: 42,
    xl: 64,
};

export default function LoadingSpinner({ className, size = 'md', message, minimal = false }) {
    if (minimal) {
return (
            // Minimal mode returns spinner icon element without container markup.
            <Loader2 
                className={cn("animate-spin", className)} 
                size={iconSizeMap[size] || 20} 
                aria-hidden="true" 
            />
        );
    }

return (
        // role=status allows screen readers to announce loading context changes.
        <div className={cn("flex flex-col items-center justify-center p-4", className)} role="status" aria-label="Loading">
            <div className="relative flex items-center justify-center">
                <div className={cn(
                    "rounded-full shadow-neu-inset flex items-center justify-center bg-app", 
                    sizeMap[size]
                )}>
                    <Loader2 
                        className="animate-spin text-orange" 
                        size={iconSizeMap[size]} 
                        aria-hidden="true" 
                    />
                </div>
            </div>
            {message && (
                <p className="mt-4 text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse text-center">
                    {message}
                </p>
            )}
        </div>
    );
}

