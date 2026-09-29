'use client';

import { motion } from 'framer-motion';
import { Crown, Medal, Award, Flame, Target, Zap } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export type BadgeType = 'prophet' | 'sniper' | 'streak' | 'legend' | 'champion';

interface UserBadgeProps {
  name: string;
  avatarUrl?: string | null;
  rank?: number;
  points?: number;
  accuracy?: number;
  badges?: BadgeType[];
  status?: 'online' | 'offline' | 'live' | 'none';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'leaderboard' | 'compact';
  className?: string;
  animated?: boolean;
}

const badgeConfig = {
  prophet: {
    icon: Zap,
    label: 'Prophet',
    labelKa: 'წინასწარმეტყველი',
    color: 'text-gold',
    bg: 'bg-gold/15 border-gold/30',
  },
  sniper: {
    icon: Target,
    label: 'Sniper',
    labelKa: 'სნაიპერი',
    color: 'text-teal',
    bg: 'bg-teal/15 border-teal/30',
  },
  streak: {
    icon: Flame,
    label: 'Streak',
    labelKa: 'სერია',
    color: 'text-danger',
    bg: 'bg-danger/15 border-danger/30',
  },
  legend: {
    icon: Award,
    label: 'Legend',
    labelKa: 'ლეგენდა',
    color: 'text-lime',
    bg: 'bg-lime/15 border-lime/30',
  },
  champion: {
    icon: Crown,
    label: 'Champion',
    labelKa: 'ჩემპიონი',
    color: 'text-gold',
    bg: 'bg-gold/15 border-gold/30',
  },
} as const;

function RankMedal({ rank }: { rank: number }) {
  const colors = {
    1: 'from-gold to-gold/40 text-ink',
    2: 'from-muted/60 to-muted/20 text-ink',
    3: 'from-[#CD7F32] to-[#CD7F32]/40 text-ink',
  };

  const isTop3 = rank <= 3;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold font-mono shrink-0',
        'w-8 h-8 text-sm',
        isTop3
          ? `bg-gradient-to-br ${colors[rank as 1 | 2 | 3]}`
          : 'bg-surface border border-edge text-muted'
      )}
    >
      {isTop3 ? <Medal size={16} /> : rank}
    </div>
  );
}

export function UserBadge({
  name,
  avatarUrl,
  rank,
  points,
  accuracy,
  badges = [],
  status = 'none',
  size = 'md',
  variant = 'default',
  className = '',
  animated = true,
}: UserBadgeProps) {
  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {};

  if (variant === 'compact') {
    return (
      <Wrapper
        {...(wrapperProps as any)}
        className={cn('flex items-center gap-2.5 min-w-0', className)}
      >
        <Avatar
          src={avatarUrl}
          name={name}
          size="sm"
          status={status}
          ring={rank === 1 ? 'gold' : 'none'}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text truncate">{name}</div>
          {badges.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              {badges.slice(0, 3).map((badge) => {
                const cfg = badgeConfig[badge];
                const Icon = cfg.icon;
                return (
                  <Icon
                    key={badge}
                    size={12}
                    className={cfg.color}
                    aria-label={cfg.label}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Wrapper>
    );
  }

  if (variant === 'leaderboard') {
    return (
      <Wrapper
        {...(wrapperProps as any)}
        className={cn(
          'flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl',
          'bg-surface/60 border border-edge hover:border-lime/30 transition-colors',
          className
        )}
      >
        {rank !== undefined && <RankMedal rank={rank} />}

        <Avatar
          src={avatarUrl}
          name={name}
          size={size === 'lg' ? 'lg' : 'md'}
          status={status}
          ring={rank === 1 ? 'gold' : 'none'}
        />

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text truncate">{name}</div>

          {badges.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {badges.slice(0, 4).map((badge) => {
                const cfg = badgeConfig[badge];
                const Icon = cfg.icon;
                return (
                  <span
                    key={badge}
                    className={cn(
                      'inline-flex items-center justify-center w-5 h-5 rounded-full border',
                      cfg.bg
                    )}
                    title={cfg.labelKa}
                  >
                    <Icon size={11} className={cfg.color} />
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 lg:gap-4 text-right shrink-0">
          {accuracy !== undefined && (
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">
                Accuracy
              </div>
              <div className="font-mono font-bold text-teal text-sm lg:text-base">
                {accuracy}%
              </div>
            </div>
          )}
          {points !== undefined && (
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">
                Points
              </div>
              <div className="font-mono font-bold text-lime text-sm lg:text-base">
                {points}
              </div>
            </div>
          )}
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn('flex items-center gap-3', className)}
    >
      <Avatar
        src={avatarUrl}
        name={name}
        size={size}
        status={status}
        ring={rank === 1 ? 'gold' : 'none'}
      />

      <div className="min-w-0">
        <div className="font-semibold text-text truncate">{name}</div>
        {badges.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {badges.map((badge) => {
              const cfg = badgeConfig[badge];
              const Icon = cfg.icon;
              return (
                <span
                  key={badge}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium',
                    cfg.bg,
                    cfg.color
                  )}
                >
                  <Icon size={10} />
                  <span>{cfg.labelKa}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export { badgeConfig };

export default UserBadge;
