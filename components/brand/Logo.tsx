'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: number;
  showText?: boolean;
  href?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
  glow?: boolean;
  alt?: string;
}

export function Logo({
  size = 40,
  showText = true,
  href,
  rounded = 'xl',
  className = '',
  glow = false,
  alt = 'SportVerge',
}: LogoProps) {
  const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };
  const roundedClass = roundedMap[rounded];

  const glowClass = glow
    ? 'shadow-[0_0_24px_rgba(217,249,157,0.35)] ring-1 ring-lime/30'
    : 'ring-1 ring-white/10';

  const content = (
    <div className={`group inline-flex items-center gap-3 ${className}`}>
      <div
        className={`
          relative shrink-0 overflow-hidden
          bg-gradient-to-br from-lime/10 via-transparent to-teal/10
          ${roundedClass} ${glowClass}
          transition-all duration-300 ease-out
          group-hover:scale-105
          group-hover:shadow-[0_0_36px_rgba(217,249,157,0.5)]
          group-hover:ring-lime/50
        `}
        style={{ width: size, height: size }}
      >
        <Image
          src="/icons/icon.png"
          alt={alt}
          fill
          sizes={`${size}px`}
          priority
          className="object-cover object-center"
          draggable={false}
        />

        {/* Subtle inner gradient overlay */}
        <div
          className={`
            absolute inset-0 pointer-events-none
            bg-gradient-to-br from-lime/0 via-transparent to-teal/0
            group-hover:from-lime/10 group-hover:to-teal/10
            transition-all duration-300
            ${roundedClass}
          `}
          aria-hidden="true"
        />
      </div>

      {showText && (
        <span className="font-heading font-bold tracking-tight text-text text-lg lg:text-xl transition-colors duration-300 group-hover:text-lime/95">
          Sport<span className="text-lime">Verge</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink`}
        aria-label="SportVerge — მთავარი გვერდი"
      >
        {content}
      </Link>
    );
  }

  return content;
}