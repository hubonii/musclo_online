import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Gauge, Cpu, Layers, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ y: -8 }}
    className="group relative p-8 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-orange/50 dark:hover:border-orange/50 transition-all duration-500 overflow-hidden"
  >
    {/* Animated Inner Accent */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-orange/5 dark:bg-orange/10 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700" />
    
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-950 dark:text-white group-hover:bg-orange group-hover:text-white transition-all duration-500 mb-8 shadow-inner">
        <Icon size={24} />
      </div>
      
      <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-4 tracking-tight uppercase">
        {title}
      </h3>
      
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
        {description}
      </p>
    </div>

    {/* Technical Detail Corner */}
    <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange">
          Active Protocol
        </span>
        <div className="w-4 h-[1px] bg-orange" />
      </div>
    </div>
  </motion.div>
);

const LandingFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: "Contextual Logic",
      description: "Neural-pattern recognition that understands your specific biomechanical limits and adapts in real-time."
    },
    {
      icon: Gauge,
      title: "Tactile Precision",
      description: "High-resolution data capture ensuring every rep, set, and rest interval is optimized for peak performance."
    },
    {
      icon: Shield,
      title: "Adaptive Safety",
      description: "Dynamic fatigue monitoring prevents overtraining by analyzing biometric trends and recovery markers."
    },
    {
      icon: Cpu,
      title: "Core Processing",
      description: "High-speed analytics engine built to handle massive data streams without latency or interruption."
    },
    {
      icon: Layers,
      title: "Modular Scaling",
      description: "Architect your training with custom protocols that evolve as your physical capabilities expand."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Direct-to-athlete communication channels providing corrective adjustments during active sets."
    }
  ];

  return (
    <section id="features" className="py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      {/* Background Typography */}
      <div className="absolute top-0 left-0 text-[20vw] font-black text-zinc-950/5 dark:text-white/5 select-none pointer-events-none -translate-x-1/4 -translate-y-1/4 uppercase">
        SYSTEM
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-12 h-[1px] bg-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">
              Capability Matrix
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none mb-6">
            CORE PROTOCOLS. <br />
            UNMATCHED CONTROL.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
