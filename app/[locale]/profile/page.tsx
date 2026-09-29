'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Profile Page (Ultra Premium)
//  მომხმარებლის პროფილი — რეალური მონაცემები, არავითარი fake
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Flame,
  Crown,
  Zap,
  Settings,
  Edit3,
  Share2,
  Bookmark,
  History,
  ChevronRight,
  Sparkles,
  Shield,
  Activity,
  Lock,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'პროფილი' : isRu ? 'Профиль' : 'Profile',
    subtitle: isKa
      ? 'შენი აქტივობა, სტატისტიკა და მიღწევები'
      : isRu
      ? 'Твоя активность, статистика и достижения'
      : 'Your activity, stats and achievements',

    // Guest state
    guestTitle: isKa ? 'სტუმარი' : isRu ? 'Гость' : 'Guest',
    guestDesc: isKa
      ? 'შედი ანგარიშზე, რომ შეინახო პროგნოზები და მიიღო ბეჯები'
      : isRu
      ? 'Войди в аккаунт, чтобы сохранять прогнозы и получать бейджи'
      : 'Sign in to save predictions and earn badges',
    signIn: isKa ? 'შესვლა' : isRu ? 'Войти' : 'Sign in',
    signUp: isKa ? 'რეგისტრაცია' : isRu ? 'Регистрация' : 'Sign up',

    // Stats
    predictions: isKa ? 'პროგნოზები' : isRu ? 'Прогнозы' : 'Predictions',
    correct: isKa ? 'სწორი' : isRu ? 'Правильных' : 'Correct',
    accuracy: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy',
    streak: isKa ? 'სერია' : isRu ? 'Серия' : 'Streak',
    points: isKa ? 'ქულები' : isRu ? 'Очки' : 'Points',
    rank: isKa ? 'ადგილი' : isRu ? 'Место' : 'Rank',

    // Sections
    badges: isKa ? 'ბეჯები' : isRu ? 'Бейджи' : 'Badges',
    badgesDesc: isKa
      ? 'მიღწევები პროგნოზებში'
      : isRu
      ? 'Достижения в прогнозах'
      : 'Achievements in predictions',

    recentActivity: isKa ? 'ბოლო აქტივობა' : isRu ? 'Последняя активность' : 'Recent activity',
    recentActivityDesc: isKa
      ? 'შენი ბოლო პროგნოზები'
      : isRu
      ? 'Твои последние прогнозы'
      : 'Your recent predictions',

    bookmarks: isKa ? 'შენახული' : isRu ? 'Сохранённые' : 'Bookmarks',
    bookmarksDesc: isKa
      ? 'სტატიები და მატჩები, რომლებიც შეინახე'
      : isRu
      ? 'Статьи и матчи, которые ты сохранил'
      : 'Articles and matches you saved',

    noBadges: isKa
      ? 'ჯერ არ გაქვს ბეჯები'
      : isRu
      ? 'У тебя пока нет бейджей'
      : "You don't have badges yet",
    noBadgesHint: isKa
      ? 'გააკეთე პროგნოზები, რომ მიიღო ბეჯები'
      : isRu
      ? 'Делай прогнозы, чтобы получать бейджи'
      : 'Make predictions to earn badges',

    noActivity: isKa
      ? 'ჯერ არ გაქვს აქტივობა'
      : isRu
      ? 'У тебя пока нет активности'
      : "You don't have activity yet",
    noActivityHint: isKa
      ? 'დაიწყე პროგნოზირება მატჩებზე'
      : isRu
      ? 'Начни прогнозировать матчи'
      : 'Start predicting matches',

    noBookmarks: isKa
      ? 'ჯერ არაფერი შენახული'
      : isRu
      ? 'Пока ничего не сохранено'
      : 'Nothing saved yet',

    editProfile: isKa ? 'პროფილის რედაქტირება' : isRu ? 'Редактировать профиль' : 'Edit profile',
    share: isKa ? 'გაზიარება' : isRu ? 'Поделиться' : 'Share',
    settings: isKa ? 'პარამეტრები' : isRu ? 'Настройки' : 'Settings',

    memberSince: isKa ? 'რეგისტრირებულია' : isRu ? 'Зарегистрирован' : 'Member since',

    // Badge names
    prophet: isKa ? 'წინასწარმეტყველი' : isRu ? 'Пророк' : 'Prophet',
    sniper: isKa ? 'სნაიპერი' : isRu ? 'Снайпер' : 'Sniper',
    streakBadge: isKa ? 'სერია' : isRu ? 'Серия' : 'Streak',
    legend: isKa ? 'ლეგენდა' : isRu ? 'Легенда' : 'Legend',
    champion: isKa ? 'ჩემპიონი' : isRu ? 'Чемпион' : 'Champion',

    unlock: isKa ? 'განბლოკვა' : isRu ? 'Разблокировать' : 'Unlock',
    comingSoon: isKa ? 'მალე' : isRu ? 'Скоро' : 'Soon',
  };
}

