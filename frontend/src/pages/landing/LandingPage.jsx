import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingIntelligence from '../../components/landing/LandingIntelligence';
import LandingCTA from '../../components/landing/LandingCTA';
import LandingFooter from '../../components/landing/LandingFooter';

/**
 * Musclo Landing Page
 * An "Aesthetic & Organized" entrance to the Musclo platform.
 * Features: Neumorphic depth, high-contrast typography, and scientific precision.
 */
const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F3] text-zinc-900 selection:bg-orange-500/30 font-inter">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange-600 z-[1000] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <LandingNavbar />

      <main>
        {/* Hero Section: Engineering Physical Excellence */}
        <LandingHero />

        {/* Feature Grid: The Core Engine */}
        <LandingFeatures />

        {/* Intelligence Deep-Dive: AI Coach & Data */}
        <LandingIntelligence />

        {/* Final CTA: Start Transformation */}
        <LandingCTA />
      </main>

      {/* Footer: Legal & Links */}
      <LandingFooter />

      {/* Subtle Grain Overlay for Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[999] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>
    </div>
  );
};

export default LandingPage;
