'use client';

// TODO: ProgressBar.tsx
export default function Component() {
  return null;
}
// ═══════════════════════════════════════════════════════════════
//  ProgressBar — პროგრესის ზოლი (სტატისტიკა, loading)
//  ვარიანტები: default, gradient, striped, thin
//  ასევე: DualProgressBar — ორი მხარის შედარება
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'gradient' | 'striped' | 'thin';
type Color = 'lime' | 'teal' | 'gold' | 'danger' | 'success' | 'muted';

// ─────────────────────────────────────────────
// ტიპები
// ─────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: Variant;
  color?: Color;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────
// ფერების map
// ─────────────────────────────────────────────
const colorMap: Record<Color, { solid: string; gradient: string }> = {
  lime: { solid: 'bg-lime', gradient: 'bg-gradient-to-r from-lime to-teal' },
  teal: { solid: 'bg-teal', gradient: 'bg-gradient-to-r from-teal to-lime' },
  gold: { solid: 'bg-gold', gradient: 'bg-gradient-to-r from-gold to-lime' },
  danger: { solid: 'bg-danger', gradient: 'bg-gradient-to-r from-danger to-gold' },
  success: { solid: 'bg-success', gradient: 'bg-gradient-to-r from-success to-teal' },
  muted: { solid: 'bg-muted', gradient: 'bg-gradient-to-r from-muted to-muted/60' },
};

const sizes = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

// ─────────────────────────────────────────────
// ProgressBar
// ─────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  color = 'lime',
  showLabel = false,
  labelPosition = 'outside',
  size = 'md',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const [progress, setProgress] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setProgress(value);
      return;
    }
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value, animated]);

  const percent = Math.min(Math.max((progress / max) * 100, 0), 100);
  const colors = colorMap[color];
  const fillClass = variant === 'gradient' ? colors.gradient : colors.solid;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted font-medium">
            {Math.round(percent)}%
          </span>
        </div>
      )}

      <div
        className={cn(
          'relative w-full bg-edge rounded-full overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full',
            fillClass,
            variant === 'striped' &&
              'bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]'
          )}
          style={{
            width: `${percent}%`,
            transition: animated
              ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              : undefined,
          }}
        >
          {showLabel && labelPosition === 'inside' && percent > 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DualProgressBar — ორი მხარის შედარება (home vs away)
// ─────────────────────────────────────────────
interface DualProgressBarProps {
  homeValue: number;
  awayValue: number;
  homeLabel?: string;
  awayLabel?: string;
  color?: Color;
  className?: string;
}

export function DualProgressBar({
  homeValue,
  awayValue,
  homeLabel,
  awayLabel,
  color = 'lime',
  className = '',
}: DualProgressBarProps) {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  const awayPercent = (awayValue / total) * 100;

  const colors = colorMap[color];

  return (
    <div className={cn('w-full', className)}>
      {/* Values */}
      <div className="flex items-center justify-between mb-2 text-xs lg:text-sm">
        <span className="font-mono font-bold text-text">
          {homeLabel || homeValue}
        </span>
        <span className="font-mono font-bold text-text">
          {awayLabel || awayValue}
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-center gap-1 h-1.5">
        <div className="flex-1 h-full bg-edge rounded-full overflow-hidden flex justify-end">
          <div
            className={cn('h-full rounded-full', colors.solid)}
            style={{ width: `${homePercent}%` }}
          />
        </div>
        <div className="flex-1 h-full bg-edge rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-teal"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default DualProgressBar;
