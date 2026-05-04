// Reusable empty-state block with icon, message, and optional action.
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { MOTION } from '../../lib/motion';
const sizeStyles = {
    default: {
        container: 'py-16 px-6',
        icon: 'mb-4 [&>svg]:w-12 [&>svg]:h-12',
        title: 'text-lg font-semibold',
    },
    compact: {
        container: 'py-8 px-4',
        icon: 'mb-3 [&>svg]:w-8 [&>svg]:h-8',
        title: 'text-base font-semibold',
    },
};
export default function EmptyState({ icon, title, description, action, size = 'default', className }) {
    // Size preset lookup for container spacing and title/icon scale.
    const styles = sizeStyles[size];
return (<motion.div className={cn('flex flex-col items-center justify-center text-center', styles.container, className)} {...MOTION.pageEnter}>
            {icon && (<div className={cn('text-text-muted', styles.icon)}>
                    {icon}
                </div>)}
            <h3 className={cn(styles.title, 'text-text-primary mb-1')}>{title}</h3>
            {description && (<p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>)}
            {/* Action is fully custom (button/link), rendered only when caller provides it. */}
            {action && <div>{action}</div>}
        </motion.div>);
}


