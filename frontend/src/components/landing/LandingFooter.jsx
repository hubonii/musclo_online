import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="bg-[#F0F0F3] border-t border-zinc-200/50 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-20">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-xl font-black uppercase tracking-tighter text-zinc-900">
                Musclo
              </span>
            </Link>
            <p className="max-w-xs text-sm text-zinc-500 font-medium leading-relaxed">
              Engineering physical excellence through contextual intelligence and scientific precision.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-sm font-bold text-zinc-600 hover:text-[#EA580C] transition-colors">Features</a></li>
              <li><a href="#intelligence" className="text-sm font-bold text-zinc-600 hover:text-[#EA580C] transition-colors">Intelligence</a></li>
              <li><a href="#community" className="text-sm font-bold text-zinc-600 hover:text-[#EA580C] transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="/privacy" className="text-sm font-bold text-zinc-600 hover:text-[#EA580C] transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm font-bold text-zinc-600 hover:text-[#EA580C] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200/50 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            © 2024 Musclo Engine. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="p-3 bg-white rounded-xl shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors">
              <Github size={18} />
            </a>
            <a href="#" className="p-3 bg-white rounded-xl shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="p-3 bg-white rounded-xl shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
