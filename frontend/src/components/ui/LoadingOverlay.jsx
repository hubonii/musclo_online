// Full-surface loading overlay used on top of existing content.
import { cn } from '../../lib/utils';
import LoadingSpinner from './LoadingSpinner';

// Renders a blocking overlay spinner above the current component surface.
export default function LoadingOverlay({ className, size = 'md', message }) {
return (
        <div className={cn(
            'absolute inset-0 z-10 flex flex-col items-center justify-center', 
            // Keep underlying context visible while clearly blocking interactions.
            'bg-app/80 backdrop-blur-sm rounded-[inherit]', 
            className
        )}>
            <LoadingSpinner size={size} message={message} className="p-0" />
        </div>
    );
}