// ═══════════════════════════════════════════════════════════════
//  BADGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const ALL_BADGES = [
  {
    key: 'prophet',
    icon: Zap,
    color: 'gold',
    requirementKa: '10 ზედიზედ სწორი პროგნოზი',
    requirementEn: '10 correct predictions in a row',
    requirementRu: '10 правильных прогнозов подряд',
  },
  {
    key: 'sniper',
    icon: Target,
    color: 'teal',
    requirementKa: '80%+ სიზუსტე 20+ მატჩში',
    requirementEn: '80%+ accuracy in 20+ matches',
    requirementRu: '80%+ точность в 20+ матчах',
  },
  {
    key: 'streak',
    icon: Flame,
    color: 'danger',
    requirementKa: '5 ზედიზედ სწორი',
    requirementEn: '5 correct in a row',
    requirementRu: '5 правильных подряд',
  },
  {
    key: 'legend',
    icon: Award,
    color: 'lime',
    requirementKa: '100+ სწორი პროგნოზი',
    requirementEn: '100+ correct predictions',
    requirementRu: '100+ правильных прогнозов',
  },
  {
    key: 'champion',
    icon: Crown,
    color: 'gold',
    requirementKa: 'თვის ტოპ 1 პროგნოზიორი',
    requirementEn: 'Top 1 predictor of the month',
    requirementRu: 'Топ 1 прогнозист месяца',
  },
] as const;

// ═══════════════════════════════════════════════════════════════
//  STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'lime',
  delay = 0,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  color?: 'lime' | 'teal' | 'gold' | 'danger' | 'success';
  delay?: number;
}) {
  const colorMap = {
    lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30' },
    teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30' },
    gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
    danger: { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
    success: { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  };

  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-4 lg:p-5"
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30',
          c.text
        )}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          {label}
        </span>

        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
            c.bg,
            c.border,
            'border'
          )}
        >
          <Icon size={14} className={c.text} />
        </div>
      </div>

      <div className={cn('font-mono text-2xl lg:text-3xl font-bold', c.text)}>
        {value}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════
