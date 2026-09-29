'use client';

// ═══════════════════════════════════════════════════════════════
//  MatchStats — მატჩის სტატისტიკა (Shots, On Target, Corners)
//  ჰორიზონტალური ბარები — მარცხნივ home, მარჯვნივ away
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';

interface StatRowProps {
  label: string;
  homeValue: number;
  awayValue: number;
  animated?: boolean;
}

function StatRow({ label, homeValue, awayValue, animated = true }: StatRowProps) {
  const [progress, setProgress] = useState(0);
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setProgress(1), 100);
    return () => clearTimeout(timer);
  }, [animated]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs lg:text-sm">
        <span className="font-mono font-bold text-lime w-8 text-left">
          {homeValue}
        </span>
        <span className="text-muted uppercase tracking-wider text-[10px] lg:text-xs font-medium">
          {label}
        </span>
        <span className="font-mono font-bold text-teal w-8 text-right">
          {awayValue}
        </span>
      </div>

      <div className="flex items-center gap-1 h-1.5">
        <div className="flex-1 h-full bg-edge rounded-full overflow-hidden flex justify-end">
          <div
            className="h-full bg-gradient-to-l from-lime to-lime/70 rounded-full"
            style={{
              width: `${progress ? homePercent : 0}%`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        <div className="flex-1 h-full bg-edge rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal/70 to-teal rounded-full"
            style={{
              width: `${progress ? awayPercent : 0}%`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface MatchStatsProps {
  shots: { home: number; away: number };
  onTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls?: { home: number; away: number };
  yellowCards?: { home: number; away: number };
  redCards?: { home: number; away: number };
  className?: string;
}

export function MatchStats({
  shots,
  onTarget,
  corners,
  fouls,
  yellowCards,
  redCards,
  className = '',
}: MatchStatsProps) {
  return (
    <div className={`w-full bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-5 lg:p-6 ${className}`}>
      <div className="text-center mb-5">
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          Match Stats
        </span>
      </div>

      <div className="space-y-4">
        <StatRow label="Shots" homeValue={shots.home} awayValue={shots.away} />
        <StatRow label="On Target" homeValue={onTarget.home} awayValue={onTarget.away} />
        <StatRow label="Corners" homeValue={corners.home} awayValue={corners.away} />

        {fouls && (
          <StatRow label="Fouls" homeValue={fouls.home} awayValue={fouls.away} />
        )}

        {yellowCards && (
          <StatRow
            label="Yellow Cards"
            homeValue={yellowCards.home}
            awayValue={yellowCards.away}
          />
        )}

        {redCards && (
          <StatRow label="Red Cards" homeValue={redCards.home} awayValue={redCards.away} />
        )}
      </div>
    </div>
  );
}

export default MatchStats;
