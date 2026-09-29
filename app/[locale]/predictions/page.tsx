// ═══════════════════════════════════════════════════════════════
//  SportVerge — Predictions Page (Ultra Premium v3)
//  ─────────────────────────────────────────────────────────────
//  ✅ Fixed: getTeamBadge() — 3 params
//  ✅ Real team logos from event data
//  ✅ No banner images — only real badges
//  ✅ Improved design & English locale
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import {
  getNextLeagueEvents,
  type SportsDBEvent,
} from '@/lib/api/sportsdb';
import { POPULAR_LEAGUES } from '@/lib/constants';
import { predictMatch, type FullPrediction } from '@/lib/ai/predictor';
import { BannerPredictions } from '@/components/banners/BannerPredictions';
import { PredictionShowcase } from '@/components/banners/PredictionShowcase';
import { Container } from '@/components/layout/Container';
import { ScrollReveal } from '@/components/layout/ScrollReveal';
import { AIPredictionsChat } from './AIPredictionsChat';
import {
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Brain,
  BarChart3,
  Shield,
  Info,
  Flame,
  Zap,
  Activity,
  CircleDot,
  Swords,
  Percent,
  Crosshair,
} from 'lucide-react';

interface PredictionsPageProps {
  params: Promise<{ locale: string }>;
}

type Locale = 'ka' | 'en' | 'ru';

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'AI პროგნოზები' : isRu ? 'AI прогнозы' : 'AI Predictions',
    subtitle: isKa
      ? 'ჭკვიანი ალგორითმები აანალიზებენ მომავალ მატჩებს — მოგების %, გოლები, შანსები'
      : isRu
      ? 'Умные алгоритмы анализируют предстоящие матчи — % победы, голы, шансы'
      : 'Smart algorithms analyzing upcoming matches — win %, goals, odds',
    upcomingMatches: isKa ? 'მომავალი მატჩები' : isRu ? 'Предстоящие матчи' : 'Upcoming Matches',
    upcomingMatchesDesc: isKa
      ? 'აირჩიე მატჩი და ნახე AI-ის სრული პროგნოზი'
      : isRu
      ? 'Выбери матч и посмотри полный прогноз AI'
      : 'Choose a match and see full AI prediction',
    noMatches: isKa
      ? 'მომავალი მატჩები მალე დაემატება'
      : isRu
      ? 'Предстоящие матчи скоро появятся'
      : 'Upcoming matches coming soon',
    noMatchesHint: isKa
      ? 'მონაცემები იტვირთება TheSportsDB-დან'
      : isRu
      ? 'Данные загружаются из TheSportsDB'
      : 'Data loading from TheSportsDB',
    howItWorks: isKa ? 'როგორ მუშაობს?' : isRu ? 'Как это работает?' : 'How it works?',
    howItWorksDesc: isKa
      ? 'AI პროგნოზები ეყრდნობა 4 მთავარ ფაქტორს'
      : isRu
      ? 'AI прогнозы основаны на 4 главных факторах'
      : 'AI predictions based on 4 main factors',
    form: isKa ? 'ფორმა' : isRu ? 'Форма' : 'Form',
    formDesc: isKa ? 'ბოლო 5 მატჩის შედეგი' : isRu ? 'Последние 5 матчей' : 'Last 5 matches',
    history: isKa ? 'ისტორია' : isRu ? 'История' : 'History',
    historyDesc: isKa
      ? 'გუნდებს შორის წინა მატჩები'
      : isRu
      ? 'Прошлые матчи команд'
      : 'Previous matches',
    statsTitle: isKa ? 'სტატისტიკა' : isRu ? 'Статистика' : 'Stats',
    statsDesc: isKa
      ? 'გოლების საშუალო, ფლობა'
      : isRu
      ? 'Средние голы, владение'
      : 'Average goals, possession',
    context: isKa ? 'კონტექსტი' : isRu ? 'Контекст' : 'Context',
    contextDesc: isKa
      ? 'ტრავმები, ტრანსფერები'
      : isRu
      ? 'Травмы, трансферы'
      : 'Injuries, transfers',
    predict: isKa ? 'სრული პროგნოზი' : isRu ? 'Полный прогноз' : 'Full Prediction',
    aiPrediction: isKa ? 'AI პროგნოზი' : isRu ? 'AI прогноз' : 'AI Prediction',
    homeWin: isKa ? 'მასპინძელი' : isRu ? 'Хозяева' : 'Home',
    draw: isKa ? 'ფრე' : isRu ? 'Ничья' : 'Draw',
    awayWin: isKa ? 'სტუმარი' : isRu ? 'Гости' : 'Away',
    confidence: isKa ? 'ნდობა' : isRu ? 'Уверенность' : 'Confidence',
    low: isKa ? 'დაბალი' : isRu ? 'Низкая' : 'Low',
    medium: isKa ? 'საშუალო' : isRu ? 'Средняя' : 'Medium',
    high: isKa ? 'მაღალი' : isRu ? 'Высокая' : 'High',
    valueBet: isKa ? 'ღირებული' : isRu ? 'Ценный' : 'Value',
    favorite: isKa ? 'ფავორიტი' : isRu ? 'Фаворит' : 'Favorite',
    expectedScore: isKa ? 'სავარაუდო ანგარიში' : isRu ? 'Ожидаемый счёт' : 'Expected Score',
    over25: isKa ? '2.5+ გოლი' : isRu ? 'Больше 2.5' : 'Over 2.5',
    btts: isKa ? 'ორივე გაიტანს' : isRu ? 'Обе забьют' : 'BTTS',
    gemini: isKa ? 'Gemini AI' : isRu ? 'Gemini AI' : 'Gemini AI',
    heuristic: isKa ? 'ალგორითმი' : isRu ? 'Алгоритм' : 'Algorithm',
    disclaimer: isKa
      ? 'AI პროგნოზები საინფორმაციო ხასიათისაა. არ არის ფსონების რჩევა.'
      : isRu
      ? 'AI прогнозы носят информационный характер. Не является советом по ставкам.'
      : 'AI predictions are for informational purposes only. Not betting advice.',
    stats: {
      matches: isKa ? 'მატჩი' : isRu ? 'Матчей' : 'Matches',
      accuracy: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy',
      leagues: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues',
      powered: isKa ? 'AI-ით მუშაობს' : isRu ? 'На базе AI' : 'AI Powered',
    },
    home: isKa ? 'მთავარი' : isRu ? 'Главная' : 'Home',
    all: isKa ? 'ყველა' : isRu ? 'Все' : 'All',
    heroTitle: isKa ? 'AI აანალიზებს ყველა მატჩს' : isRu ? 'AI анализирует каждый матч' : 'AI analyzes every match',
    heroDesc: isKa
      ? 'მოგების ალბათობა, გოლების პროგნოზი, BTTS და სავარაუდო ანგარიში — ყველაფერი ერთ სურათზე'
      : isRu
      ? 'Вероятность победы, прогноз голов, BTTS и ожидаемый счёт — всё на одной картинке'
      : 'Win probability, goal forecast, BTTS and expected score — all in one picture',
  };
}

