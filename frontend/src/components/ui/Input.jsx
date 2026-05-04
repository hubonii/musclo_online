// Reusable text input with optional label, icon, and error state.
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
const Input = forwardRef(({ className, label, error, icon, suffix, id, ...props }, ref) => {
    // Derive a stable id from label when explicit id is not provided.
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
return (<div className="w-full">
                {label && (<label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-1.5">
                        {label}
                    </label>)}
                <div className="relative">
                    {icon && (<div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>)}
                    {/* Padding adjusts automatically when icon/suffix slots are present. */}
                    <input ref={ref} id={inputId} className={cn('w-full h-12 px-5 rounded-xl !bg-app !text-text-primary text-base shadow-neu-inset font-black', 'placeholder:text-text-muted/60', 'focus:outline-none focus:shadow-neu-inset-focused focus:!bg-app focus:!text-text-primary', 'disabled:opacity-50 disabled:cursor-not-allowed', 'transition-colors duration-100', icon && 'pl-12', suffix && 'pr-12', error && 'ring-2 ring-danger', className)} {...props}/>
                    {suffix && (<div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {suffix}
                        </div>)}
                </div>
                {error && (<p className="mt-1 text-xs text-danger animate-pulse">{error}</p>)}
            </div>);
});
Input.displayName = 'Input';
export default Input;

