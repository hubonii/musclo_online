import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LandingCTA = () => {
  return (
    <section className="py-32 bg-[#F0F0F3] overflow-hidden relative">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-12 md:p-20 bg-[#F0F0F3] rounded-[4rem] shadow-neu relative"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#EA580C] mb-8 inline-block">
            Ready to Begin?
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-zinc-900 mb-10">
            Stop Guessing. <br />
            <span className="text-zinc-400">Start Engineering.</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-base text-zinc-500 font-medium leading-relaxed mb-12">
            Join thousands of data-driven athletes who have moved beyond the basic workout log. Your first engineered session is waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/register"
              className="group relative px-10 py-5 bg-[#EA580C] text-white rounded-[2rem] font-bold uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-transform overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                Join the Elite <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link 
              to="/login"
              className="px-10 py-5 bg-[#F0F0F3] text-zinc-600 rounded-[2rem] font-bold uppercase tracking-widest text-sm shadow-neu hover:shadow-neu-inset transition-all"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-100/30 rounded-full blur-[120px] -z-0" />
    </section>
  );
};

export default LandingCTA;
