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
          className="max-w-5xl mx-auto p-10 md:p-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative rounded-[3.5rem] shadow-neu"
        >

          <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-10 inline-block font-display">
            Final Protocol
          </span>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-950 dark:text-white mb-10 font-display">
            Stop Guessing. <br />
            <span className="text-blue-600">Start Engineering.</span>
          </h2>
          <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-medium font-sans leading-relaxed mb-12">
            Join thousands of data-driven athletes who have moved beyond the basic workout log. Your first engineered session is waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/register"
              className="group relative px-12 py-6 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all font-display rounded-2xl shadow-neu-blue"
            >
              Initialize System
            </Link>
            <Link 
              to="/login"
              className="px-12 py-6 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-100 dark:border-zinc-800 font-black uppercase tracking-widest text-[11px] hover:border-blue-600 transition-all font-display rounded-2xl shadow-neu-sm"
            >
              Access Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] -z-0" />

    </section>
  );
};

export default LandingCTA;
