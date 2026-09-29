'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Trend = 'up' | 'down' | 'neutral';
type Color = 'lime' | 'teal' | 'gold' | 'danger' | 'success';

interface StatsCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  change?: number;
  trend?: Trend;
  color?: Color;
  icon?: React.ReactNode;
  sparkline?: number[];
  animated?: boolean;
  className?: string;
}

const colorMap: Record<Color, { text: string; glow: string; stroke: string }> = {
  lime: {
    text: 'text-lime',
    glow: 'hover:border-lime/40 hover:shadow-[0_0_24px_rgba(217,249,157,0.15)]',
    stroke: '#D9F99D',
  },
  teal: {
    text: 'text-teal',
    glow: 'hover:border-teal/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.15)]',
    stroke: '#14B8A6',
  },
  gold: {
    text: 'text-gold',
    glow: 'hover:border-gold/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.15)]',
    stroke: '#FBBF24',
  },
  danger: {
    text: 'text-danger',
    glow: 'hover:border-danger/40 hover:shadow-[0_0_24px_rgba(239,68,68,0.15)]',
    stroke: '#EF4444',
  },
  success: {
    text: 'text-success',
    glow: 'hover:border-success/40 hover:shadow-[0_0_24px_rgba(34,197,94,0.15)]',
    stroke: '#22C55E',
  },
};

const trendConfig: Record<Trend, { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: 'text-success' },
  down: { icon: TrendingDown, color: 'text-danger' },
  neutral: { icon: Minus, color: 'text-muted' },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const width = 80;
  const height = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="opacity-70"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatsCard({
  label,
  value,
  suffix,
  change,
  trend = 'neutral',
  color = 'lime',
  icon,
  sparkline,
  animated = true,
  className = '',
}: StatsCardProps) {
  const c = colorMap[color];
  const t = trendConfig[trend];
  const TrendIcon = t.icon;

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn(
        'relative bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-4 lg:p-5',
        'transition-all duration-200',
        c.glow,
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          {label}
        </span>

        {icon && (
          <div
            className={cn(
              'w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center shrink-0',
              c.text
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono font-bold leading-none',
            'text-2xl lg:text-3xl',
            c.text
          )}
        >
          {value}
        </span>
        {suffix && (
          <span className="font-mono text-sm lg:text-base text-muted">
            {suffix}
          </span>
        )}
      </div>

      {(change !== undefined || sparkline) && (
        <div className="flex items-end justify-between gap-2 mt-3 pt-3 border-t border-edge/50">
          {change !== undefined && (
            <div className={cn('flex items-center gap-1', t.color)}>
              <TrendIcon size={14} />
              <span className="font-mono text-xs font-semibold">
                {change > 0 ? '+' : ''}
                {change}%
              </span>
            </div>
          )}

          {sparkline && sparkline.length > 1 && (
            <Sparkline data={sparkline} color={c.stroke} />
          )}
        </div>
      )}
    </Wrapper>
  );
}

export default StatsCard;