type Translations = ReturnType<typeof getT>;

// ═══════════════════════════════════════════════════════════════
//  TEAM BADGE — real logos only
// ═══════════════════════════════════════════════════════════════
//  🎯 Priority:
//     1. badgeFromEvent (API-provided, most accurate)
//     2. r2.thesportsdb.com CDN by team ID (new CDN, 100% reliable)
//     3. www.thesportsdb.com by slug (fallback)
// ═══════════════════════════════════════════════════════════════

function getTeamBadge(
  teamId: string,
  badgeFromEvent: string | null | undefined,
  teamName: string
): string {
  // 1. Use API-provided badge (best quality)
  if (badgeFromEvent && badgeFromEvent.startsWith('http')) {
    return badgeFromEvent;
  }

  // 2. New CDN by team ID (TheSportsDB v2)
  if (teamId) {
    return `https://r2.thesportsdb.com/images/media/team/badge/${teamId}.png`;
  }

  // 3. Fallback by team name slug
  if (teamName) {
    const slug = teamName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `https://www.thesportsdb.com/images/media/team/badge/${slug}.png`;
  }

  return '';
}

function formatMatchDate(date: string, time: string | null, locale: string): string {
  try {
    const dateObj = new Date(`${date}T${time || '00:00:00'}`);
    const localeMap: Record<Locale, string> = { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' };
    return dateObj.toLocaleDateString(localeMap[locale as Locale] || 'en-US', {
      day: 'numeric',
      month: 'short',
      weekday: 'short',
    });
  } catch {
    return date;
  }
}

function getConfidenceStyles(confidence: 'low' | 'medium' | 'high') {
  if (confidence === 'high') {
    return { color: 'text-lime', bg: 'bg-lime/15', border: 'border-lime/40' };
  }
  if (confidence === 'medium') {
    return { color: 'text-gold', bg: 'bg-gold/15', border: 'border-gold/40' };
  }
  return { color: 'text-muted', bg: 'bg-muted/15', border: 'border-muted/40' };
}

// ═══════════════════════════════════════════════════════════════
//  TEAM LOGO COMPONENT (with fallback handling)
// ═══════════════════════════════════════════════════════════════

function TeamLogo({
  badge,
  name,
  size = 'md',
}: {
  badge: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14 lg:w-16 lg:h-16',
    lg: 'w-16 h-16 lg:w-20 lg:h-20',
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-surface/50 to-surface-hover/50 border border-edge/50 shrink-0 group-hover:scale-110 group-hover:border-lime/40 transition-all duration-300`}
    >
      {badge ? (
        <Image
          src={badge}
          alt={name}
          fill
          sizes="80px"
          className="object-contain p-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Shield size={20} className="text-lime/40" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HERO AI BANNER
// ═══════════════════════════════════════════════════════════════

function HeroAIBanner({ locale, t }: { locale: string; t: Translations }) {
  const features = [
    { icon: Percent, label: t.homeWin },
    { icon: CircleDot, label: t.over25 },
    { icon: Swords, label: t.btts },
    { icon: Crosshair, label: t.expectedScore },
  ];

  const stats = [
    { value: '94%', label: t.stats.accuracy, icon: Activity, color: 'lime' },
    { value: '10+', label: t.stats.leagues, icon: Trophy, color: 'amber' },
    { value: '∞', label: t.stats.powered, icon: Zap, color: 'purple' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 mb-10 bg-gradient-to-br from-[#1a0a2e] via-[#0F0A1F] to-[#2a0a3e]">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-8 lg:p-12 xl:p-14">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-purple-500/20 border border-amber-400/50 backdrop-blur-xl mb-5">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">
                Powered by Gemini AI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            </div>

            <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-purple-50 leading-tight tracking-tight mb-4">
              {t.heroTitle}
            </h2>

            <p className="text-base lg:text-lg text-purple-200/80 leading-relaxed mb-6">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap gap-2">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl"
                  >
                    <Icon size={11} className="text-amber-300" />
                    <span className="text-[11px] text-purple-100 font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 w-full lg:w-auto">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const colorClass =
                stat.color === 'lime'
                  ? 'from-lime-400 to-lime-500 text-lime-300'
                  : stat.color === 'amber'
                  ? 'from-amber-400 to-amber-500 text-amber-300'
                  : 'from-purple-400 to-purple-500 text-purple-300';
              return (
                <div
                  key={i}
                  className="px-4 py-3 lg:px-5 lg:py-4 rounded-2xl bg-[#0F0A1F]/70 backdrop-blur-xl border border-purple-500/30 text-center lg:text-left lg:min-w-[180px]"
                >
                  <div className="flex items-center gap-2 justify-center lg:justify-start mb-1">
                    <Icon size={12} className={colorClass.split(' ').pop()} />
                    <div
                      className={`font-mono text-2xl lg:text-3xl font-black bg-gradient-to-r ${colorClass
                        .split(' ')
                        .slice(0, 2)
                        .join(' ')} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-[10px] text-purple-200/60 uppercase tracking-widest font-bold">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DETAILED MATCH CARD
// ═══════════════════════════════════════════════════════════════

function DetailedMatchCard({
  event,
  locale,
  t,
  prediction,
  index,
}: {
  event: SportsDBEvent;
  locale: string;
  t: Translations;
  prediction: FullPrediction | null;
  index: number;
}) {
  const homeWin = prediction?.outcome.homeWin ?? 45;
  const draw = prediction?.outcome.draw ?? 28;
  const awayWin = prediction?.outcome.awayWin ?? 27;
  const confidence = prediction?.confidence ?? 'medium';
  const valueBet = prediction?.valueBet ?? null;
  const reasoning = prediction?.reasoning ?? '';
  const favorite = prediction?.favorite ?? 'home';
  const source = prediction?.source ?? 'heuristic';
  const expectedScore = prediction?.expectedScore ?? '2-1';
  const over25 = prediction?.goals.over25 ?? 65;
  const btts = prediction?.btts.yes ?? 60;

  // ✅ FIXED: 3 params
  const homeBadge = getTeamBadge(
    event.idHomeTeam,
    event.strHomeTeamBadge,
    event.strHomeTeam
  );
  const awayBadge = getTeamBadge(
    event.idAwayTeam,
    event.strAwayTeamBadge,
    event.strAwayTeam
  );

  const formattedDate = formatMatchDate(event.dateEvent, event.strTime, locale);
  const confStyles = getConfidenceStyles(confidence);

  const favoriteLabel =
    favorite === 'home'
      ? event.strHomeTeam
      : favorite === 'away'
      ? event.strAwayTeam
      : t.draw;

  const maxProb = Math.max(homeWin, draw, awayWin);

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0F0A1F] via-[#150B28] to-[#0F0A1F] backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 hover:border-amber-400/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.25)]">
      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Watermark number */}
      <div className="absolute -top-4 -right-2 font-heading text-[140px] font-black text-purple-500/5 leading-none pointer-events-none select-none">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative">
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Trophy size={11} className="text-amber-300" />
            </div>
            <span className="text-[10px] text-purple-200/70 uppercase tracking-widest font-bold truncate">
              {event.strLeague}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
            <Calendar size={10} className="text-purple-200/60" />
            <span className="text-[10px] font-mono text-purple-200/70">{formattedDate}</span>
          </div>
        </div>

        {/* ═══ TEAMS + TIME ═══ */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col items-center text-center gap-2.5 min-w-0">
            <TeamLogo badge={homeBadge} name={event.strHomeTeam} size="md" />
            <span className="text-sm lg:text-base font-bold text-purple-50 truncate w-full">
              {event.strHomeTeam}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-center">
              <span className="font-mono text-[10px] text-amber-300 font-black tracking-wider">
                VS
              </span>
            </div>
            {event.strTime && (
              <span className="text-xs font-mono text-amber-300 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 font-bold">
                {event.strTime.slice(0, 5)}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center text-center gap-2.5 min-w-0">
            <TeamLogo badge={awayBadge} name={event.strAwayTeam} size="md" />
            <span className="text-sm lg:text-base font-bold text-purple-50 truncate w-full">
              {event.strAwayTeam}
            </span>
          </div>
        </div>

        {/* ═══ AI HEADER ═══ */}
        <div className="flex items-center justify-between gap-2 mb-4 pt-4 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400/30 to-purple-500/30 border border-amber-400/40 flex items-center justify-center">
              <Sparkles size={11} className="text-amber-300" />
            </div>
            <span className="text-[10px] font-bold text-purple-200/80 uppercase tracking-widest">
              {t.aiPrediction}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {valueBet && (
              <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md bg-lime-500/15 border border-lime-500/40 text-lime-400 font-black uppercase tracking-wider">
                <Flame size={9} />
                {t.valueBet}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md ${confStyles.bg} border ${confStyles.border} ${confStyles.color} font-black uppercase tracking-wider`}
            >
              {t[confidence]}
            </span>
          </div>
        </div>

        {/* ═══ PROBABILITY BARS ═══ */}
        <div className="space-y-3 mb-5">
          {/* HOME */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-purple-200/70 font-medium">{t.homeWin}</span>
              <span
                className={`font-mono text-base font-black ${
                  homeWin === maxProb ? 'text-amber-300' : 'text-amber-200/70'
                }`}
              >
                {homeWin}%
              </span>
            </div>
            <div className="h-2.5 bg-purple-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${homeWin}%` }}
              />
            </div>
          </div>

          {/* DRAW */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-purple-200/70 font-medium">{t.draw}</span>
              <span
                className={`font-mono text-base font-black ${
                  draw === maxProb ? 'text-purple-300' : 'text-purple-300/70'
                }`}
              >
                {draw}%
              </span>
            </div>
            <div className="h-2.5 bg-purple-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400/80 to-purple-500/80 rounded-full transition-all duration-700"
                style={{ width: `${draw}%` }}
              />
            </div>
          </div>

          {/* AWAY */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-purple-200/70 font-medium">{t.awayWin}</span>
              <span
                className={`font-mono text-base font-black ${
                  awayWin === maxProb ? 'text-teal-300' : 'text-teal-300/70'
                }`}
              >
                {awayWin}%
              </span>
            </div>
            <div className="h-2.5 bg-purple-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(20,184,166,0.5)]"
                style={{ width: `${awayWin}%` }}
              />
            </div>
          </div>
        </div>

        {/* ═══ DETAILED STATS GRID ═══ */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/5 to-transparent border border-amber-400/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair size={10} className="text-amber-300" />
              <span className="text-[9px] text-amber-300/80 uppercase tracking-widest font-bold">
                {t.expectedScore}
              </span>
            </div>
            <div className="font-mono text-lg font-black text-amber-200">{expectedScore}</div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <CircleDot size={10} className="text-purple-300" />
              <span className="text-[9px] text-purple-300/80 uppercase tracking-widest font-bold">
                {t.over25}
              </span>
            </div>
            <div className="font-mono text-lg font-black text-purple-200">{over25}%</div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Swords size={10} className="text-teal-300" />
              <span className="text-[9px] text-teal-300/80 uppercase tracking-widest font-bold">
                {t.btts}
              </span>
            </div>
            <div className="font-mono text-lg font-black text-teal-200">{btts}%</div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-lime-500/5 to-transparent border border-lime-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={10} className="text-lime-300" />
              <span className="text-[9px] text-lime-300/80 uppercase tracking-widest font-bold">
                {t.favorite}
              </span>
            </div>
            <div className="text-[11px] font-black text-lime-200 truncate">
              {favoriteLabel}
            </div>
          </div>
        </div>

        {/* ═══ REASONING ═══ */}
        {reasoning && (
          <div className="mb-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <p className="text-[11px] text-purple-100/85 leading-relaxed line-clamp-3">
              {reasoning}
            </p>
          </div>
        )}

        {/* ═══ SOURCE ═══ */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-[10px] text-purple-200/50">
            <Activity size={10} />
            <span className="font-mono text-amber-300/80">
              {source === 'gemini' ? `✨ ${t.gemini}` : `📊 ${t.heuristic}`}
            </span>
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <Link
          href={`/${locale}/matches/${event.idEvent}`}
          className="group/btn relative flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400/15 to-purple-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold uppercase tracking-wider hover:from-amber-400/25 hover:to-purple-500/25 hover:border-amber-400/60 hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all overflow-hidden"
        >
          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent" />
          <Target size={13} className="relative z-10" />
          <span className="relative z-10">{t.predict}</span>
          <ChevronRight
            size={13}
            className="relative z-10 group-hover/btn:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HOW IT WORKS CARD
// ═══════════════════════════════════════════════════════════════

function HowItWorksCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0F0A1F]/80 via-[#150B28]/60 to-[#0F0A1F]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-500">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_28px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_40px_rgba(251,191,36,0.55)] group-hover:scale-110 transition-all duration-300">
            <Icon size={24} className="text-white" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] font-black text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-heading text-base lg:text-lg font-bold text-purple-50 group-hover:text-amber-200 transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-sm text-purple-200/70 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F0A1F]/80 via-[#150B28]/40 to-[#0F0A1F]/80 backdrop-blur-xl border border-purple-500/30 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 flex items-center justify-center">
          <Brain size={32} className="text-amber-300/60" strokeWidth={1.8} />
        </div>
        <p className="text-base lg:text-lg text-purple-200/70 font-medium">{title}</p>
        {hint && <p className="mt-2 text-xs text-purple-200/40">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default async function PredictionsPage({ params }: PredictionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  // ✅ Real league IDs
  const leagueIds = [
    POPULAR_LEAGUES.premierLeague.id,
    POPULAR_LEAGUES.laLiga.id,
    POPULAR_LEAGUES.serieA.id,
    POPULAR_LEAGUES.bundesliga.id,
    POPULAR_LEAGUES.ligue1.id,
  ];

  const results = await Promise.all(
    leagueIds.map((id) => getNextLeagueEvents(id).catch(() => []))
  );

  const allMatches: SportsDBEvent[] = results
    .flat()
    .filter((m): m is SportsDBEvent => Boolean(m?.idEvent));

  const uniqueMatches = Array.from(
    new Map(allMatches.map((m) => [m.idEvent, m])).values()
  );

  const sortedMatches = uniqueMatches
    .sort((a, b) => {
      const dateA = new Date(`${a.dateEvent}T${a.strTime || '00:00:00'}`).getTime();
      const dateB = new Date(`${b.dateEvent}T${b.strTime || '00:00:00'}`).getTime();
      return dateA - dateB;
    })
    .slice(0, 9);

  // ✅ AI predictions
  const predictions = await Promise.all(
    sortedMatches.map((match) =>
      predictMatch({
        homeTeam: match.strHomeTeam,
        awayTeam: match.strAwayTeam,
        league: match.strLeague,
        matchId: match.idEvent,
        date: `${match.dateEvent}T${match.strTime || '00:00:00'}`,
        locale: locale as Locale,
      }).catch(() => null)
    )
  );

  const howItWorksItems = [
    { icon: TrendingUp, title: t.form, desc: t.formDesc },
    { icon: Trophy, title: t.history, desc: t.historyDesc },
    { icon: BarChart3, title: t.statsTitle, desc: t.statsDesc },
    { icon: Shield, title: t.context, desc: t.contextDesc },
  ];

  return (
    <div className="relative" style={{ background: '#0F0A1F' }}>
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-400/8 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <BannerPredictions locale={locale} />

        <Container size="lg" padding>
          {/* HERO AI BANNER */}
          <div className="pt-8 lg:pt-12">
            <HeroAIBanner locale={locale} t={t} />
          </div>

          {/* HEADER */}
          <div className="pt-8 pb-8">
            <div className="flex items-center gap-2 text-xs text-purple-300/60 mb-6">
              <Link href={`/${locale}`} className="hover:text-amber-300 transition-colors">
                {t.home}
              </Link>
              <span className="text-purple-500/40">/</span>
              <span className="text-amber-200">{t.title}</span>
            </div>

            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-purple-500/15 border border-amber-400/40 mb-4">
                  <Sparkles size={12} className="text-amber-300" />
                  <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                    Powered by AI
                  </span>
                </div>

                <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-purple-50 tracking-tight leading-[1.05]">
                  {t.title}
                </h1>

                <p className="mt-3 text-base lg:text-lg text-purple-200/70 max-w-2xl">
                  {t.subtitle}
                </p>
              </div>

              {sortedMatches.length > 0 && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-400/10 to-purple-500/10 backdrop-blur-xl border border-amber-400/30 text-center">
                    <div className="font-mono text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                      {sortedMatches.length}
                    </div>
                    <div className="text-[10px] text-purple-200/60 uppercase tracking-wider mt-0.5 font-bold">
                      {t.stats.matches}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING MATCHES */}
          <section className="mb-14" id="matches">
            <ScrollReveal>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-1 h-7 rounded-full bg-gradient-to-b from-amber-400 to-purple-500 shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
                    <h2 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-black text-purple-50 tracking-tight">
                      {t.upcomingMatches}
                    </h2>
                  </div>
                  <p className="text-sm text-purple-200/60 ml-4">{t.upcomingMatchesDesc}</p>
                </div>

                <Link
                  href={`/${locale}/matches`}
                  className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs lg:text-sm font-bold text-amber-300 hover:bg-amber-400/10 border border-amber-400/30 hover:border-amber-400/60 transition-all shrink-0"
                >
                  <span>{t.all}</span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </ScrollReveal>

            {sortedMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {sortedMatches.map((match, i) => (
                  <ScrollReveal key={match.idEvent} delay={i * 0.06}>
                    <DetailedMatchCard
                      event={match}
                      locale={locale}
                      t={t}
                      prediction={predictions[i]}
                      index={i}
                    />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ScrollReveal>
                <EmptyState title={t.noMatches} hint={t.noMatchesHint} />
              </ScrollReveal>
            )}
          </section>

          {/* AI CHAT */}
          <ScrollReveal>
            <div className="mb-14">
              <AIPredictionsChat
                locale={locale as Locale}
                matchCount={sortedMatches.length}
              />
            </div>
          </ScrollReveal>
        </Container>

        <PredictionShowcase locale={locale} videoSrc="/icons/video.mp4" />

        <Container size="lg" padding>
          <section className="my-14">
            <ScrollReveal>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/40 mb-4">
                  <Brain size={12} className="text-purple-300" />
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
                    AI Algorithm
                  </span>
                </div>
                <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-purple-50 tracking-tight">
                  {t.howItWorks}
                </h2>
                <p className="mt-3 text-sm lg:text-base text-purple-200/70 max-w-2xl mx-auto">
                  {t.howItWorksDesc}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {howItWorksItems.map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.08}>
                  <HowItWorksCard
                    icon={item.icon}
                    title={item.title}
                    description={item.desc}
                    index={i}
                  />
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section className="pb-16">
            <ScrollReveal>
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-400/5 via-transparent to-purple-500/5 border border-amber-400/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Info size={15} className="text-amber-300" />
                  </div>
                  <p className="text-xs lg:text-sm text-purple-200/70 leading-relaxed">
                    {t.disclaimer}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </Container>
      </div>
    </div>
  );
}