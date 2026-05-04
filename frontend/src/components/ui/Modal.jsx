// Generic modal wrapper with overlay and title/description slots.
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MOTION } from '../../lib/motion';
import LoadingOverlay from './LoadingOverlay';
export default function Modal({ open, onOpenChange, title, description, children, className, showClose = true, isLoading, loadingMessage, }) {
return (<Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (<Dialog.Portal forceMount>
                        {/* Portal renders modal outside page flow while keeping enter/exit animation control. */}
                        <Dialog.Overlay asChild>
                            <motion.div className="fixed inset-0 z-50 bg-black/90" {...MOTION.modalOverlay}/>
                        </Dialog.Overlay>
                        <Dialog.Content asChild onOpenAutoFocus={() => {
            // Overrides default auto-focus handling for modal content mount.
            }}>
                            <motion.div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                 <motion.div className="w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto relative rounded-3xl bg-surface shadow-neu overflow-hidden" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.1 }}>
                                    {/* Blocks interaction while async modal actions are in progress. */}
                                    {isLoading && <LoadingOverlay message={loadingMessage}/>}
                                    
                                    {(title || showClose) && (<div className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
                                            <div>
                                                {title && (<Dialog.Title className="text-lg font-black text-text-primary tracking-tight">
                                                        {title}
                                                    </Dialog.Title>)}
                                                {description && (<Dialog.Description className="text-sm text-text-secondary mt-1">
                                                        {description}
                                                    </Dialog.Description>)}
                                            </div>
                                            {showClose && (<Dialog.Close className="rounded-2xl p-2 text-text-muted hover:text-text-primary hover:bg-divider/10 transition-all active:scale-90 shadow-neu-sm hover:shadow-neu-inset">
                                                    <X size={20}/>
                                                </Dialog.Close>)}
                                        </div>)}

                                    {!description && (<Dialog.Description className="sr-only">
                                            {title || 'Modal content'}
                                        </Dialog.Description>)}

                                    <div className={cn("flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar", className)}>
                                        {children}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>)}
            </AnimatePresence>
        </Dialog.Root>);
}


