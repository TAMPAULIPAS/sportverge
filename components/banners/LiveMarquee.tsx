'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

interface Match {
  id: string;
  home: string;
  away: string;
  scoreHome: number | string;
  scoreAway: number | string;
  league: string;
}

interface Props {
  matches: Match[];
  locale: string;
  liveLabel: string;
}

export function LiveMarquee({ matches, locale, liveLabel }: Props) {
  if (!matches.length) return null;

  const doubled = [...matches, ...matches];

  return (
    <div className="relative border-y border-edge/70 bg-ink/80 backdrop-blur-xl overflow-hidden">
      <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-ink/90 backdrop-blur-md border border-danger/40 rounded-full px-3 py-1.5">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-75" />
          <span className="relative w-2 h-2 rounded-full bg-danger" />
        </span>
        <Radio size={11} className="text-danger" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-danger">
          {liveLabel}
        </span>
      </div>

      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: matches.length * 6,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex items-center gap-8 py-3 pl-40 whitespace-nowrap"
      >
        {doubled.map((m, i) => (
          <Link
            key={`${m.id}-${i}`}
            href={`/${locale}/matches/${m.id}`}
            className="group flex items-center gap-3 text-xs hover:text-lime transition-colors"
          >
            <span className="text-[9px] uppercase tracking-wider text-muted">
              {m.league}
            </span>
            <span className="text-text/80 font-medium">{m.home}</span>
            <span className="font-mono font-bold text-lime px-2 py-0.5 bg-lime/10 border border-lime/30 rounded">
              {m.scoreHome} - {m.scoreAway}
            </span>
            <span className="text-text/80 font-medium">{m.away}</span>
            <span className="w-1 h-1 rounded-full bg-edge" />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}