import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { MOTION } from '../../lib/motion';

export default function AuthLayout({ children }) {
    const { theme } = useThemeStore();

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-app">
            {/* Desktop-only marketing panel */}
            <div className="hidden md:flex flex-1 flex-col justify-center pl-20 pr-16 bg-surface relative overflow-hidden text-center md:text-left">
                <div className="relative z-10">
                    <img 
                        src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} 
                        alt="MUSCLO" 
                        className="h-24 lg:h-28 w-auto max-w-full object-contain mb-3 mx-auto md:mx-0"
                    />
                    <p className="text-3xl font-medium text-text-primary mb-5 leading-tight">
                        Track your progress.<br />
                        Break your limits.
                    </p>
                    <p className="text-xl text-text-secondary max-w-sm">
                        AI-powered fitness logging built for those who take training seriously.
                    </p>
                </div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald/20 blur-[100px] rounded-full mix-blend-screen opacity-50"/>
                <div className="absolute top-40 -right-20 w-80 h-80 bg-tertiary/20 blur-[100px] rounded-full mix-blend-screen opacity-50"/>
            </div>

            {/* Form panel used on all breakpoints */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
                <motion.div className="w-full max-w-sm" {...MOTION.pageEnter}>
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
