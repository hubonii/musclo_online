import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingIntelligence from '../../components/landing/LandingIntelligence';
import LandingCTA from '../../components/landing/LandingCTA';
import LandingFooter from '../../components/landing/LandingFooter';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Add smooth scroll behavior to html
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-700 font-sans selection:bg-orange selection:text-white">
      {/* Global Grain Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] dark:opacity-[0.05] contrast-150 mix-blend-multiply dark:mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange z-[110] origin-left"
        style={{ scaleX }}
      />

      {/* Core Layout */}
      <LandingNavbar />
      
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingIntelligence />
        <LandingCTA />
      </main>

      <LandingFooter />

      {/* Background Ambient Accents */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-orange/5 dark:bg-orange/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-zinc-100 dark:bg-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />
    </div>
  );
};

export default LandingPage;
