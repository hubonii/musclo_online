// Dialog-based sheet component with bottom or right-side motion variants.
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MOTION } from '../../lib/motion';
export default function Sheet({ open, onOpenChange, title, children, side = 'bottom', className, }) {
    const isBottom = side === 'bottom';
return (<Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (<Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div className="fixed inset-0 z-50 bg-black/90" {...MOTION.modalOverlay}/>
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div className={cn('fixed z-50 bg-surface border-divider shadow-2xl focus:outline-none', isBottom
                ? 'inset-x-0 bottom-0 rounded-t-2xl border-t max-h-[90vh] overflow-y-auto'
                : 'right-0 top-0 bottom-0 w-full max-w-sm border-l', className)} drag={isBottom ? "y" : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.1} onDragEnd={(_, info) => {
                // Closes bottom sheet when drag offset or drag velocity passes threshold.
                if (isBottom && info.offset.y > 100 || info.velocity.y > 500) {
                    onOpenChange(false);
                }
            }} initial={isBottom ? { y: '100%' } : { x: '100%' }} animate={isBottom ? { y: 0 } : { x: 0 }} exit={isBottom ? { y: '100%' } : { x: '100%' }} transition={MOTION.slideUp.transition}>
                                {isBottom && (<div className="flex justify-center py-2">
                                        {/* Visual drag handle element for bottom sheet layout. */}
                                        <div className="w-10 h-1 rounded-full bg-divider"/>
                                    </div>)}

                                <div className="p-4">
                                    {title && (<div className="flex items-center justify-between mb-4">
                                            <Dialog.Title className="text-lg font-semibold text-text-primary">
                                                {title}
                                            </Dialog.Title>
                                            <Dialog.Close className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface/50 transition-colors">
                                                <X size={18}/>
                                            </Dialog.Close>
                                        </div>)}
                                    <Dialog.Description className="sr-only">
                                        {title || 'Sheet content'}
                                    </Dialog.Description>
                                    {children}
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>)}
            </AnimatePresence>
        </Dialog.Root>);
}


