'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Leaderboard Page (Ultra Premium)
//  ტოპ პროგნოზიორები — რეალური მონაცემები Supabase-დან
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  Target,
  Users,
  ChevronRight,
  Info,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
type Period = 'all' | 'month' | 'week';
type BadgeKey = 'prophet' | 'sniper' | 'streak' | 'legend' | 'champion';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string | null;
  points: number;
  accuracy: number;
  correct: number;
  total: number;
  streak: number;
  badges: BadgeKey[];
}

// ═══════════════════════════════════════════════════════════════
//  INLINE AVATAR (no external dependency)
// ═══════════════════════════════════════════════════════════════
function Avatar({
  name,
  src,
  size = 'md',
  ring = 'none',
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  ring?: 'none' | 'gold';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 lg:w-20 lg:h-20 text-xl lg:text-2xl',
  }[size];

  const ringClasses = {
    none: '',
    gold: 'ring-2 ring-gold ring-offset-2 ring-offset-ink',
  }[ring];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Color based on name hash
  const colors = [
    'from-lime to-teal',
    'from-teal to-lime',
    'from-gold to-orange-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-teal',
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover border-2 border-edge shrink-0',
          sizeClasses,
          ringClasses
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-ink border-2 border-edge shrink-0',
        colors[colorIdx],
        sizeClasses,
        ringClasses
      )}
    >
      {initials}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'ლიდერბორდი' : isRu ? 'Лидерборд' : 'Leaderboard',
    subtitle: isKa
      ? 'ტოპ პროგნოზიორები რეალურ მონაცემებზე დაყრდნობით'
      : isRu
      ? 'Лучшие прогнозисты на основе реальных данных'
      : 'Top predictors based on real data',

    allTime: isKa ? 'ყველა დრო' : isRu ? 'Всё время' : 'All time',
    thisMonth: isKa ? 'ეს თვე' : isRu ? 'Этот месяц' : 'This month',
    thisWeek: isKa ? 'ეს კვირა' : isRu ? 'Эта неделя' : 'This week',

    rank: isKa ? 'ადგილი' : isRu ? 'Место' : 'Rank',
    player: isKa ? 'მოთამაშე' : isRu ? 'Игрок' : 'Player',
    points: isKa ? 'ქულები' : isRu ? 'Очки' : 'Points',
    accuracy: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy',
    correct: isKa ? 'სწორი' : isRu ? 'Правильных' : 'Correct',
    streak: isKa ? 'სერია' : isRu ? 'Серия' : 'Streak',
    badges: isKa ? 'ბეჯები' : isRu ? 'Бейджи' : 'Badges',

    noUsers: isKa ? 'ჯერ არავინ არის ლიდერბორდზე' : isRu ? 'Пока никого нет в лидерборде' : 'No one on the leaderboard yet',
    noUsersDesc: isKa
      ? 'ლიდერბორდი ივსება რეალური მომხმარებლებით. შექმენი ანგარიში და გააკეთე პროგნოზები.'
      : isRu
      ? 'Лидерборд наполняется реальными пользователями. Создай аккаунт и делай прогнозы.'
      : 'The leaderboard fills with real users. Create an account and make predictions.',

    startPredicting: isKa ? 'დაიწყე პროგნოზირება' : isRu ? 'Начать прогнозировать' : 'Start predicting',
    signIn: isKa ? 'შესვლა' : isRu ? 'Войти' : 'Sign in',

    howPointsWork: isKa ? 'როგორ მუშაობს ქულები?' : isRu ? 'Как работают очки?' : 'How points work?',
    correctPrediction: isKa ? 'სწორი პროგნოზი' : isRu ? 'Правильный прогноз' : 'Correct prediction',
    correctPredictionDesc: isKa ? 'ყოველი სწორი პროგნოზისთვის' : isRu ? 'За каждый правильный прогноз' : 'For every correct prediction',
    drawBonus: isKa ? 'ფრის ბონუსი' : isRu ? 'Бонус за ничью' : 'Draw bonus',
    drawBonusDesc: isKa ? 'ფრის სწორად გამოცნობისთვის' : isRu ? 'За правильно угаданную ничью' : 'For correctly guessing a draw',
    streakBonus: isKa ? 'სერიის ბონუსი' : isRu ? 'Бонус серии' : 'Streak bonus',
    streakBonusDesc: isKa ? 'ზედიზედ სწორი პროგნოზებისთვის' : isRu ? 'За серию правильных прогнозов' : 'For consecutive correct predictions',
    pointsSuffix: isKa ? 'ქულა' : isRu ? 'очков' : 'pts',

    totalPlayers: isKa ? 'სულ მოთამაშე' : isRu ? 'Всего игроков' : 'Total players',
    avgAccuracy: isKa ? 'საშუალო სიზუსტე' : isRu ? 'Средняя точность' : 'Avg accuracy',
    totalPredictions: isKa ? 'სულ პროგნოზი' : isRu ? 'Всего прогнозов' : 'Total predictions',

    badgeLegendTitle: isKa ? 'ბეჯების გიდი' : isRu ? 'Гид по бейджам' : 'Badge guide',
    badgeLegendDesc: isKa ? 'განბლოკე ბეჯები აქტიური პროგნოზირებით' : isRu ? 'Разблокируй бейджи активным прогнозированием' : 'Unlock badges by active predicting',
  };
}

