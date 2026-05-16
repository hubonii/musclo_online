import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-24">

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-24">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded-2xl shadow-lg">
                <span className="text-white font-black text-2xl font-display">M</span>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-zinc-950 dark:text-white font-display leading-none">
                Musclo
              </span>
            </Link>
            <p className="max-w-sm text-base text-zinc-500 dark:text-zinc-400 font-medium font-sans leading-relaxed">
              Engineering physical excellence through contextual intelligence and scientific precision. Developed for elite athletic performance.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-8 font-display">System</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-base font-black text-zinc-950 dark:text-white hover:text-blue-600 transition-colors uppercase font-display">Features</a></li>
              <li><a href="#intelligence" className="text-base font-black text-zinc-950 dark:text-white hover:text-blue-600 transition-colors uppercase font-display">Intelligence</a></li>
              <li><a href="#telemetry" className="text-base font-black text-zinc-950 dark:text-white hover:text-blue-600 transition-colors uppercase font-display">Telemetry</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-8 font-display">Legal</h4>
            <ul className="space-y-4">
              <li><a href="/privacy" className="text-sm font-black text-zinc-950 dark:text-white hover:text-blue-600 transition-colors uppercase font-display">Privacy</a></li>
              <li><a href="/terms" className="text-sm font-black text-zinc-950 dark:text-white hover:text-blue-600 transition-colors uppercase font-display">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-display">
            © 2026 Musclo Engine // EST 000.1
          </p>
          
          <div className="flex items-center gap-4">
            {[Github, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="p-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-blue-600 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-600 rounded-xl">
                <Icon size={24} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>

  );
};

export default LandingFooter;
