/**
 * Centralized Framer Motion animation presets.
 */
export const MOTION = {
    spring: { type: 'spring', stiffness: 500, damping: 45, mass: 1 },

    springSnappy: { type: 'spring', stiffness: 1000, damping: 65, mass: 0.4 },
    simple: { type: 'tween', duration: 0.12, ease: 'easeOut' },
    pageEnter: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -5 },
        transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] },
    },
    slideUp: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
        transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
    },
    modalOverlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
    },
    modalContent: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 10 },
        transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
    },
    staggerContainer: {
        animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
    },
    staggerItem: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
    },
    tapScale: { 
        whileTap: { scale: 0.95 }, 
        whileHover: { scale: 1.02 }, 
        transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] } 
    },
    hoverLift: { 
        whileHover: { y: -4, scale: 1.01 },
        transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
    },
    successPulse: {
        animate: { scale: [1, 1.15, 1], opacity: [1, 0.8, 1] },
        transition: { duration: 0.4 },
    },
    numberTick: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 500, damping: 25 },
    },
};


