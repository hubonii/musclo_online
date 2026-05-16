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
          ? 'py-3 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50' 
          : 'py-6 bg-transparent'
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
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Intelligence'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 hover:text-orange transition-colors"
            >
              {item}
            </a>
          ))}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link 
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange dark:hover:bg-orange hover:text-white transition-all shadow-lg"
          >
            Launch App
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2 z-[110]">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950"
            onClick={() => setIsOpen(!isOpen)}
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
            className="fixed inset-0 z-[105] md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl flex flex-col p-6 pt-32"
          >
            <div className="flex flex-col gap-8">
              {['Features', 'Intelligence', 'Methodology'].map((item, i) => (
                <motion.a 
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="mt-auto pb-12">
              <Link 
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full p-6 rounded-[32px] bg-orange text-white text-lg font-black uppercase tracking-widest shadow-2xl shadow-orange/20 mb-4"
              >
                Start Now
                <ArrowRight size={24} />
              </Link>
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full p-6 rounded-[32px] bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white text-sm font-black uppercase tracking-widest"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
