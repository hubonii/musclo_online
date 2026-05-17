import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Zap, Shield } from 'lucide-react';

const LandingFeatures = () => {
  const features = [
    {
      icon: Target,
      title: "Contextual Accuracy",
      description: "Proprietary biomechanical algorithms that adapt to your unique structural limitations and recovery windows."
    },
    {
      icon: Activity,
      title: "Live Diagnostics",
      description: "Real-time performance stream that interprets your metabolic response during high-intensity protocols."
    },
    {
      icon: Zap,
      title: "Neural Synergy",
      description: "Synchronization of central nervous system state with training load to prevent overreaching and optimize drive."
    },
    {
      icon: Shield,
      title: "Integrity Guard",
      description: "Automated injury prevention layer that flags technical breakdown before it results in structural failure."
    }
  ];

  return (
    <section id="systems" className="py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-primary font-display">System Architecture</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none uppercase font-display">
              Built for <br /> 
              <span className="text-primary">Peak Load.</span>
            </h2>
          </div>
          <p className="text-base md:text-xl text-zinc-500 dark:text-zinc-400 font-medium font-sans leading-relaxed max-w-lg">
            Our infrastructure is engineered to handle the telemetry of elite performers. No fluff, just raw biological data transformed into power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-primary dark:hover:border-primary relative overflow-hidden rounded-[2.5rem] shadow-neu hover:shadow-neu-lg hover:-translate-y-1 ${
                i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5'
              }`}
            >
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all rounded-2xl shadow-neu-sm group-hover:shadow-none">
                <feature.icon size={28} />
              </div>
              
              <h3 className="text-3xl font-black text-zinc-950 dark:text-white mb-6 uppercase tracking-tighter font-display leading-[0.9]">
                {feature.title}
              </h3>
              
              <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium leading-relaxed font-sans max-w-sm">
                {feature.description}
              </p>
              
              <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-display">Module.0{i + 1}</span>
                <div className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:w-16 group-hover:bg-primary transition-all" />
              </div>

              {/* Technical Detail Watermark */}
              <div className="absolute top-8 right-8 text-[8px] font-black uppercase tracking-[0.4em] text-zinc-100 dark:text-zinc-800 select-none pointer-events-none group-hover:text-primary/10 transition-colors">
                PROTO.0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
