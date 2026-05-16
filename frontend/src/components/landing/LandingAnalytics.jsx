import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, Activity, TrendingUp } from 'lucide-react';

const LandingAnalytics = () => {
  return (
    <section id="analytics" className="py-32 bg-white dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative p-8 md:p-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-neu"
          >
            {/* Mock Analytics Dashboard */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <BarChart2 size={20} className="text-blue-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-950 dark:text-white font-display">Performance.Metric</span>
              </div>
              <div className="px-4 py-1.5 bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-600/20">
                Live Data
              </div>
            </div>

            <div className="space-y-10">
              {[
                { label: "Volume Distribution", value: "48,200kg", icon: TrendingUp, color: "blue-600" },
                { label: "Intensity Variance", value: "0.14%", icon: Activity, color: "zinc-400" },
                { label: "Frequency Heatmap", value: "Active", icon: PieChart, color: "blue-600" }
              ].map((metric, i) => (
                <div key={i} className="p-6 md:p-8 bg-zinc-100 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-neu-inset">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-blue-600 rounded-xl shadow-neu-sm">
                      <metric.icon size={18} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-display">{metric.label}</span>
                  </div>
                  <div className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter font-display mb-6">
                    {metric.value}
                  </div>
                  <div 
                    className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={i === 0 ? 75 : i === 1 ? 45 : 90}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={metric.label}
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: i === 0 ? '75%' : i === 1 ? '45%' : '90%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-[1px] bg-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 font-display">
                Advanced Telemetry
              </span>
            </div>

            <h2 className="text-6xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-[0.85] mb-10 uppercase font-display">
              Unrivaled <br />
              <span className="text-blue-600">Analytics.</span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium font-sans leading-relaxed mb-12">
              Transform every repetition into a data point. Our analytics engine decomposes your performance into granular variables, identifying bottlenecks before they limit your progress.
            </p>

            <div className="space-y-8">
              {[
                "Multi-dimensional load tracking",
                "Biomechanical efficiency scoring",
                "Neural fatigue indicators",
                "Recovery curve visualization"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-6 h-6 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>
                  <span className="text-base font-black text-zinc-950 dark:text-white uppercase tracking-widest font-display">
                    {item}
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

export default LandingAnalytics;
