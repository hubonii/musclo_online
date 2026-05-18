import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LandingCTA = () => {
  return (
    <section className="py-32 bg-white dark:bg-zinc-950 overflow-hidden relative">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-8 md:p-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative rounded-[3.5rem] shadow-neu"
        >

          <span className="text-[11px] font-black uppercase tracking-widest text-primary mb-10 inline-block font-sans">
            Final Protocol
          </span>
          <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-950 dark:text-white mb-10 font-display">
            Stop Guessing. <br />
            <span className="text-primary">Start Engineering.</span>
          </h2>
          <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-medium font-sans leading-relaxed mb-12">
            Join thousands of data-driven athletes who have moved beyond the basic workout log. Your first engineered session is waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register"
              className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-primary text-white font-bold uppercase tracking-wider text-xs md:text-sm hover:brightness-95 transition-all font-sans rounded-2xl shadow-neu-primary flex items-center justify-center"
            >
              Initialize System
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-100 dark:border-zinc-800 font-bold uppercase tracking-wider text-xs md:text-sm hover:border-primary transition-all font-sans rounded-2xl shadow-neu-sm flex items-center justify-center"
            >
              Access Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] -z-0" />

    </section>
  );
};

export default LandingCTA;
