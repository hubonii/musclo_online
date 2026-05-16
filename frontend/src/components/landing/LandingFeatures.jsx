import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3, Trophy, Shield, Smartphone } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group p-8 bg-[#F0F0F3] rounded-[2rem] shadow-neu hover:shadow-neu-inset transition-all duration-500"
  >
    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#EA580C] mb-6 group-hover:scale-110 transition-transform duration-500">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-3">
      {title}
    </h3>
    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
      {description}
    </p>
  </motion.div>
);

const LandingFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: 'Contextual AI',
      description: 'The coach who knows your history. Adaptive volume and intensity based on your actual physiological recovery.',
      delay: 0.1,
    },
    {
      icon: Zap,
      title: 'Real-time Velocity',
      description: 'Track not just weights, but intent. Our system monitors rest periods and RPE for maximum hypertrophy.',
      delay: 0.2,
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Transform raw data into growth. Progressive overload visualized through proprietary fatigue-management charts.',
      delay: 0.3,
    },
    {
      icon: Trophy,
      title: 'Global Ranks',
      description: 'Gamified progression engine. Earn status through consistency, volume, and raw strength increases.',
      delay: 0.4,
    },
    {
      icon: Shield,
      title: 'Offline Sync',
      description: 'Zero data loss. Log your heaviest sets in dead zones; we sync automatically when you reconnect.',
      delay: 0.5,
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Engineered for the gym floor. Large targets, high contrast, and zero-friction logging experience.',
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#F0F0F3]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EA580C] mb-4"
          >
            The Core Engine
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900"
          >
            Smarter. Heavier. <br />
            <span className="text-zinc-400">Better.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
