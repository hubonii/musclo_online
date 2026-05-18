import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Activity, Shield } from 'lucide-react';

const LandingMethodology = () => {
  const steps = [
    {
      title: "Diagnostic Layer",
      desc: "Initial telemetry capture to establish a baseline for your biological state.",
      icon: Activity
    },
    {
      title: "Neural Mapping",
      desc: "Processing of your unique performance patterns through our contextual engine.",
      icon: Zap
    },
    {
      title: "Protocol Synthesis",
      desc: "Generation of a precise, high-performance training protocol tailored to your state.",
      icon: Layers
    },
    {
      title: "Integrity Guard",
      desc: "Continuous monitoring to ensure structural integrity and prevent failure.",
      icon: Shield
    }
  ];

  return (
    <section id="methodology" className="py-32 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary font-sans">Scientific Precision</span>
            <div className="w-12 h-[1px] bg-primary" />
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none uppercase font-display mb-10">
            The <span className="text-primary">Protocol.</span>
          </h2>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 font-medium font-sans leading-relaxed">
            Our methodology is built on the convergence of biomechanical telemetry and neural optimization. We don't just track sets; we engineer results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 md:p-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-neu hover:shadow-neu-lg transition-all"
            >
              <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-primary mb-10 rounded-2xl shadow-neu-sm group-hover:bg-primary group-hover:text-white transition-all">
                <step.icon size={24} />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white mb-6 uppercase tracking-tighter font-display leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingMethodology;
