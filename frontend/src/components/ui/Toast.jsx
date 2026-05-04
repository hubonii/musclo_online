// Toast provider + hook for lightweight success/error notifications.
import { createContext, useContext, useState, useCallback } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
const ToastContext = createContext(null);
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
const icons = {
    success: <CheckCircle size={18} className="text-success"/>,
    error: <AlertCircle size={18} className="text-danger"/>,
    warning: <AlertTriangle size={18} className="text-warning"/>,
    info: <Info size={18} className="text-orange"/>,
};
export function ToastProvider({ children }) {
const [toasts, setToasts] = useState([]);
    const addToast = useCallback((type, title, description) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, title, description }]);
        // Registers a 4-second auto-dismiss timer for each toast id.
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
return (<ToastContext.Provider value={{ toast: addToast }}>
            <RadixToast.Provider swipeDirection="right" duration={4000}>
                {children}
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (<RadixToast.Root key={t.id} asChild forceMount>
                            <motion.li layout initial={{ opacity: 0, x: 100, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.9 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }} className={cn('flex items-start gap-3 rounded-xl p-4 shadow-lg border border-divider', 'bg-surface shadow-neu-sm')}>
                                <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
                                <div className="flex-1 min-w-0">
                                    <RadixToast.Title className="text-sm font-semibold text-text-primary">
                                        {t.title}
                                    </RadixToast.Title>
                                    {t.description && (<RadixToast.Description className="text-xs text-text-secondary mt-0.5">
                                            {t.description}
                                        </RadixToast.Description>)}
                                </div>
                                <RadixToast.Close onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface/50 transition-colors" aria-label="Close notification">
                                    <X size={14}/>
                                </RadixToast.Close>
                            </motion.li>
                        </RadixToast.Root>))}
                </AnimatePresence>
                {/* Fixed viewport lets toasts stack consistently across pages/layouts. */}
                <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] outline-none"/>
            </RadixToast.Provider>
        </ToastContext.Provider>);
}


