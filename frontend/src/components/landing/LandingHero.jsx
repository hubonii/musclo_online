import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';

const LandingHero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-[#EA580C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                Intelligence V2.0
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 mb-8">
                Engineer <br />
                <span className="text-zinc-400">Physical</span> <br />
                Excellence
              </h1>
              <p className="max-w-md mx-auto lg:mx-0 text-sm md:text-base text-zinc-500 leading-relaxed mb-10 font-medium">
                The world's first contextual training engine. We don't just track workouts; we engineer them using your physiological history.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="group relative px-8 py-4 bg-[#EA580C] text-white rounded-2xl font-bold uppercase tracking-widest overflow-hidden transition-transform active:scale-95 shadow-xl shadow-orange-500/20">
                  <div className="relative z-10 flex items-center gap-2 text-sm">
                    Start Transformation <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <button className="px-8 py-4 bg-[#F0F0F3] text-zinc-600 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-neu hover:shadow-neu-inset transition-all flex items-center gap-2">
                  <Play size={14} className="fill-zinc-400 text-zinc-400" /> View System
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex items-center justify-center lg:justify-start gap-12"
            >
              <div>
                <p className="text-2xl font-black text-zinc-900 leading-none">50k+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Athletes</p>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div>
                <p className="text-2xl font-black text-zinc-900 leading-none">1.2M</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Sets Logged</p>
              </div>
            </motion.div>
          </div>

          {/* Right Visual: The Device */}
          <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative z-20"
            >
              {/* CSS Phone Frame */}
              <div className="relative mx-auto w-[280px] h-[580px] bg-zinc-800 rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden p-3">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50" />
                
                {/* Mock App Content */}
                <div className="h-full w-full bg-[#F0F0F3] rounded-[2rem] overflow-hidden flex flex-col p-4">
                  <div className="mt-8 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Session Active</p>
                    <p className="text-lg font-black uppercase tracking-tight leading-tight">Leg Day <br />Hypertrophy</p>
                  </div>
                  
                  {/* Muscle Map Mockup */}
                  <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent" />
                    <div className="relative z-10 flex flex-col h-full">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Target Intensity</p>
                      <div className="flex-1 flex items-center justify-center">
                         {/* SVG Body Sketch */}
                         <svg width="120" height="200" viewBox="0 0 100 200" className="opacity-20">
                            <path d="M50 20 L30 40 L30 80 L50 100 L70 80 L70 40 Z" fill="#EA580C" />
                            <rect x="45" y="100" width="10" height="80" fill="#EA580C" />
                         </svg>
                         {/* Glowing Heatmap Spots */}
                         <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute w-12 h-12 bg-orange-500/20 blur-xl rounded-full translate-y-16" 
                         />
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Est. RPE</p>
                      <p className="text-xl font-black text-[#EA580C]">8.5</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Rest</p>
                      <p className="text-xl font-black text-zinc-900">90s</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Accents */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -right-12 top-20 p-6 bg-white rounded-2xl shadow-xl z-30"
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Play size={16} fill="currentColor" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">AI Insight</p>
                      <p className="text-sm font-bold text-zinc-800">Increase +2.5kg</p>
                   </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Background Decorative Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 opacity-20">
               <div className="absolute inset-0 rounded-full border border-zinc-300 scale-75" />
               <div className="absolute inset-0 rounded-full border border-zinc-300 scale-100" />
               <div className="absolute inset-0 rounded-full border border-zinc-200 scale-125" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
