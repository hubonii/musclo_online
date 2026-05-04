// Route transition wrapper for subtle page enter/exit animations.
import { motion } from 'framer-motion';

// Applies a lightweight fade transition around routed page content.
export default function PageTransition({ children }) {
    // Applies a short opacity transition for route-level content wrappers.
return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12, ease: 'easeOut' }} className="w-full h-full flex flex-col">
            {children}
        </motion.div>);
}