// ═══════════════════════════════════════════════════════════════
//  BADGE LEGEND DATA
// ═══════════════════════════════════════════════════════════════
const BADGE_LEGEND = [
  { key: 'prophet' as BadgeKey, icon: Zap, color: 'gold', reqKa: '10 ზედიზედ სწორი', reqEn: '10 correct in a row', reqRu: '10 подряд правильных' },
  { key: 'sniper' as BadgeKey, icon: Target, color: 'teal', reqKa: '80%+ სიზუსტე 20+ მატჩში', reqEn: '80%+ accuracy in 20+', reqRu: '80%+ в 20+ матчах' },
  { key: 'streak' as BadgeKey, icon: Flame, color: 'danger', reqKa: '5 ზედიზედ სწორი', reqEn: '5 correct in a row', reqRu: '5 подряд правильных' },
  { key: 'legend' as BadgeKey, icon: Award, color: 'lime', reqKa: '100+ სწორი პროგნოზი', reqEn: '100+ correct predictions', reqRu: '100+ правильных' },
  { key: 'champion' as BadgeKey, icon: Crown, color: 'gold', reqKa: 'თვის ტოპ 1', reqEn: 'Top 1 of the month', reqRu: 'Топ 1 месяца' },
];

const COLOR_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', glow: 'rgba(251,191,36,0.2)' },
  teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', glow: 'rgba(20,184,166,0.2)' },
  danger: { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', glow: 'rgba(239,68,68,0.2)' },
  lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30', glow: 'rgba(217,249,157,0.2)' },
};

