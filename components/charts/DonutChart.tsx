'use client';

// TODO: DonutChart.tsx
export default function Component() {
  return null;
}
// ═══════════════════════════════════════════════════════════════
//  DonutChart — წრიული დიაგრამა (პროგნოზებისთვის, სტატისტიკისთვის)
//  ანიმაციური შევსება, მრავალსეგმენტიანი მხარდაჭერა
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  /** ცენტრში ტექსტი */
  centerLabel?: string;
  centerValue?: string;
  /** ანიმაცია */
  animated?: boolean;
  /** ცენტრის იკონი */
  centerIcon?: React.ReactNode;
  className?: string;
}

export function DonutChart({
  segments,
  size = 140,
  strokeWidth = 14,
  centerLabel,
  centerValue,
  animated = true,
  centerIcon,
  className = '',
}: DonutChartProps) {
  const [progress, setProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setProgress(1), 100);
    return () => clearTimeout(timer);
  }, [animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // სულ ჯამი (100%-ად უნდა ჩაითვალოს)
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  // თითოეული სეგმენტის რკალი
  let cumulativeOffset = 0;
  const arcs = segments.map((seg, i) => {
    const percent = seg.value / total;
    const arcLength = percent * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += arcLength;

    return {
      color: seg.color,
      dasharray: `${animated ? arcLength * progress : arcLength} ${circumference}`,
      dashoffset: -offset,
      key: i,
    };
  });

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1F2937"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
            style={{
              transition: animated
                ? 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                : undefined,
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      {(centerValue || centerLabel || centerIcon) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerIcon && <div className="mb-1">{centerIcon}</div>}
          {centerValue && (
            <span className="font-mono font-bold text-text text-xl lg:text-2xl leading-none">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
