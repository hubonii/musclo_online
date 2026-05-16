import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Intelligence', href: '#intelligence' },
    { name: 'Community', href: '#community' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? 'py-4 bg-[#F0F0F3]/80 backdrop-blur-md shadow-sm' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <span className="text-white font-black text-lg">M</span>
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-zinc-900">
            Musclo
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#EA580C] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            to="/login"
            className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register"
            className="px-6 py-2.5 bg-[#F0F0F3] rounded-xl text-xs font-bold uppercase tracking-widest text-[#EA580C] shadow-neu hover:shadow-neu-inset transition-all"
          >
            Join Musclo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-zinc-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#F0F0F3] border-t border-zinc-200 shadow-xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold uppercase tracking-widest text-zinc-600"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-zinc-200" />
              <div className="flex flex-col gap-4">
                <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-zinc-600">Login</Link>
                <Link to="/register" className="w-full py-4 bg-[#EA580C] text-white rounded-xl text-center font-bold uppercase tracking-widest">Join Musclo</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
