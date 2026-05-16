import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'py-4 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-zinc-100 dark:border-zinc-800 shadow-neu' 
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="z-[110]">
          <img 
            src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} 
            alt="MUSCLO" 
            className="h-7 md:h-10 w-auto object-contain transition-all duration-500"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-10 border-r border-zinc-200 dark:border-zinc-800 pr-10">
            {['Systems', 'Intelligence', 'Methodology', 'Programs', 'Community', 'Analytics'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-black uppercase tracking-tight text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors font-display"
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">System: Active</span>
            </div>
            
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <Link 
              to="/login"
              className="px-8 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-2xl shadow-neu-blue"
            >
              Initialize
            </Link>
          </div>
        </div>


        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2 z-[110]">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Command Center */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[105] lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl flex flex-col p-6 pt-32"
          >
            <div className="flex flex-col gap-6">
              {['Systems', 'Intelligence', 'Methodology', 'Telemetry', 'Connect'].map((item, i) => (
                <motion.a 
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-5xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase font-display"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-10">
              <Link 
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full p-8 bg-blue-600 text-white text-xl font-black uppercase tracking-tighter shadow-2xl mb-4"
              >
                Initialize System
                <ArrowRight size={24} />
              </Link>
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full p-8 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white text-sm font-black uppercase tracking-widest"
              >
                Access Account
              </Link>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
