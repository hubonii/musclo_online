// Centralized Framer Motion presets used across pages and components.
export const MOTION = {
    spring: { type: 'spring', stiffness: 500, damping: 45, mass: 1 },
    // Snappier profile for tiny controls (toggles, chips, micro interactions).
    springSnappy: { type: 'spring', stiffness: 1000, damping: 65, mass: 0.4 },
    simple: { type: 'tween', duration: 0.12, ease: 'easeOut' },
    pageEnter: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1, ease: 'linear' },
    },
    slideUp: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
        transition: { type: 'spring', stiffness: 450, damping: 45 },
    },
    modalOverlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
    },
    modalContent: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.99 },
        transition: { type: 'spring', stiffness: 500, damping: 45 },
    },
    staggerContainer: {
        // Parent variant used when revealing card/list children one after another.
        animate: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
    },
    staggerItem: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.08, ease: 'linear' },
    },
    tapScale: { whileTap: { scale: 0.97 }, transition: { duration: 0.1 } },
    hoverLift: { whileHover: { y: -2, boxShadow: '0 8px 30px rgba(var(--emerald-rgb),0.15)' } },
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


