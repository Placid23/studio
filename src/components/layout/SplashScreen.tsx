'use client';

import { Clapperboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Particle component for the background effect
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="particle" style={style} />
);

export function SplashScreen() {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);

  // Generate particles on client-side to avoid hydration mismatch
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${Math.random() * 20 + 10}s`,
      };
      return <Particle key={i} style={style} />;
    });
    setParticles(newParticles);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] text-white"
    >
      <div className="particles">{particles}</div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        className="z-10 text-center"
      >
        <div className="shimmer inline-block">
          <Clapperboard className="h-16 w-16 md:h-24 md:w-24 text-primary" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="mt-4 text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-primary"
        >
          NovaStream
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