function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: typeof Trophy;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-2xl p-8 lg:p-12 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Icon size={24} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <p className="text-sm lg:text-base text-muted font-medium">{title}</p>
        {hint && <p className="mt-1.5 text-xs text-muted/70">{hint}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BADGE CARD
// ═══════════════════════════════════════════════════════════════
function BadgeCard({
  badge,
  unlocked,
  locale,
  delay = 0,
}: {
  badge: typeof ALL_BADGES[number];
  unlocked: boolean;
  locale: string;
  delay?: number;
}) {
  const Icon = badge.icon;
  const t = getT(locale);

  const colorMap = {
    gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', glow: 'rgba(251,191,36,0.4)' },
    teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', glow: 'rgba(20,184,166,0.4)' },
    danger: { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', glow: 'rgba(239,68,68,0.4)' },
    lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30', glow: 'rgba(217,249,157,0.4)' },
  };

  const c = colorMap[badge.color as keyof typeof colorMap];
  const badgeName = t[badge.key as keyof typeof t] as string;
  const requirement =
    locale === 'ka'
      ? badge.requirementKa
      : locale === 'ru'
      ? badge.requirementRu
      : badge.requirementEn;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-300',
        unlocked
          ? cn(c.bg, c.border, 'border')
          : 'bg-surface/40 border border-edge/60 opacity-50 grayscale'
      )}
      style={
        unlocked
          ? {
              boxShadow: `0 0 32px ${c.glow}`,
            }
          : undefined
      }
    >
      {/* Glow effect */}
      {unlocked && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40"
          style={{ background: c.glow }}
        />
      )}

      <div className="relative">
        <div
          className={cn(
            'w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center',
            unlocked ? c.bg : 'bg-surface-hover',
            'border',
            unlocked ? c.border : 'border-edge'
          )}
        >
          <Icon size={24} className={unlocked ? c.text : 'text-muted'} strokeWidth={2} />
        </div>

        <h3
          className={cn(
            'font-heading text-sm font-bold mb-1',
            unlocked ? c.text : 'text-muted'
          )}
        >
          {badgeName}
        </h3>

        <p className="text-[10px] text-muted leading-relaxed">{requirement}</p>

        {!unlocked && (
          <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-bold text-muted uppercase tracking-wider">
            <Lock size={10} />
            <span>{t.unlock}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════
function Section({
  icon: Icon,
  title,
  description,
  action,
  children,
  delay = 0,
}: {
  icon: typeof Trophy;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center shrink-0">
            <Icon size={16} className="text-ink" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-lg lg:text-xl font-bold text-text tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs lg:text-sm text-muted mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children}
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const locale = useLocale();
  const t = getT(locale);

  // ─── Guest state (მოგვიანებით Supabase Auth-ით შეიცვლება) ───
  const [user] = useState<{
    name: string | null;
    email: string | null;
    avatar: string | null;
    createdAt: string | null;
  }>({
    name: null,
    email: null,
    avatar: null,
    createdAt: null,
  });

  const isGuest = !user.email;

  // ─── Stats (empty — მოგვიანებით Supabase-დან) ───
  const stats = {
    predictions: 0,
    correct: 0,
    accuracy: 0,
    streak: 0,
    points: 0,
    rank: null as number | null,
  };

  const hasStats = stats.predictions > 0;
  const unlockedBadges: string[] = [];

  return (
    <div className="relative">
      {/* ═══ Ambient background ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════ */}
          <div className="pt-8 lg:pt-12 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 mb-4">
              <Sparkles size={12} className="text-lime" />
              <span className="text-[10px] font-bold text-lime uppercase tracking-widest">
                SportVerge
              </span>
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-text tracking-tight leading-[1.05]">
              {t.title}
            </h1>

            <p className="mt-3 text-sm lg:text-base text-muted max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════
              GUEST OR USER PROFILE CARD
          ═══════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-3xl p-6 lg:p-8 mb-6"
          >
            {/* Top gradient */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

            {/* Corner glows */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  src={user.avatar}
                  name={user.name || t.guestTitle}
                  size="xl"
                  ring="lime"
                />
                {isGuest && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink border-2 border-edge flex items-center justify-center">
                    <Lock size={12} className="text-muted" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h2 className="font-heading text-2xl lg:text-3xl font-bold text-text truncate">
                    {user.name || t.guestTitle}
                  </h2>
                  {!isGuest && (
                    <Badge variant="lime" size="sm">
                      <Shield size={10} className="mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {user.email ? (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted mb-1">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted max-w-md mx-auto lg:mx-0 mb-4">
                    {t.guestDesc}
                  </p>
                )}

                {user.createdAt && (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-muted/70">
                    <Calendar size={12} />
                    <span>
                      {t.memberSince}{' '}
                      {new Date(user.createdAt).toLocaleDateString(
                        locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </span>
                  </div>
                )}

                {/* Guest CTAs */}
                {isGuest && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
                    <Link
                      href={`/${locale}/login`}
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_24px_rgba(217,249,157,0.5)] transition-all"
                    >
                      <User size={16} />
                      <span>{t.signIn}</span>
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </Link>

                    <Link
                      href={`/${locale}/register`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text font-medium text-sm hover:border-lime/40 transition-all"
                    >
                      <Sparkles size={16} />
                      <span>{t.signUp}</span>
                    </Link>
                  </div>
                )}

                {/* User actions */}
                {!isGuest && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-5">
                    <Button size="sm" leftIcon={<Edit3 size={14} />}>
                      {t.editProfile}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Share2 size={14} />}
                    >
                      {t.share}
                    </Button>
                    <Link href={`/${locale}/settings`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Settings size={14} />}
                      >
                        {t.settings}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════
              STATS GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-10">
            <StatCard
              icon={Target}
              label={t.predictions}
              value={stats.predictions}
              color="lime"
              delay={0}
            />
            <StatCard
              icon={Trophy}
              label={t.correct}
              value={stats.correct}
              color="success"
              delay={0.05}
            />
            <StatCard
              icon={TrendingUp}
              label={t.accuracy}
              value={hasStats ? `${stats.accuracy}%` : '—'}
              color="teal"
              delay={0.1}
            />
            <StatCard
              icon={Flame}
              label={t.streak}
              value={stats.streak}
              color="danger"
              delay={0.15}
            />
          </div>

          {/* ═══════════════════════════════════════════════════
              BADGES SECTION
          ═══════════════════════════════════════════════════ */}
          <div className="mb-10">
            <Section
              icon={Award}
              title={t.badges}
              description={t.badgesDesc}
              delay={0.2}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                {ALL_BADGES.map((badge, i) => (
                  <BadgeCard
                    key={badge.key}
                    badge={badge}
                    unlocked={unlockedBadges.includes(badge.key)}
                    locale={locale}
                    delay={0.25 + i * 0.05}
                  />
                ))}
              </div>
            </Section>
          </div>

          {/* ═══════════════════════════════════════════════════
              RECENT ACTIVITY
          ═══════════════════════════════════════════════════ */}
          <div className="mb-10">
            <Section
              icon={History}
              title={t.recentActivity}
              description={t.recentActivityDesc}
              delay={0.3}
            >
              <EmptyState
                icon={Activity}
                title={t.noActivity}
                hint={t.noActivityHint}
                action={
                  <Link
                    href={`/${locale}/predictions`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-xs font-semibold hover:bg-lime/20 transition-colors"
                  >
                    <Target size={12} />
                    <span>
                      {locale === 'ka'
                        ? 'პროგნოზების ნახვა'
                        : locale === 'ru'
                        ? 'Смотреть прогнозы'
                        : 'View predictions'}
                    </span>
                    <ChevronRight size={12} />
                  </Link>
                }
              />
            </Section>
          </div>

          {/* ═══════════════════════════════════════════════════
              BOOKMARKS
          ═══════════════════════════════════════════════════ */}
          <div className="pb-16">
            <Section
              icon={Bookmark}
              title={t.bookmarks}
              description={t.bookmarksDesc}
              delay={0.35}
            >
              <EmptyState
                icon={Bookmark}
                title={t.noBookmarks}
                hint={
                  locale === 'ka'
                    ? 'შეინახე საინტერესო სტატიები და მატჩები'
                    : locale === 'ru'
                    ? 'Сохраняй интересные статьи и матчи'
                    : 'Save interesting articles and matches'
                }
              />
            </Section>
          </div>
        </Container>
      </div>
    </div>
  );
}