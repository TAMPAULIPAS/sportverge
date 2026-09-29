'use client';

import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** გამორთვის შემთხვევაში აქცენტის წერტილს არ ეძლევა pulse glow ეფექტი */
  glow?: boolean;
}

export function LogoMark({ size = 40, className = '', glow = true }: LogoMarkProps) {
  // უნიკალური ID-ები — რომ SVG-ს ერთდროულად რამდენიმე ინსტანცია
  // (header + footer და ა.შ.) ერთმანეთს არ ეჯახებოდეს gradient/filter-ზე
  const uid = useId();
  const gradientId = `vergeGradient-${uid}`;
  const glowId = `pulseGlow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SportVerge"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D9F99D" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* V-ს მარცხენა ხაზი */}
      <path
        d="M 12 18 L 50 88"
        stroke={`url(#${gradientId})`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* V-ს მარჯვენა ხაზი */}
      <path
        d="M 88 18 L 50 88"
        stroke={`url(#${gradientId})`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* პულსის რკალები (მარცხნივ) */}
      <path
        d="M 38 42 Q 34 50 38 58"
        stroke="#14B8A6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 33 38 Q 27 50 33 62"
        stroke="#14B8A6"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* პულსის რკალები (მარჯვნივ) */}
      <path
        d="M 62 42 Q 66 50 62 58"
        stroke="#14B8A6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 67 38 Q 73 50 67 62"
        stroke="#14B8A6"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* ოქროსფერი ცენტრალური წერტილი */}
      <circle
        cx="50"
        cy="50"
        r="6"
        fill="#FBBF24"
        filter={glow ? `url(#${glowId})` : undefined}
      />
    </svg>
  );
}

export default LogoMark;