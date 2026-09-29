'use client';

// ═══════════════════════════════════════════════════════════════
//  PossessionChart — ბურთის ფლობის წრიული დიაგრამა
//  მარცხნივ: გუნდი A %, მარჯვნივ: გუნდი B %
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';

interface PossessionChartProps {
  homePercent: number;
  awayPercent: number;
  homeLabel?: string;
  awayLabel?: string;
}

export function PossessionChart({
  homePercent,
  awayPercent,
  homeLabel = 'Home',
  awayLabel = 'Away',
}: PossessionChartProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(homePercent), 100);
    return () => clearTimeout(timer);
  }, [homePercent]);

  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const homeOffset = circumference - (animated / 100) * circumference;

  return (
    <div className="w-full bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-5 lg:p-6">
      <div className="text-center mb-4">
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          Possession
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-lime">
            {homePercent}%
          </div>
          <div className="text-[10px] lg:text-xs text-muted mt-1 truncate">
            {homeLabel}
          </div>
        </div>

        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#1F2937"
              strokeWidth={strokeWidth}
            />
            <defs>
              <linearGradient id="possessionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D9F99D" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#possessionGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={homeOffset}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
              <path
                d="M1 7 L5 7 L7 2 L10 12 L13 5 L16 9 L19 7 L27 7"
                stroke="#D9F99D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-teal">
            {awayPercent}%
          </div>
          <div className="text-[10px] lg:text-xs text-muted mt-1 truncate">
            {awayLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PossessionChart;