// ═══════════════════════════════════════════════════════════════
//  PERIOD TABS
// ═══════════════════════════════════════════════════════════════
function PeriodTabs({
  active,
  onChange,
  locale,
}: {
  active: Period;
  onChange: (period: Period) => void;
  locale: string;
}) {
  const t = getT(locale);

  const periods = [
    { key: 'all' as Period, label: t.allTime, icon: Trophy },
    { key: 'month' as Period, label: t.thisMonth, icon: Calendar },
    { key: 'week' as Period, label: t.thisWeek, icon: Calendar },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge">
      {periods.map((period) => {
        const Icon = period.icon;
        const isActive = active === period.key;

        return (
          <button
            key={period.key}
            onClick={() => onChange(period.key)}
            className={cn(
              'flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-lime text-ink shadow-[0_0_24px_rgba(217,249,157,0.3)]'
                : 'text-muted hover:text-text hover:bg-surface-hover'
            )}
          >
            <Icon size={14} />
            <span>{period.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PODIUM
// ═══════════════════════════════════════════════════════════════
function Podium({
  users,
  locale,
}: {
  users: LeaderboardUser[];
  locale: string;
}) {
  const t = getT(locale);

  if (users.length < 3) return null;

  const [first, second, third] = users;

  const podiumConfig = [
    { user: second, position: 2, height: 'h-28 lg:h-36', bgColor: 'from-muted/40 to-muted/10', borderColor: 'border-muted/50', textColor: 'text-text', medalBg: 'bg-muted/30', medalColor: 'text-muted', delay: 0.1 },
    { user: first, position: 1, height: 'h-36 lg:h-44', bgColor: 'from-gold/30 to-gold/5', borderColor: 'border-gold/50', textColor: 'text-gold', medalBg: 'bg-gold/30', medalColor: 'text-gold', delay: 0 },
    { user: third, position: 3, height: 'h-24 lg:h-32', bgColor: 'from-[#CD7F32]/30 to-[#CD7F32]/5', borderColor: 'border-[#CD7F32]/50', textColor: 'text-[#CD7F32]', medalBg: 'bg-[#CD7F32]/30', medalColor: 'text-[#CD7F32]', delay: 0.2 },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-3xl p-6 lg:p-8 mb-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />
      <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-lime/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-3">
            <Crown size={14} className="text-gold" />
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
              Top 3
            </span>
          </div>
        </div>

        <div className="flex items-end justify-center gap-3 lg:gap-6">
          {podiumConfig.map((config) => {
            const user = config.user;
            if (!user) return null;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: config.delay }}
                className="flex flex-col items-center flex-1 max-w-[160px] lg:max-w-[200px]"
              >
                <div className="relative mb-3">
                  <Avatar
                    name={user.name}
                    src={user.avatar}
                    size="lg"
                    ring={config.position === 1 ? 'gold' : 'none'}
                  />
                  <div
                    className={cn(
                      'absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center font-bold font-mono text-xs',
                      config.medalBg,
                      config.medalColor
                    )}
                  >
                    {config.position}
                  </div>
                </div>

                <h3 className="font-heading text-sm lg:text-base font-bold text-text text-center truncate w-full mb-1">
                  {user.name}
                </h3>

                <div className={cn('font-mono text-lg lg:text-xl font-bold mb-1', config.textColor)}>
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted uppercase tracking-wider mb-3">
                  {t.pointsSuffix}
                </div>

                <div
                  className={cn(
                    'w-full rounded-t-2xl bg-gradient-to-b flex items-end justify-center pb-3 border-t border-x',
                    config.bgColor,
                    config.borderColor,
                    config.height
                  )}
                >
                  <Medal size={18} className={config.medalColor} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LEADERBOARD ROW
// ═══════════════════════════════════════════════════════════════
function LeaderboardRow({
  user,
  rank,
  locale,
  index,
}: {
  user: LeaderboardUser;
  rank: number;
  locale: string;
  index: number;
}) {
  const t = getT(locale);

  const rankConfig =
    rank === 1
      ? { color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' }
      : rank === 2
      ? { color: 'text-text', bg: 'bg-muted/10', border: 'border-muted/30' }
      : rank === 3
      ? { color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/30' }
      : { color: 'text-muted', bg: 'bg-surface-hover', border: 'border-edge' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="group relative overflow-hidden bg-gradient-to-r from-surface/60 via-surface/40 to-surface/60 backdrop-blur-xl border border-edge/70 rounded-2xl hover:border-lime/40 transition-all duration-300"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4">
        <div
          className={cn(
            'w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-bold font-mono text-sm lg:text-base shrink-0 border',
            rankConfig.bg,
            rankConfig.border,
            rankConfig.color
          )}
        >
          {rank <= 3 ? <Medal size={18} /> : rank}
        </div>

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            name={user.name}
            src={user.avatar}
            size="md"
            ring={rank === 1 ? 'gold' : 'none'}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm lg:text-base font-semibold text-text truncate group-hover:text-lime transition-colors">
              {user.name}
            </h3>

            {user.badges.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                {user.badges.slice(0, 4).map((badge) => {
                  const legend = BADGE_LEGEND.find((b) => b.key === badge);
                  if (!legend) return null;
                  const Icon = legend.icon;
                  const colorMap: Record<string, string> = {
                    gold: 'text-gold',
                    teal: 'text-teal',
                    danger: 'text-danger',
                    lime: 'text-lime',
                  };
                  return <Icon key={badge} size={11} className={colorMap[legend.color]} />;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
              {t.correct}
            </div>
            <div className="font-mono text-sm font-bold text-success">
              {user.correct}
            </div>
          </div>
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
              {t.accuracy}
            </div>
            <div className="font-mono text-sm font-bold text-teal">
              {user.accuracy}%
            </div>
          </div>
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
              {t.streak}
            </div>
            <div className="font-mono text-sm font-bold text-danger flex items-center justify-center gap-1">
              {user.streak > 0 && <Flame size={11} />}
              {user.streak}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right min-w-[80px] lg:min-w-[100px]">
          <div className="font-mono text-lg lg:text-xl font-bold text-lime">
            {user.points.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider">
            {t.pointsSuffix}
          </div>
        </div>

        <ChevronRight
          size={16}
          className="text-muted group-hover:text-lime group-hover:translate-x-0.5 transition-all shrink-0 hidden lg:block"
        />
      </div>

      <div className="lg:hidden flex items-center justify-around p-3 pt-0 border-t border-edge/40 mt-1">
        <div className="text-center">
          <div className="text-[9px] text-muted uppercase tracking-wider">{t.correct}</div>
          <div className="font-mono text-xs font-bold text-success">{user.correct}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-muted uppercase tracking-wider">{t.accuracy}</div>
          <div className="font-mono text-xs font-bold text-teal">{user.accuracy}%</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-muted uppercase tracking-wider">{t.streak}</div>
          <div className="font-mono text-xs font-bold text-danger">{user.streak}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ locale }: { locale: string }) {
  const t = getT(locale);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Trophy size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>

        <h3 className="font-heading text-xl lg:text-2xl font-bold text-text mb-3">
          {t.noUsers}
        </h3>

        <p className="text-sm text-muted leading-relaxed mb-6">
          {t.noUsersDesc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/predictions`}
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_32px_rgba(217,249,157,0.5)] transition-all"
          >
            <Target size={16} />
            <span>{t.startPredicting}</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text font-medium text-sm hover:border-lime/40 transition-all"
          >
            <Users size={16} />
            <span>{t.signIn}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BADGE LEGEND SECTION
// ═══════════════════════════════════════════════════════════════
function BadgeLegend({ locale }: { locale: string }) {
  const t = getT(locale);

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center">
          <Award size={16} className="text-ink" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-bold text-text tracking-tight">
            {t.badgeLegendTitle}
          </h2>
          <p className="text-xs lg:text-sm text-muted mt-0.5">
            {t.badgeLegendDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {BADGE_LEGEND.map((badge, i) => {
          const Icon = badge.icon;
          const c = COLOR_MAP[badge.color];
          const requirement =
            locale === 'ka' ? badge.reqKa : locale === 'ru' ? badge.reqRu : badge.reqEn;

          return (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-1',
                c.bg,
                c.border
              )}
              style={{ boxShadow: `0 0 24px ${c.glow}` }}
            >
              <div className={cn('w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
                <Icon size={20} className={c.text} strokeWidth={2} />
              </div>

              <h3 className={cn('font-heading text-xs font-bold mb-1 uppercase tracking-wider', c.text)}>
                {badge.key}
              </h3>

              <p className="text-[10px] text-muted leading-relaxed">
                {requirement}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  INFO PANEL
// ═══════════════════════════════════════════════════════════════
function InfoPanel({ locale }: { locale: string }) {
  const t = getT(locale);

  const rules = [
    { icon: Target, title: t.correctPrediction, desc: t.correctPredictionDesc, points: '10', color: 'lime' },
    { icon: BarChart3, title: t.drawBonus, desc: t.drawBonusDesc, points: '15', color: 'teal' },
    { icon: Flame, title: t.streakBonus, desc: t.streakBonusDesc, points: '5', color: 'danger' },
  ];

  return (
    <section className="mt-12 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center">
          <Info size={16} className="text-ink" strokeWidth={2.2} />
        </div>
        <h2 className="font-heading text-lg lg:text-xl font-bold text-text tracking-tight">
          {t.howPointsWork}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rules.map((rule, i) => {
          const Icon = rule.icon;
          const c = COLOR_MAP[rule.color];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', c.bg, c.border)}>
                  <Icon size={18} className={c.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-bold text-text mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-2">
                    {rule.desc}
                  </p>
                  <div className={cn('font-mono text-lg font-bold', c.text)}>
                    +{rule.points}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LeaderboardPage() {
  const locale = useLocale();
  const t = getT(locale);

  const [period, setPeriod] = useState<Period>('all');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        // TODO: Supabase query when configured
        setUsers([]);
      } catch (error) {
        console.error('Leaderboard error:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [period]);

  const hasUsers = users.length > 0;

  return (
    <div className="relative">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* HEADER */}
          <div className="pt-8 lg:pt-12 pb-8">
            <div className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">
                {locale === 'ka' ? 'მთავარი' : locale === 'ru' ? 'Главная' : 'Home'}
              </Link>
              <span className="text-muted/50">/</span>
              <span className="text-text">{t.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-4">
                  <Crown size={12} className="text-gold" />
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                    Rankings
                  </span>
                </div>

                <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.05]">
                  {t.title}
                </h1>

                <p className="mt-3 text-base lg:text-lg text-muted max-w-2xl">
                  {t.subtitle}
                </p>
              </div>

              <div className="shrink-0">
                <PeriodTabs active={period} onChange={setPeriod} locale={locale} />
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-surface/40 border border-edge/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : hasUsers ? (
            <>
              {users.length >= 3 && <Podium users={users.slice(0, 3)} locale={locale} />}
              <div className="space-y-2.5">
                {users.map((user, i) => (
                  <LeaderboardRow
                    key={user.id}
                    user={user}
                    rank={i + 1}
                    locale={locale}
                    index={i}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState locale={locale} />
          )}

          <BadgeLegend locale={locale} />
          <InfoPanel locale={locale} />
        </Container>
      </div>
    </div>
  );
}