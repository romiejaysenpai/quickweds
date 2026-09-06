'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function FloatingVideoGuide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrolled > (documentHeight - windowHeight) * 0.4) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-24 right-6 z-40 hidden md:block"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative group"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <Link
          href="https://www.youtube.com/watch?v=example-quickweds-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-xl border border-border hover:border-primary transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Quick Start Video</p>
            <p className="text-xs text-text-secondary">Watch guide</p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
