// Base card container with consistent surface styling.
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { MOTION } from '../../lib/motion';
export default function Card({ className, hoverable, glass, children, ...props }) {
    // Base class composition shared by static and hoverable card variants.
    const baseClasses = cn('rounded-3xl border-none p-6 shadow-neu overflow-hidden', glass ? 'glass' : 'bg-neu', hoverable && 'cursor-pointer hover:shadow-neu-lg hover:-translate-y-1 active:shadow-neu-inset active:translate-y-0.5', 'transition-colors duration-100', className);
    if (hoverable) {
        // Hoverable cards opt into shared motion preset for lift/tap feedback.
return (<motion.div className={baseClasses} {...MOTION.hoverLift} {...props}>
                {children}
            </motion.div>);
    }
return (<div className={baseClasses} {...props}>
            {children}
        </div>);
}
function CardHeader({ className, ...props }) {
    return <div className={cn('flex items-center justify-between mb-3', className)} {...props}/>;
}
function CardTitle({ className, ...props }) {
    return <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}/>;
}
function CardContent({ className, ...props }) {
    return <div className={cn('', className)} {...props}/>;
}
function CardFooter({ className, ...props }) {
    return <div className={cn('flex items-center mt-4 pt-4 border-t border-divider/10', className)} {...props}/>;
}
export { CardHeader, CardTitle, CardContent, CardFooter };


