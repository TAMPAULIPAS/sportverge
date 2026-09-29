'use client';

// ═══════════════════════════════════════════════════════════════
//  ScrollToTop — ღილაკი ზემოთ დაბრუნებისთვის
//  ჩნდება 400px-ის შემდეგ სქროლვისას
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  /** რამდენი პიქსელის შემდეგ გამოჩნდეს */
  threshold?: number;
  /** ჩვენების პოზიცია */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

const positions = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

export function ScrollToTop({
  threshold = 400,
  position = 'bottom-right',
  className = '',
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // შემოწმება თავიდანვე

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={`fixed z-50 w-12 h-12 rounded-full bg-lime text-ink flex items-center justify-center shadow-[0_0_24px_rgba(217,249,157,0.4)] hover:shadow-[0_0_32px_rgba(217,249,157,0.6)] transition-shadow ${positions[position]} ${className}`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTop;
