'use client';

import { useState } from 'react';

interface TeamBadgeProps {
  teamId: string;
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { px: 32, text: 'text-[10px]' },
  md: { px: 44, text: 'text-xs' },
  lg: { px: 64, text: 'text-base' },
  xl: { px: 80, text: 'text-xl' },
};

export function TeamBadge({
  teamId,
  teamName,
  size = 'md',
  className = '',
}: TeamBadgeProps) {
  const [error, setError] = useState(false);
  const s = sizes[size];
  const logo = `https://www.thesportsdb.com/images/media/team/badge/${teamId}.png`;

  if (error) {
    // Fallback: გუნდის ინიციალები
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-surface-hover to-surface border border-edge flex items-center justify-center shrink-0 ${className}`}
        style={{ width: s.px, height: s.px }}
      >
        <span className={`${s.text} font-bold text-lime`}>
          {teamName.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: s.px, height: s.px }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={teamName}
        onError={() => setError(true)}
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
      />
    </div>
  );
}

export default TeamBadge;