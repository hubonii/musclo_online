import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Cpu, Globe, Search, Terminal } from 'lucide-react';

const DataLine = ({ label, value, progress, color = "orange" }) => (
  <div className="mb-6">
    <div className="flex justify-between items-end mb-2">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-zinc-950 dark:text-white tabular-nums">{value}</span>
    </div>
    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${progress}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className={`h-full bg-${color}`}
      />
    </div>
  </div>
);

const LandingIntelligence = () => {
  return (
    <section id="intelligence" className="py-32 bg-white dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Intelligence Visual: Lab UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative p-8 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
          >
            {/* UI Header */}
            <div className="flex items-center justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-orange" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 dark:text-white">Neural.Diagnostics</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />)}
              </div>
            </div>

            {/* Live Readouts */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <Search size={16} className="text-orange mb-4" />
                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pattern recognition</div>
                <div className="text-2xl font-black text-zinc-950 dark:text-white italic">ACTIVE</div>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <Globe size={16} className="text-orange mb-4" />
                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Network Sync</div>
                <div className="text-2xl font-black text-zinc-950 dark:text-white italic">100%</div>
              </div>
            </div>

            {/* Performance Graphs */}
            <div className="space-y-4">
              <DataLine label="Biomechanical Efficiency" value="94.2%" progress={94} />
              <DataLine label="Neuromuscular Drive" value="88.7%" progress={88} />
              <DataLine label="Recovery Acceleration" value="72.1%" progress={72} />
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange/5 rounded-full blur-[80px]" />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-orange" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">
                Contextual Engine
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-[0.95] mb-8 uppercase">
              Beyond <br />
              Standard <br />
              <span className="text-orange">Logics.</span>
            </h2>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-10">
              Musclo doesn't just record data—it interprets it. Our proprietary neural core analyzes your training history, biometric feedback, and performance curves to generate a living training protocol.
            </p>

            <div className="space-y-6">
              {[
                { icon: Activity, text: "Real-time biometric synchronization" },
                { icon: BarChart2, text: "Predictive fatigue modeling" },
                { icon: Cpu, text: "Automated protocol adjustments" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LandingIntelligence;
