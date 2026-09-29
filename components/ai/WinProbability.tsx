'use client';

// ═══════════════════════════════════════════════════════════════
//  WinProbability — AI მოგების ალბათობა (დონატის დიაგრამა)
//  3 სეგმენტი: homeWin, draw, awayWin
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface TeamInfo {
  name: string;
  logo: string | null;
}

interface WinProbabilityProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeWin: number;
  draw: number;
  awayWin: number;
  updatedAt?: string;
}

export function WinProbability({
  homeTeam,
  awayTeam,
  homeWin,
  draw,
  awayWin,
  updatedAt,
}: WinProbabilityProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const homeArc = (homeWin / 100) * circumference;
  const drawArc = (draw / 100) * circumference;
  const awayArc = (awayWin / 100) * circumference;

  return (
    <div className="w-full bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-teal" />
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          AI Win Probability
        </span>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-between gap-4">
        {/* Home side */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {homeTeam.logo && (
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <Image
                src={homeTeam.logo}
                alt={homeTeam.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
          )}
          <div className="font-mono text-2xl lg:text-3xl font-bold text-lime">
            {homeWin}%
          </div>
          <span className="text-[10px] lg:text-xs text-muted truncate w-full text-center">
            {homeTeam.name}
          </span>
        </div>

        {/* Donut + Draw */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#D9F99D"
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? homeArc : 0} ${circumference}`}
              strokeDashoffset={0}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#475569"
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? drawArc : 0} ${circumference}`}
              strokeDashoffset={-homeArc}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' }}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#14B8A6"
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? awayArc : 0} ${circumference}`}
              strokeDashoffset={-(homeArc + drawArc)}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' }}
            />
          </svg>

          {/* Center pulse line */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
              <path
                d="M1 8 L6 8 L8 3 L11 13 L14 5 L17 11 L20 8 L31 8"
                stroke="#F8FAFC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Away side */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {awayTeam.logo && (
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <Image
                src={awayTeam.logo}
                alt={awayTeam.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
          )}
          <div className="font-mono text-2xl lg:text-3xl font-bold text-teal">
            {awayWin}%
          </div>
          <span className="text-[10px] lg:text-xs text-muted truncate w-full text-center">
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Draw info + updated */}
      <div className="mt-4 pt-4 border-t border-edge/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-disabled" />
          <span className="text-xs text-muted">ფრე {draw}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted">Updated in real-time</span>
        </div>
      </div>
    </div>
  );
}

export default WinProbability;
