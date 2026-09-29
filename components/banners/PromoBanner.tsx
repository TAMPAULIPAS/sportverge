'use client';

// ═══════════════════════════════════════════════════════════════
//  PromoBanner — სარეკლამო ბანერი (სოც. ქსელებისთვის)
//  ვერსიები: square (1:1), story (9:16), landscape (16:9)
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Zap, TrendingUp, Users, Globe } from 'lucide-react';

interface PromoBannerProps {
  format?: 'square' | 'story' | 'landscape';
  locale?: string;
  variant?: 'aggressive' | 'informative' | 'feature';
  className?: string;
}

const formats = {
  square: {
    container: 'aspect-square w-full max-w-[600px]',
    padding: 'p-8 lg:p-10',
    headline: 'text-4xl lg:text-5xl',
    subtitle: 'text-sm lg:text-base',
    logo: 48,
  },
  story: {
    container: 'aspect-[9/16] w-full max-w-[400px]',
    padding: 'p-6',
    headline: 'text-3xl lg:text-4xl',
    subtitle: 'text-xs lg:text-sm',
    logo: 40,
  },
  landscape: {
    container: 'aspect-[16/9] w-full max-w-[900px]',
    padding: 'p-8 lg:p-12',
    headline: 'text-3xl lg:text-5xl',
    subtitle: 'text-sm lg:text-base',
    logo: 40,
  },
};

const headlineVariants = {
  aggressive: {
    line1: 'STOP GUESSING.',
    line2: 'START PREDICTING.',
    subtitle: 'AI-powered sports insights in real-time.',
  },
  informative: {
    line1: 'THE FUTURE',
    line2: 'OF SPORTS IS HERE.',
    subtitle: 'Live analytics. Smart predictions. 3 languages.',
  },
  feature: {
    line1: 'AI PREDICTS',
    line2: 'EVERY MATCH.',
    subtitle: 'Know the odds before kickoff.',
  },
};

const features = [
  { icon: Zap, label: 'AI Predictions', sub: 'Live insights' },
  { icon: TrendingUp, label: 'Real-time Stats', sub: 'Every match' },
  { icon: Users, label: 'Fan Predictions', sub: 'Compete & win' },
  { icon: Globe, label: '3 Languages', sub: 'KA · EN · RU' },
];

export function PromoBanner({
  format = 'square',
  locale = 'ka',
  variant = 'aggressive',
  className = '',
}: PromoBannerProps) {
  const f = formats[format];
  const h = headlineVariants[variant];

  return (
    <div
      className={`relative ${f.container} ${f.padding} bg-ink border border-edge rounded-3xl overflow-hidden ${className}`}
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Background glows */}
      <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-lime/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-teal/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between">
        {/* ─── Top: Logo ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo mark — inline SVG, რომ LogoMark import არ იყოს საჭირო */}
            <svg
              width={f.logo}
              height={f.logo}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="promo-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D9F99D" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
              <path
                d="M8 12L24 40L40 12H32L24 28L16 12H8Z"
                fill="url(#promo-logo-grad)"
              />
              <circle cx="24" cy="22" r="2.5" fill="#FBBF24" />
            </svg>
            <span className="font-heading font-bold text-text text-xl lg:text-2xl tracking-tight">
              Sport<span className="text-lime">Verge</span>
            </span>
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/15 border border-danger/30">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-danger" />
            </span>
            <span className="text-[10px] lg:text-xs font-bold text-danger tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* ─── Center: Headline ─── */}
        <div className="flex-1 flex flex-col justify-center py-6 lg:py-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`font-heading font-black leading-[1.05] tracking-tight ${f.headline}`}
          >
            <span className="block text-text">{h.line1}</span>
            <span className="block text-gradient-lime-teal mt-1">{h.line2}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`mt-3 lg:mt-4 text-muted leading-relaxed max-w-lg ${f.subtitle}`}
          >
            {h.subtitle}
          </motion.p>

          {/* Feature pills — only for informative variant */}
          {variant === 'informative' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-2 lg:gap-3 mt-5 lg:mt-6"
            >
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface/60 border border-edge backdrop-blur-sm"
                  >
                    <Icon size={14} className="text-lime shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text truncate">
                        {feat.label}
                      </div>
                      <div className="text-[10px] text-muted truncate">
                        {feat.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* ─── Bottom: CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-lime text-ink font-bold text-sm lg:text-base hover:bg-lime/90 transition-all shadow-[0_0_24px_rgba(217,249,157,0.3)]">
            <Zap size={16} fill="currentColor" />
            <span>TRY IT FREE</span>
          </div>

          <span className="font-mono text-xs lg:text-sm text-muted">
            sportverge.com
          </span>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent" />
    </div>
  );
}

export default PromoBanner;