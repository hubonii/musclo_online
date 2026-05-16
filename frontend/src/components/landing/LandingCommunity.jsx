import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Award, MessageSquare } from 'lucide-react';

const LandingCommunity = () => {
  const stats = [
    { label: "Elite Athletes", value: "24.5K+", icon: Users },
    { label: "Global Network", value: "142 Cities", icon: Globe },
    { label: "Performance Records", value: "8.9M", icon: Award }
  ];

  return (
    <section id="community" className="py-32 bg-white dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-[1px] bg-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 font-display">
                Global Network
              </span>
            </div>

            <h2 className="text-6xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-[0.85] mb-10 uppercase font-display">
              Join the <br />
              <span className="text-blue-600">Vanguard.</span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium font-sans leading-relaxed mb-12 max-w-lg">
              Connect with a collective of dedicated performers who prioritize data over hype. Shared telemetry, competitive benchmarks, and technical collaboration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-neu-sm flex items-center gap-6">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-blue-600 rounded-2xl">
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-display mb-1">{stat.label}</div>
                    <div className="text-2xl font-black text-zinc-950 dark:text-white font-display">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-neu"
          >
            {/* Mock Chat / Community UI */}
            <div className="space-y-6" role="log" aria-label="Recent community telemetry">
              {[
                { name: "Atlas.01", msg: "Just uploaded new biomechanical baseline. Efficiency at 94.2%.", color: "blue-600" },
                { name: "Vector_Prime", msg: "Copy that. Analyzing neural sync for metabolic threshold.", color: "zinc-400" },
                { name: "Nova_Static", msg: "Record load achieved in Protocol.04. Telemetry stable.", color: "blue-600" }
              ].map((chat, i) => (
                <div key={i} className={`p-6 rounded-2xl shadow-neu-inset-focused bg-zinc-100 dark:bg-zinc-950 border border-white/5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2 h-2 rounded-full bg-${chat.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-display">{chat.name}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-950 dark:text-white font-sans leading-relaxed">
                    {chat.msg}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-12 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 flex items-center text-zinc-400 text-[10px] font-black uppercase tracking-widest shadow-neu-inset">
                Communicate...
              </div>
              <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white rounded-2xl shadow-neu-blue">
                <MessageSquare size={20} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LandingCommunity;
