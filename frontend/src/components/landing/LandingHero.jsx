import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, Target, Activity, Zap } from 'lucide-react';
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


            <h1 className="text-5xl md:text-8xl font-black text-zinc-950 dark:text-white leading-[0.9] tracking-tighter mb-8 uppercase">
              Pro <br className="hidden md:block" />
              <span className="text-orange">Athletic</span> <br />
              Intelligence
            </h1>

            <p className="text-base md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mb-10 mx-auto lg:mx-0 font-medium">
              Elite-level biomechanical tracking for dedicated athletes. Experience precision that transforms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/register"
                className="group flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-orange text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 dark:hover:bg-white dark:hover:text-zinc-950 transition-all shadow-2xl shadow-orange/20"
              >
                Initialize
                <ChevronRight size={16} />
              </Link>
              <Link 
                to="/login"
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800"
              >
                Sign In
                <ArrowUpRight size={16} />
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
              className="absolute top-10 -left-6 z-20 px-3 py-2 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-950 dark:text-white italic">Core Sync</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 -right-8 z-20 px-4 py-3 bg-zinc-950 dark:bg-white shadow-2xl rounded-2xl flex flex-col"
            >
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Load</span>
              <span className="text-lg font-black text-white dark:text-zinc-950 tabular-nums">92%</span>
            </motion.div>

            {/* Smartphone Frame */}
            <div className="relative mx-auto w-full aspect-[1/2] max-h-[600px] bg-zinc-950 rounded-[48px] p-3 border-[6px] border-zinc-800/50 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-950 rounded-b-2xl z-20" />
              
              <div className="w-full h-full bg-zinc-900 rounded-[38px] overflow-hidden relative">
                {/* Mock UI */}
                <div className="p-6 pt-10">
                  <div className="flex justify-between items-center mb-10">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5" />
                    <Activity className="text-orange" size={20} />
                  </div>
                  <div className="aspect-square rounded-3xl bg-zinc-950/50 border border-white/5 flex flex-col items-center justify-center p-8">
                    <div className="w-full h-full rounded-full border-2 border-orange/20 border-dashed animate-spin-slow flex items-center justify-center">
                      <Target className="text-orange" size={32} />
                    </div>
                    <span className="mt-8 text-[10px] font-black text-orange uppercase tracking-widest">Scanning...</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-2 gap-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 rounded-2xl bg-zinc-800/50 border border-white/5" />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange/5 rounded-full blur-[80px]" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
