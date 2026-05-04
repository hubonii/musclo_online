// Confirmation dialog used before destructive or irreversible actions.
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION } from '../../lib/motion';
import { cn } from '../../lib/utils';
import Button from './Button';
import LoadingOverlay from './LoadingOverlay';
export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, isLoading, loadingMessage = 'Processing...', }) {
return (<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (<AlertDialog.Portal forceMount>
                        <AlertDialog.Overlay asChild>
                            <motion.div className="fixed inset-0 z-50 bg-black/90" {...MOTION.modalOverlay}/>
                        </AlertDialog.Overlay>
                        <AlertDialog.Content asChild onOpenAutoFocus={() => {
            // Preserve current focus behavior for custom buttons/inputs inside dialog.
            }}>
                            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <motion.div className={cn('w-full max-w-md pointer-events-auto relative', 'rounded-3xl bg-surface p-8 ', 'focus:outline-none border-none overflow-hidden')} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}>
                                    {/* Block repeat confirms while async action is still pending. */}
                                    {isLoading && <LoadingOverlay message={loadingMessage}/>}
                                    <AlertDialog.Title className="text-2xl font-black text-text-primary tracking-tight">
                                        {title}
                                    </AlertDialog.Title>
                                    <AlertDialog.Description className="text-base font-bold text-text-secondary mt-3 leading-relaxed">
                                        {description}
                                    </AlertDialog.Description>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <AlertDialog.Cancel asChild>
                                            <Button variant="ghost">{cancelLabel}</Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action asChild>
                                            <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
                                                {confirmLabel}
                                            </Button>
                                        </AlertDialog.Action>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>)}
            </AnimatePresence>
        </AlertDialog.Root>);
}

