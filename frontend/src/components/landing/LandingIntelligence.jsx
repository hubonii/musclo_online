import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Cpu, Globe, Search, Terminal } from 'lucide-react';

const DataLine = ({ label, value, progress, delay = 0 }) => {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    if (typeof value === 'string' && value.includes('.')) {
      const interval = setInterval(() => {
        const num = parseFloat(value);
        const variance = num * 0.005; // 0.5% variance
        const newValue = (num + (Math.random() * variance * 2 - variance)).toFixed(1);
        setDisplayValue(newValue + (value.endsWith('%') ? '%' : ''));
      }, 2000 + Math.random() * 3000);
      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-sans">{label}</span>
        <span className="text-sm font-black text-primary font-mono tabular-nums">{displayValue}</span>
      </div>
      <div 
        className="h-[3px] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={label}
      >
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "circOut", delay }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
};

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
            className="order-2 lg:order-1 relative p-6 md:p-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden rounded-[2.5rem] shadow-neu"
          >
            {/* UI Header */}
            <div className="flex items-center justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
              <div className="flex items-center gap-4">
                <Terminal size={20} className="text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-950 dark:text-white font-sans">Neural.Diagnostics</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />)}
              </div>
            </div>

            {/* Live Readouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-12">
              <div className="p-6 bg-zinc-100 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-neu-sm">
                <Search size={18} className="text-primary mb-6" />
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 font-sans">Pattern recognition</div>
                <div className="text-3xl font-black text-zinc-950 dark:text-white font-sans">ACTIVE</div>
              </div>
              <div className="p-6 bg-zinc-100 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-neu-sm">
                <Globe size={18} className="text-primary mb-6" />
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 font-sans">Network Sync</div>
                <div className="text-3xl font-black text-zinc-950 dark:text-white font-mono italic">100%</div>
              </div>
            </div>

            {/* Performance Graphs */}
            <div className="space-y-6">
              <DataLine label="Biomechanical Efficiency" value="94.2%" progress={94} delay={0.2} />
              <DataLine label="Neuromuscular Drive" value="88.7%" progress={88} delay={0.4} />
              <DataLine label="Recovery Acceleration" value="72.1%" progress={72} delay={0.6} />
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 blur-[80px]" />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-[1px] bg-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-primary font-sans">
                Contextual Engine
              </span>
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-[0.85] mb-10 uppercase font-display">
              Beyond <br />
              Standard <br />
              <span className="text-primary">Logics.</span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium font-sans leading-relaxed mb-12">
              Musclo doesn't just record data—it interprets it. Our proprietary neural core analyzes your training history, biometric feedback, and performance curves to generate a living training protocol.
            </p>

            <div className="space-y-8">
              {[
                { icon: Activity, text: "Real-time biometric synchronization" },
                { icon: BarChart2, text: "Predictive fatigue modeling" },
                { icon: Cpu, text: "Automated protocol adjustments" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all border border-zinc-100 dark:border-zinc-800 group-hover:border-primary rounded-2xl shadow-neu-sm">
                    <item.icon size={24} />
                  </div>
                  <span className="text-base font-black text-zinc-950 dark:text-white uppercase tracking-widest font-sans">
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
