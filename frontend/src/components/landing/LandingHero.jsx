import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, Target, Activity, Zap, ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';

const LandingHero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-700">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >


            <h1 className="text-6xl md:text-8xl font-black text-zinc-950 dark:text-white leading-[0.85] tracking-tighter mb-8 uppercase font-display">
              Pro <br className="hidden md:block" />
              Athletic <br />
              Intelligence
            </h1>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mb-10 mx-auto lg:mx-0 font-medium font-sans leading-relaxed">
              Elite-level biomechanical tracking for dedicated athletes. Experience precision that transforms your performance through technical rawness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-zinc-950 dark:hover:bg-white dark:hover:text-zinc-950 transition-all font-display rounded-2xl shadow-lg hover:shadow-neu"
              >
                Initialize
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-3 px-10 py-5 bg-app dark:bg-zinc-900 text-zinc-950 dark:text-white text-[11px] font-black uppercase tracking-widest border border-divider font-display rounded-2xl shadow-neu-sm hover:shadow-neu transition-all"
              >
                Sign In
                <ArrowRight size={16} />
              </Link>
            </div>

          </motion.div>

          {/* Visual Column: Smartphone + Mobile HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full max-w-[320px] mx-auto lg:max-w-none"
          >
            {/* Floating Mobile HUD Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-6 z-20 px-4 py-2 bg-app dark:bg-zinc-900 border border-divider flex items-center gap-3 rounded-2xl shadow-neu-sm"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--accent-primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white font-display">System Sync</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 -right-8 z-20 px-6 py-4 bg-app dark:bg-zinc-900 shadow-neu flex flex-col rounded-3xl border border-divider"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 font-display">Core Load</span>
              <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono tabular-nums">092.4</span>
            </motion.div>

            {/* Smartphone Frame */}
            <div className="relative mx-auto w-full aspect-[1/2] max-h-[600px] bg-zinc-950 rounded-[48px] p-3 border-[6px] border-zinc-800/50 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-950 rounded-b-2xl z-20" />

              <div className="w-full h-full bg-zinc-900 rounded-[38px] overflow-hidden relative">
                {/* Mock UI */}
                <div className="p-8 pt-12">
                  <div className="flex justify-between items-center mb-12">
                    <div className="w-10 h-10 bg-zinc-800 border border-white/5 rounded-xl" />
                    <Activity className="text-primary" size={20} />
                  </div>
                  <div className="aspect-square bg-zinc-950/50 border border-white/5 flex flex-col items-center justify-center p-10 rounded-[2.5rem] shadow-neu-inset">
                    <div className="w-full h-full rounded-full border border-primary border-dashed animate-spin-slow flex items-center justify-center shadow-[0_0_30px_var(--accent-primary)]">
                      <Target className="text-primary" size={32} />
                    </div>
                    <span className="mt-10 text-[10px] font-black text-primary uppercase tracking-[0.3em] font-display">Biometry Active</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-zinc-900 border border-white/5 rounded-2xl shadow-neu-sm" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default LandingHero;
