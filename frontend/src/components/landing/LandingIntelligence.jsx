import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Database } from 'lucide-react';

const LandingIntelligence = () => {
  return (
    <section id="intelligence" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* Visual Side */}
          <div className="flex-1 relative order-2 lg:order-1">
             <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative z-10"
             >
                <div className="p-8 md:p-12 bg-[#F0F0F3] rounded-[3rem] shadow-2xl">
                   <div className="flex items-center gap-4 mb-12">
                      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                         <Activity size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contextual Audit</p>
                         <p className="text-xl font-black uppercase tracking-tight text-zinc-900">Physiological Load</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {[
                        { label: 'Muscle Fatigue', value: 78, color: '#EA580C' },
                        { label: 'CNS Readiness', value: 92, color: '#22C55E' },
                        { label: 'Volume Recovery', value: 45, color: '#F59E0B' },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              <span>{stat.label}</span>
                              <span>{stat.value}%</span>
                           </div>
                           <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${stat.value}%` }}
                                transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: stat.color }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
                      <p className="text-sm font-bold text-zinc-800 mb-2 italic">"Current fatigue profile suggests prioritizing eccentric control over raw volume for this session."</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">— Musclo AI Assistant</p>
                   </div>
                </div>
             </motion.div>

             {/* Background Accents */}
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
             <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
          </div>

          {/* Text Side */}
          <div className="flex-1 order-1 lg:order-2">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EA580C] mb-4 inline-block">The Brain</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-tight text-zinc-900 mb-8">
                   Intelligence <br />
                   Built into <br />
                   <span className="text-zinc-400">the Iron.</span>
                </h2>
                
                <div className="space-y-8">
                   <div className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F0F0F3] shadow-neu flex items-center justify-center text-zinc-900">
                         <Database size={20} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black uppercase tracking-tight text-zinc-900 mb-2">Memory-First Coaching</h4>
                         <p className="text-sm text-zinc-500 leading-relaxed font-medium">Musclo remembers every set, every failure, and every RPE. It uses this history to predict your next peak.</p>
                      </div>
                   </div>

                   <div className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F0F0F3] shadow-neu flex items-center justify-center text-zinc-900">
                         <Target size={20} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black uppercase tracking-tight text-zinc-900 mb-2">Adaptive Progression</h4>
                         <p className="text-sm text-zinc-500 leading-relaxed font-medium">No more static percentages. Our engine adjusts intensity in real-time based on your session velocity.</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingIntelligence;
