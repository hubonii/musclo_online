import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, ArrowRight } from 'lucide-react';

const LandingPrograms = () => {
  const programs = [
    {
      title: "Foundation",
      level: "Core.01",
      icon: Shield,
      stats: { load: "65%", neural: "80%" },
      desc: "Establishing biomechanical integrity and metabolic baseline."
    },
    {
      title: "Hypertrophy",
      level: "Mass.02",
      icon: Target,
      stats: { load: "85%", neural: "70%" },
      desc: "Optimized structural adaptation through high-volume load."
    },
    {
      title: "Power",
      level: "Force.03",
      icon: Zap,
      stats: { load: "95%", neural: "95%" },
      desc: "Maximum neural output and explosive force production."
    }
  ];

  return (
    <section id="programs" className="py-32 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 font-display">Engineered Protocols</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none uppercase font-display">
              Select your <br /> 
              <span className="text-blue-600">Vector.</span>
            </h2>
          </div>
          <p className="max-w-sm text-lg text-zinc-600 dark:text-zinc-400 font-medium font-sans leading-relaxed">
            Choose a training trajectory built on physiological logic. Every protocol is a precision instrument.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((prog, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 md:p-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-neu hover:shadow-neu-lg transition-all"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-blue-600 rounded-2xl shadow-neu-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <prog.icon size={28} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 font-display">{prog.level}</span>
              </div>
              
              <h3 className="text-3xl font-black text-zinc-950 dark:text-white mb-6 uppercase tracking-tighter font-display">
                {prog.title}
              </h3>
              
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed font-sans mb-10">
                {prog.desc}
              </p>

              <div className="space-y-4 mb-12">
                {Object.entries(prog.stats).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-2 font-display">
                      <span>{key} intensity</span>
                      <span>{val}</span>
                    </div>
                    <div 
                      className="h-1 w-full bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={parseInt(val)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${prog.title} ${key} intensity`}
                    >
                      <div className="h-full bg-blue-600" style={{ width: val }} />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="w-full py-5 bg-zinc-100 dark:bg-zinc-950 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-neu-sm group-hover:shadow-none font-display flex items-center justify-center gap-3"
                aria-label={`Load ${prog.title} module`}
              >
                Load Module
                <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPrograms;
