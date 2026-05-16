import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, Target, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-700">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            {/* Technical Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/5 border border-orange/20 mb-8">
              <Zap size={12} className="text-orange animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange">
                v4.0 Protocol Active
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-zinc-950 dark:text-white leading-[0.9] tracking-tighter mb-8">
              ENGINEERED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange/70">
                TRANSFORMATION
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mb-10 leading-relaxed font-medium">
              Precision performance tracking powered by high-fidelity biomechanical data. Move beyond metrics. Experience intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register"
                className="group flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-orange text-white text-[11px] font-black uppercase tracking-[0.25em] hover:bg-zinc-950 dark:hover:bg-white dark:hover:text-zinc-950 transition-all shadow-xl shadow-orange/20"
              >
                Initialize Protocol
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/login"
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white text-[11px] font-black uppercase tracking-[0.25em] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                Access System
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Performance Stats Block */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-zinc-100 dark:border-zinc-900">
              {[
                { label: 'Latency', value: '< 12ms' },
                { label: 'Accuracy', value: '99.8%' },
                { label: 'Uptime', value: '100%' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
                    {stat.label}
                  </span>
                  <span className="text-xl font-bold text-zinc-950 dark:text-white tabular-nums">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual Column: Engineered Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative"
          >
            {/* Technical Callouts */}
            <div className="absolute -top-10 -right-4 z-20 hidden md:block">
              <div className="flex flex-col items-end">
                <div className="px-3 py-1 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[9px] font-black uppercase tracking-widest rounded-lg mb-2">
                  Biometric Engine
                </div>
                <div className="w-[1px] h-12 bg-zinc-300 dark:bg-zinc-700 mr-4" />
              </div>
            </div>

            <div className="absolute top-1/2 -left-12 z-20 hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-16 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                <div className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  Neural Sync
                </div>
              </div>
            </div>

            {/* Smartphone Frame */}
            <div className="relative mx-auto w-[280px] h-[580px] md:w-[320px] md:h-[660px] bg-zinc-950 rounded-[48px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-[6px] border-zinc-800/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 rounded-b-2xl z-20" />
              
              {/* App Screen Content */}
              <div className="w-full h-full bg-zinc-900 rounded-[36px] overflow-hidden relative border border-white/5">
                {/* Mock UI Header */}
                <div className="p-6 pt-10 flex justify-between items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5" />
                  <div className="px-3 py-1 rounded-full bg-orange/20 text-orange text-[8px] font-black uppercase tracking-widest">
                    Live Session
                  </div>
                </div>

                {/* Mock Muscle Map Visualization */}
                <div className="flex-1 px-6 mt-4">
                  <div className="aspect-[3/4] rounded-3xl bg-zinc-950/50 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                    <Activity className="text-orange/20 absolute inset-0 w-full h-full p-12" />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 rounded-full bg-orange/10 flex items-center justify-center relative"
                    >
                      <Target className="text-orange" size={40} />
                      <div className="absolute inset-0 border border-orange/30 rounded-full animate-ping" />
                    </motion.div>
                    <span className="text-[10px] font-black text-orange uppercase tracking-widest mt-8">
                      Stabilizing...
                    </span>
                  </div>
                </div>

                {/* Mock Stats Grid */}
                <div className="grid grid-cols-2 gap-4 p-6 absolute bottom-0 left-0 right-0">
                  <div className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5">
                    <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Load</div>
                    <div className="text-xl font-black text-white italic">85%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5">
                    <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1">RPE</div>
                    <div className="text-xl font-black text-white italic">09</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Orbitals */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-orange/5 rounded-full blur-[100px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
