// Reusable button with variants, sizes, and loading state.
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { MOTION } from '../../lib/motion';
import LoadingSpinner from './LoadingSpinner';

const variantStyles = {
    primary: 'bg-orange text-white shadow-neu-sm hover:shadow-neu hover:brightness-110 active:shadow-neu-inset active:scale-95 transition-colors font-bold uppercase tracking-widest',
    secondary: 'bg-app text-text-primary shadow-neu-sm hover:shadow-neu hover:bg-surface active:shadow-neu-inset active:scale-95 transition-colors font-bold uppercase tracking-widest',
    outline: 'bg-app border border-divider/10 text-text-primary shadow-neu hover:shadow-neu-lg hover:-translate-y-0.5 active:shadow-neu-inset active:translate-y-0 font-bold',
    ghost: 'text-text-primary hover:text-text-primary hover:bg-app/50 transition-colors active:shadow-neu-inset rounded-xl font-bold',
    danger: 'bg-danger text-white shadow-neu-sm hover:shadow-neu hover:brightness-110 active:shadow-neu-inset active:scale-95 transition-colors font-bold',
};

const sizeStyles = {
    sm: 'h-[38px] px-4 text-xs font-bold uppercase tracking-wider rounded-xl gap-2',
    md: 'h-[46px] px-6 text-sm font-bold rounded-xl gap-2',
    lg: 'h-[54px] px-8 text-base font-bold rounded-xl gap-2.5',
    icon: 'h-[46px] w-[46px] rounded-xl flex items-center justify-center p-0',
};

const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
return (
        <motion.button 
            ref={ref} 
            className={cn(
                'inline-flex items-center justify-center transition-colors duration-100 relative overflow-hidden', 
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-app', 
                'disabled:opacity-50 disabled:pointer-events-none cursor-pointer', 
                variantStyles[variant], 
                sizeStyles[size], 
                className
            )} 
            disabled={disabled || isLoading} 
            {...MOTION.tapScale} 
            {...props}
        >
            {isLoading && (
                // Absolute spinner layer rendered when `isLoading` is true.
                <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                    <LoadingSpinner minimal size="sm" className="text-current" />
                </div>
            )}
            
            {/* Keep content mounted (with opacity) so button width stays stable. */}
            <span className={cn("flex items-center gap-2 transition-opacity", isLoading ? "opacity-0" : "opacity-100")}>
                {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
                {children}
            </span>
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;

