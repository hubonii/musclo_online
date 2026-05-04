// Reusable multiline input for notes and longer text.
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
const Textarea = forwardRef(({ className, label, error, id, ...props }, ref) => {
    // Generates `id` from label text when an explicit `id` prop is not provided.
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
return (<div className="w-full">
                {label && (<label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                        {label}
                    </label>)}
                <textarea ref={ref} id={textareaId} className={cn('w-full px-5 py-3 rounded-xl bg-app text-text-primary text-base shadow-neu-inset font-black', 'placeholder:text-text-muted/60', 'focus:outline-none focus:shadow-neu-inset-focused', 'disabled:opacity-50 disabled:cursor-not-allowed', 'transition-all duration-200 resize-none', error && 'ring-2 ring-danger', className)} {...props}/>
                {/* Shared inline error style mirrors Input for visual consistency. */}
                {error && (<p className="mt-1 text-xs text-danger animate-pulse">{error}</p>)}
            </div>);
});
Textarea.displayName = 'Textarea';
export default Textarea;

