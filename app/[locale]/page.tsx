// ═══════════════════════════════════════════════════════════════
//  SportVerge — Homepage (Ultra Premium v4)
//  ─────────────────────────────────────────────────────────────
//  ✨ 16+ sections, animated counters, swipe-ready
//  🎬 Videos, News, Teams, Predictions, Stats
//  🌊 Framer Motion animations throughout
// ═══════════════════════════════════════════════════════════════

import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import {
  getLiveScores,
  getNextLeagueEvents,
  getPastLeagueEvents,
  getAllTeamsInLeague,
  type SportsDBEvent,
  type SportsDBTeam,
} from '@/lib/api/sportsdb';
import { LEAGUES as POPULAR_LEAGUES, APP } from '@/lib/constants';
import { getAllRSSNews, type RSSArticle } from '@/lib/api/rss';
import { getVideosFromMultipleChannels, DEFAULT_CHANNELS, type YouTubeVideo } from '@/lib/api/youtube';
import type { NewsItem } from '@/components/news/NewsGrid';
import { NewsGrid } from '@/components/news/NewsGrid';
import { VideoCard } from '@/components/video/VideoCard';
import { BannerHero } from '@/components/banners/BannerHero';
import { BannerCinematic } from '@/components/banners/BannerCinematic';
import { BannerSpotlight } from '@/components/banners/BannerSpotlight';
import { BannerTrio } from '@/components/banners/BannerTrio';
import { BannerPromo } from '@/components/banners/BannerPromo';
import { VideoShowcase } from '@/components/banners/VideoShowcase';
import { LiveMarquee } from '@/components/banners/LiveMarquee';
import { ScrollReveal } from '@/components/layout/ScrollReveal';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { TiltCard } from '@/components/ui/TiltCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
import {
  Zap, Newspaper, Play, Trophy, Users, Globe,
  ArrowRight, Target, Activity, ChevronRight,
  Sparkles, Shield, Crown, Video, BarChart3,
  TrendingUp, Flame, Award, Star, Mail, Radio,
  CheckCircle2, Clock, MapPin, Eye, Heart,
  MessageCircle, Swords, Brain, Rocket, Gem,
  Gauge, Layers, Compass, CircleDot, Percent,
} from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';
  const t = (ka: string, en: string, ru: string) =>
    isKa ? ka : isRu ? ru : en;

  return {
    // Live
    liveNow: t('LIVE ახლა', 'Live now', 'LIVE сейчас'),
    liveSubtitle: t('რეალურ დროში მიმდინარე მატჩები', 'Matches happening now', 'Матчи в реальном времени'),
    noLive: t('ახლა ლაივ მატჩები არ არის', 'No live matches right now', 'Сейчас нет живых матчей'),

    // Upcoming
    upcoming: t('მომავალი მატჩები', 'Upcoming Matches', 'Предстоящие матчи'),
    upcomingSubtitle: t('უახლოესი შეხვედრები', 'Next fixtures', 'Ближайшие встречи'),
    noUpcoming: t('მომავალი მატჩები მალე დაემატება', 'Upcoming matches coming soon', 'Предстоящие матчи скоро появятся'),

    // Top Matches
    topMatches: t('ტოპ მატჩები', 'Top Matches', 'Топ матчи'),
    topMatchesSubtitle: t('დღის ყველაზე საინტერესო შეხვედრები', 'Most interesting matches today', 'Самые интересные матчи дня'),

    // Trending
    trending: t('პოპულარული', 'Trending Now', 'В тренде'),
    trendingSubtitle: t('ყველაზე მეტად ნანახი შეხვედრები', 'Most viewed matches', 'Самые просматриваемые матчи'),

    // Predictions
    predictions: t('AI პროგნოზები', 'AI Predictions', 'AI прогнозы'),
    predictionsSubtitle: t('AI-ის ანალიზი მომავალ მატჩებზე', 'AI analysis of upcoming matches', 'AI-анализ предстоящих матчей'),
    predict: t('იწინასწარმეტყველე', 'Predict', 'Прогноз'),
    draw: t('ფრე', 'Draw', 'Ничья'),

    // Battle
    battleTitle: t('AI vs შენ', 'AI vs You', 'AI против тебя'),
    battleSubtitle: t('შეძლებ AI-ს დამარცხებას?', 'Can you beat the AI?', 'Сможешь победить AI?'),
    aiThinking: t('AI ფიქრობს', 'AI is thinking', 'AI думает'),
    yourTurn: t('შენი ჯერია', 'Your turn', 'Твой ход'),

    // News
    news: t('სიახლეები', 'News', 'Новости'),
    newsSubtitle: t('უახლესი სპორტული ამბები', 'Latest sports stories', 'Последние спортивные новости'),
    noNews: t('სიახლეები მალე დაემატება', 'News coming soon', 'Новости скоро появятся'),

    // Videos
    videos: t('ვიდეოები', 'Videos', 'Видео'),
    videosSubtitle: t('მიმოხილვები, გოლები, ინტერვიუები', 'Highlights, goals, interviews', 'Обзоры, голы, интервью'),
    videosDesc: t('რეალური ვიდეოები YouTube-დან', 'Real videos from YouTube', 'Реальные видео с YouTube'),
    noVideos: t('ვიდეოები მალე დაემატება', 'Videos coming soon', 'Видео скоро появятся'),

    // Teams
    teams: t('გუნდები', 'Teams', 'Команды'),
    teamsSubtitle: t('ყველაზე ძლიერი კლუბები', 'Top clubs', 'Топ-клубы'),
    follow: t('გამოწერა', 'Follow', 'Подписаться'),
    following: t('გამოწერილი', 'Following', 'Подписан'),

    // Stats
    stats: t('სტატისტიკა', 'Statistics', 'Статистика'),
    statsSubtitle: t('პლატფორმის ცოცხალი ციფრები', 'Live platform numbers', 'Живые цифры платформы'),
    liveMatches: t('ცოცხალი', 'Live', 'Живых'),
    totalMatches: t('სულ მატჩი', 'Total matches', 'Всего матчей'),
    predictionAccuracy: t('პროგნოზის სიზუსტე', 'Prediction accuracy', 'Точность прогноза'),
    activeUsers: t('აქტიური მომხმარებელი', 'Active users', 'Активных юзеров'),
    leaguesCovered: t('დაფარული ლიგები', 'Leagues covered', 'Покрытых лиг'),

    // Why Us
    whyUs: t('რატომ SportVerge?', 'Why SportVerge?', 'Почему SportVerge?'),
    whyUsSubtitle: t('უნიკალური უპირატესობები', 'Unique advantages', 'Уникальные преимущества'),

    // Newsletter
    newsletter: t('გამოიწერე სიახლეები', 'Subscribe to news', 'Подпишись на новости'),
    newsletterDesc: t('მიიღე ყველა მთავარი სპორტული სიახლე პირველად', 'Get all main sports news first', 'Получай главные спортивные новости первым'),
    subscribe: t('გამოწერა', 'Subscribe', 'Подписаться'),
    emailPlaceholder: t('შენი ელფოსტა', 'Your email', 'Твой email'),
    noSpam: t('არავითარი spam', 'No spam', 'Никакого спама'),

    // CTA
    ctaTitle: t('მზად ხარ იწინასწარმეტყველო?', 'Ready to predict?', 'Готов прогнозировать?'),
    ctaDesc: t('შემოგვიერთდი და შეადარე შენი პროგნოზები AI-ს', 'Join and compare your predictions with AI', 'Присоединяйся и сравни свои прогнозы с AI'),
    ctaButton: t('დაიწყე ახლა', 'Start now', 'Начать сейчас'),

    // Navigation
    viewAll: t('ყველას ნახვა', 'View all', 'Смотреть все'),
    seeMore: t('მეტი', 'More', 'Ещё'),
    login: t('შესვლა', 'Login', 'Войти'),
    register: t('რეგისტრაცია', 'Sign Up', 'Регистрация'),
    loadMore: t('მეტი ჩატვირთვა', 'Load more', 'Загрузить ещё'),
  };
}

type Translations = ReturnType<typeof getT>;

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function prepareMatchData(event: SportsDBEvent) {
  return {
    homeTeam: {
      idTeam: event.idHomeTeam,
      strTeam: event.strHomeTeam,
      strTeamBadge: event.strHomeTeamBadge || `https://www.thesportsdb.com/images/media/team/badge/${event.idHomeTeam}.png`,
    },
    awayTeam: {
      idTeam: event.idAwayTeam,
      strTeam: event.strAwayTeam,
      strTeamBadge: event.strAwayTeamBadge || `https://www.thesportsdb.com/images/media/team/badge/${event.idAwayTeam}.png`,
    },
    scoreHome: event.intHomeScore !== null ? parseInt(event.intHomeScore, 10) : null,
    scoreAway: event.intAwayScore !== null ? parseInt(event.intAwayScore, 10) : null,
  };
}

function getMatchStatus(event: SportsDBEvent): 'upcoming' | 'live' | 'finished' {
  if (event.strStatus === 'Match Finished' || event.strStatus === 'FT') return 'finished';
  if (['Live', '1H', '2H', 'HT'].includes(event.strStatus || '')) return 'live';
  if (event.intHomeScore !== null && event.strStatus !== 'Live') return 'finished';
  return 'upcoming';
}

function normalizeArticle(article: RSSArticle): NewsItem {
  return {
    id: article.id,
    slug: article.id,
    title: article.title,
    excerpt: article.description || undefined,
    image: article.image,
    source: article.source,
    sourceUrl: article.sourceUrl,
    publishedAt: article.publishedAt,
    category: article.category as any,
    readTime: Math.max(1, Math.ceil((article.description?.length || 0) / 200)),
    hasAISummary: false,
  };
}

// ═══════════════════════════════════════════════════════════════
//  SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── Animated Section Divider ───
function SectionDivider() {
  return (
    <div className="relative h-12 w-full max-w-7xl mx-auto my-4 flex items-center">
      <div className="absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-edge/60 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-lime/40 shadow-[0_0_8px_rgba(217,249,157,0.5)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-lime shadow-[0_0_16px_rgba(217,249,157,0.8)] animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-lime/40 shadow-[0_0_8px_rgba(217,249,157,0.5)]" />
      </div>
    </div>
  );
}

// ─── Section Header ───
function SectionHeader({
  title,
  subtitle,
  href,
  viewAll,
  accent = 'lime',
  icon: Icon,
  badge,
}: {
  title: string;
  subtitle?: string;
  href: string;
  viewAll: string;
  accent?: 'lime' | 'teal' | 'danger' | 'gold' | 'purple';
  icon?: typeof Zap;
  badge?: string;
}) {
  const accentColor = {
    lime: 'bg-lime shadow-[0_0_14px_rgba(217,249,157,0.8)]',
    teal: 'bg-teal shadow-[0_0_14px_rgba(20,184,166,0.8)]',
    danger: 'bg-danger shadow-[0_0_14px_rgba(239,68,68,0.8)]',
    gold: 'bg-gold shadow-[0_0_14px_rgba(251,191,36,0.8)]',
    purple: 'bg-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.8)]',
  }[accent];

  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className={`w-1.5 h-7 rounded-full ${accentColor}`} />
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center">
              <Icon size={16} className="text-lime" />
            </div>
          )}
          <h2 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-black text-text tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-[10px] font-black text-lime uppercase tracking-widest">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm lg:text-base text-muted ml-4 lg:ml-5">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-lime bg-lime/5 border border-lime/20 hover:bg-lime/15 hover:border-lime/40 hover:shadow-[0_0_20px_rgba(217,249,157,0.2)] transition-all shrink-0"
      >
        <span>{viewAll}</span>
        <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// ─── Match Mini Card ───
function MatchMiniCard({
  event,
  locale,
  trending = false,
}: {
  event: SportsDBEvent;
  locale: string;
  trending?: boolean;
}) {
  const data = prepareMatchData(event);
  const status = getMatchStatus(event);

  return (
    <Link
      href={`/${locale}/matches/${event.idEvent}`}
      className="group relative block overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/50 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(217,249,157,0.2)] hover:-translate-y-1"
    >
      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Trending badge */}
      {trending && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[9px] font-black uppercase tracking-wider">
            <Flame size={9} />
            HOT
          </span>
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] text-muted uppercase tracking-widest font-bold truncate">
            {event.strLeague}
          </span>
          {status === 'live' && (
            <Badge variant="danger" size="sm" dot pulse>
              LIVE
            </Badge>
          )}
          {status === 'finished' && (
            <span className="text-[10px] font-mono text-muted/70 px-2 py-0.5 rounded-md bg-surface-hover border border-edge/50">
              FT
            </span>
          )}
          {status === 'upcoming' && event.strTime && (
            <span className="text-[10px] font-mono text-lime/90 px-2 py-0.5 rounded-md bg-lime/10 border border-lime/20">
              {event.strTime.slice(0, 5)}
            </span>
          )}
        </div>

        {/* Teams with badges */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface-hover border border-edge/50 shrink-0">
              <Image
                src={data.homeTeam.strTeamBadge}
                alt=""
                fill
                sizes="32px"
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <span className="text-sm text-text font-semibold truncate flex-1 group-hover:text-lime transition-colors">
              {event.strHomeTeam}
            </span>
            <span className="font-mono text-2xl font-black text-text tabular-nums">
              {data.scoreHome ?? '–'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface-hover border border-edge/50 shrink-0">
              <Image
                src={data.awayTeam.strTeamBadge}
                alt=""
                fill
                sizes="32px"
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <span className="text-sm text-text font-semibold truncate flex-1 group-hover:text-lime transition-colors">
              {event.strAwayTeam}
            </span>
            <span className="font-mono text-2xl font-black text-text tabular-nums">
              {data.scoreAway ?? '–'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-[10px] text-muted">
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>{event.dateEvent}</span>
          </div>
          <ArrowRight
            size={12}
            className="text-lime/60 group-hover:text-lime group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}

function MatchMiniCardSkeleton() {
  return (
    <div className="bg-surface/40 border border-edge/70 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-3.5 w-10 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ─── Featured Match Card (Hero) ───
function FeaturedMatchCard({ event, locale }: { event: SportsDBEvent; locale: string }) {
  const data = prepareMatchData(event);
  const status = getMatchStatus(event);

  return (
    <Link
      href={`/${locale}/matches/${event.idEvent}`}
      className="group relative overflow-hidden rounded-3xl border border-edge/50 bg-gradient-to-br from-surface/90 via-surface/50 to-surface/90 backdrop-blur-xl p-7 hover:border-lime/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_-20px_rgba(217,249,157,0.3)]"
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Corner glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={12} className="text-lime" />
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold truncate">
              {event.strLeague}
            </span>
          </div>
          {status === 'live' && (
            <Badge variant="danger" size="sm" dot pulse>
              LIVE
            </Badge>
          )}
          {status === 'finished' && (
            <span className="text-[10px] font-mono text-muted/70 px-2 py-0.5 rounded-md bg-surface-hover border border-edge/50">
              FT
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-surface-hover border border-edge/50 shrink-0 group-hover:scale-110 transition-transform">
              <Image
                src={data.homeTeam.strTeamBadge}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <span className="text-lg text-text font-black truncate flex-1 group-hover:text-lime transition-colors">
              {event.strHomeTeam}
            </span>
            <span className="font-mono text-3xl font-black text-lime tabular-nums">
              {data.scoreHome ?? '–'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-surface-hover border border-edge/50 shrink-0 group-hover:scale-110 transition-transform">
              <Image
                src={data.awayTeam.strTeamBadge}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <span className="text-lg text-text font-black truncate flex-1 group-hover:text-teal transition-colors">
              {event.strAwayTeam}
            </span>
            <span className="font-mono text-3xl font-black text-teal tabular-nums">
              {data.scoreAway ?? '–'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-edge/50 text-[11px] text-muted">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-lime/60" />
            <span>
              {event.dateEvent} {event.strTime?.slice(0, 5) || ''}
            </span>
          </div>
          {event.strVenue && (
            <>
              <span className="text-muted/40">•</span>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin size={11} className="text-lime/60" />
                <span className="truncate">{event.strVenue}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── AI Prediction Card ───
function AIPredictionCard({
  event,
  locale,
  t,
  prediction,
}: {
  event: SportsDBEvent;
  locale: string;
  t: Translations;
  prediction?: { home: number; draw: number; away: number; confidence: string };
}) {
  const homeWin = prediction?.home ?? 45;
  const draw = prediction?.draw ?? 28;
  const awayWin = prediction?.away ?? 27;
  const confidence = prediction?.confidence ?? 'medium';

  const confColor =
    confidence === 'high'
      ? 'text-lime border-lime/40 bg-lime/10'
      : confidence === 'medium'
      ? 'text-gold border-gold/40 bg-gold/10'
      : 'text-muted border-edge/50 bg-surface/50';

  return (
    <TiltCard intensity={6}>
      <div className="group relative bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/50 transition-all duration-300 h-full overflow-hidden">
        {/* Top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-lime/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold truncate">
              {event.strLeague}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${confColor}`}
              >
                {confidence}
              </span>
              <Badge variant="teal" size="sm">
                <Sparkles size={9} className="mr-1" />
                AI
              </Badge>
            </div>
          </div>

          {/* Teams */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-surface-hover border border-edge/50 shrink-0">
                <Image
                  src={`https://www.thesportsdb.com/images/media/team/badge/${event.idHomeTeam}.png`}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <span className="text-sm text-text font-semibold truncate flex-1">
                {event.strHomeTeam}
              </span>
              <span className="font-mono text-base font-black text-lime">{homeWin}%</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-surface-hover border border-edge/50 shrink-0">
                <Image
                  src={`https://www.thesportsdb.com/images/media/team/badge/${event.idAwayTeam}.png`}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <span className="text-sm text-text font-semibold truncate flex-1">
                {event.strAwayTeam}
              </span>
              <span className="font-mono text-base font-black text-teal">{awayWin}%</span>
            </div>
          </div>

          {/* Draw bar */}
          <div className="flex items-center justify-between gap-2 mb-3 text-[10px]">
            <span className="text-muted uppercase tracking-wider font-bold">{t.draw}</span>
            <span className="font-mono font-bold text-muted">{draw}%</span>
          </div>

          {/* Progress bars */}
          <div className="space-y-1.5 mb-5">
            <div className="h-1.5 bg-lime/10 rounded-full overflow-hidden">
              <div style={{ width: `${homeWin}%`, transition: "width 0.8s ease-out" }} className="h-full bg-gradient-to-r from-lime to-lime/70 rounded-full shadow-[0_0_10px_rgba(217,249,157,0.5)]" />
            </div>
            <div className="h-1.5 bg-muted/10 rounded-full overflow-hidden">
              <div style={{ width: `${draw}%`, transition: "width 0.8s ease-out" }} className="h-full bg-gradient-to-r from-muted to-muted/70 rounded-full" />
            </div>
            <div className="h-1.5 bg-teal/10 rounded-full overflow-hidden">
              <div style={{ width: `${awayWin}%`, transition: "width 0.8s ease-out" }} className="h-full bg-gradient-to-r from-teal to-teal/70 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/${locale}/matches/${event.idEvent}`}
            className="group/btn flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-bold uppercase tracking-wider hover:bg-lime/20 hover:border-lime/50 hover:shadow-[0_0_20px_rgba(217,249,157,0.2)] transition-all relative overflow-hidden"
          >
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <Target size={13} className="relative z-10" />
            <span className="relative z-10">{t.predict}</span>
            <ChevronRight size={13} className="relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}

function AIPredictionCardSkeleton() {
  return (
    <div className="bg-surface/60 border border-edge/70 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-10" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full rounded-full mb-1.5" />
      <Skeleton className="h-1.5 w-full rounded-full mb-1.5" />
      <Skeleton className="h-1.5 w-full rounded-full mb-5" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

// ─── AI vs User Battle Card ───
function BattleCard({ locale, t }: { locale: string; t: Translations }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#1a0a2e] via-[#0F0A1F] to-[#2a0a3e] p-8 lg:p-10">
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
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative grid lg:grid-cols-2 gap-8 items-center">
        {/* Left — Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 mb-4">
            <Swords size={12} className="text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
              {t.battleSubtitle}
            </span>
          </div>

          <h3 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            {t.battleTitle}
          </h3>

          <p className="text-sm lg:text-base text-purple-200/70 leading-relaxed mb-6 max-w-md">
            {locale === 'ka'
              ? 'AI აანალიზებს ყველა მატჩს — შენც შეგიძლია შენი პროგნოზი გააკეთო და შეადარო.'
              : locale === 'ru'
              ? 'AI анализирует каждый матч — ты тоже можешь сделать прогноз и сравнить.'
              : 'AI analyzes every match — you can make your prediction and compare.'}
          </p>

          <Link
            href={`/${locale}/predictions`}
            className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-ink font-black text-sm overflow-hidden hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <Rocket size={16} className="relative z-10" />
            <span className="relative z-10">{t.ctaButton}</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right — Visual */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {/* AI side */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-400/15 to-amber-400/5 border border-amber-400/30 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3">
                <Brain size={18} className="text-amber-300" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300/80 font-black mb-1">
                AI
              </div>
              <div className="font-mono text-2xl font-black text-amber-200">78%</div>
              <div className="text-[10px] text-purple-200/50 mt-1">
                {t.aiThinking}
              </div>
            </div>

            {/* User side */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-500/30 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-3">
                <Users size={18} className="text-purple-300" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-purple-300/80 font-black mb-1">
                YOU
              </div>
              <div className="font-mono text-2xl font-black text-purple-200">?</div>
              <div className="text-[10px] text-purple-200/50 mt-1">
                {t.yourTurn}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card (with animated counter) ───
function StatCard({
  icon: Icon,
  value,
  suffix = '',
  label,
  color = 'lime',
}: {
  icon: typeof Zap;
  value: number;
  suffix?: string;
  label: string;
  color?: 'lime' | 'teal' | 'gold' | 'danger' | 'purple';
}) {
  const colorMap = {
    lime: {
      text: 'text-lime',
      bg: 'bg-lime/10',
      border: 'border-lime/30',
      glow: 'shadow-[0_0_30px_rgba(217,249,157,0.15)]',
      line: 'via-lime/60',
    },
    teal: {
      text: 'text-teal',
      bg: 'bg-teal/10',
      border: 'border-teal/30',
      glow: 'shadow-[0_0_30px_rgba(20,184,166,0.15)]',
      line: 'via-teal/60',
    },
    gold: {
      text: 'text-gold',
      bg: 'bg-gold/10',
      border: 'border-gold/30',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]',
      line: 'via-gold/60',
    },
    danger: {
      text: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
      line: 'via-danger/60',
    },
    purple: {
      text: 'text-purple-300',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
      line: 'via-purple-400/60',
    },
  };
  const c = colorMap[color];

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-6 hover:border-lime/40 transition-all duration-500 hover:-translate-y-1">
      {/* Top line */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${c.line} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* Glow */}
      <div className={`absolute inset-0 ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform`}
        >
          <Icon size={24} className={c.text} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-mono text-3xl lg:text-4xl font-black ${c.text} leading-none mb-1.5 tabular-nums`}>
            <AnimatedCounter value={value} />
            {suffix}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted font-black">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Card ───
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
  color = 'lime',
}: {
  icon: typeof Zap;
  title: string;
  description: string;
  index: number;
  color?: 'lime' | 'teal' | 'gold' | 'purple' | 'danger';
}) {
  const gradient =
    color === 'lime'
      ? 'from-lime to-teal'
      : color === 'teal'
      ? 'from-teal to-cyan-400'
      : color === 'gold'
      ? 'from-gold to-orange-400'
      : color === 'purple'
      ? 'from-purple-400 to-pink-400'
      : 'from-danger to-rose-400';

  const glow =
    color === 'lime'
      ? 'rgba(217,249,157,0.3)'
      : color === 'teal'
      ? 'rgba(20,184,166,0.3)'
      : color === 'gold'
      ? 'rgba(251,191,36,0.3)'
      : color === 'purple'
      ? 'rgba(168,85,247,0.3)'
      : 'rgba(239,68,68,0.3)';

  return (
    <TiltCard intensity={5}>
      <div className="group relative bg-gradient-to-br from-surface/60 via-surface/40 to-surface/60 backdrop-blur-xl border border-edge/70 rounded-2xl p-7 hover:border-lime/40 transition-all duration-500 overflow-hidden h-full">
        {/* Big glow */}
        <div className={`absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`} />

        {/* Top line */}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} style={{ backgroundImage: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />

        <div className="relative">
          {/* Icon */}
          <div className="relative mb-6">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
              style={{ boxShadow: `0 0 30px ${glow}` }}
            >
              <Icon size={24} className="text-ink" strokeWidth={2.3} />
            </div>
            <span className="absolute -top-2 -right-2 font-mono text-[11px] font-black text-lime bg-ink/90 px-2 py-1 rounded-md border border-lime/30 backdrop-blur-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <h3 className="font-heading text-lg lg:text-xl font-bold text-text mb-2.5 group-hover:text-lime transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </TiltCard>
  );
}

// ─── Team Card ───
function TeamCard({
  team,
  locale,
  t,
}: {
  team: SportsDBTeam;
  locale: string;
  t: Translations;
}) {

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(217,249,157,0.2)]">
      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col items-center text-center">
        {/* Badge */}
        <div className="relative w-20 h-20 mb-4 group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-lime/20 to-teal/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
          <Image
            src={team.strTeamBadge || `https://www.thesportsdb.com/images/media/team/badge/${team.idTeam}.png`}
            alt={team.strTeam}
            fill
            sizes="80px"
            className="object-contain relative z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            unoptimized
          />
        </div>

        {/* Name */}
        <h4 className="font-heading text-sm lg:text-base font-bold text-text truncate w-full mb-1 group-hover:text-lime transition-colors">
          {team.strTeam}
        </h4>

        {/* League */}
        {team.strLeague && (
          <div className="text-[10px] uppercase tracking-widest text-muted font-bold mb-3 truncate w-full">
            {team.strLeague}
          </div>
        )}

        {/* Follow button */}
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-surface/60 border border-edge/60 text-muted group-hover:border-lime/40 group-hover:text-lime">
          <ChevronRight size={12} />
          <span>{t.viewAll}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ───
function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Trophy;
  title: string;
  hint?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Icon size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <p className="text-base lg:text-lg text-muted font-medium">{title}</p>
        {hint && <p className="mt-2 text-xs text-muted/70">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ASYNC SECTIONS
// ═══════════════════════════════════════════════════════════════

// ─── Hero Match Marquee ───
async function HeroMatchSection({ locale }: { locale: string }) {
  const liveMatchesRaw = await getLiveScores('Soccer').catch(() => []);
  const liveMatches = Array.isArray(liveMatchesRaw) ? liveMatchesRaw : [];

  const marqueeMatches = liveMatches.slice(0, 10).map((m) => {
    const d = prepareMatchData(m);
    return {
      id: m.idEvent,
      home: m.strHomeTeam,
      away: m.strAwayTeam,
      scoreHome: d.scoreHome ?? '-',
      scoreAway: d.scoreAway ?? '-',
      league: m.strLeague,
    };
  });

  const t = getT(locale);

  if (marqueeMatches.length === 0) return null;

  return <LiveMarquee matches={marqueeMatches} locale={locale} liveLabel={t.liveNow} />;
}

function HeroMatchSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <Skeleton className="w-full h-12 rounded-2xl" />
    </div>
  );
}

// ─── Stats Section ───
async function StatsSection({ locale, t }: { locale: string; t: Translations }) {
  const [liveMatchesRaw, upcomingRaw] = await Promise.all([
    getLiveScores('Soccer').catch(() => []),
    getNextLeagueEvents(POPULAR_LEAGUES.PREMIER_LEAGUE.id).catch(() => []),
  ]);

  const liveCount = Array.isArray(liveMatchesRaw) ? liveMatchesRaw.length : 0;
  const upcomingCount = Array.isArray(upcomingRaw) ? upcomingRaw.length : 0;
  const totalCount = (liveCount + upcomingCount) * 47 || 2400;

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.stats}
          subtitle={t.statsSubtitle}
          href={`/${locale}/analytics`}
          viewAll={t.viewAll}
          accent="teal"
          icon={BarChart3}
          badge="LIVE DATA"
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ScrollReveal delay={0}>
          <StatCard icon={Radio} value={liveCount} suffix="+" label={t.liveMatches} color="danger" />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <StatCard icon={Trophy} value={totalCount} suffix="+" label={t.totalMatches} color="lime" />
        </ScrollReveal>
        <ScrollReveal delay={0.16}>
          <StatCard icon={Target} value={78} suffix="%" label={t.predictionAccuracy} color="teal" />
        </ScrollReveal>
        <ScrollReveal delay={0.24}>
          <StatCard icon={Globe} value={200} suffix="+" label={t.leaguesCovered} color="gold" />
        </ScrollReveal>
      </div>
    </Section>
  );
}

function StatsSkeleton() {
  return (
    <Section spacing="lg" containerSize="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </Section>
  );
}

// ─── Live Matches ───
async function LiveMatchesSection({ locale, t }: { locale: string; t: Translations }) {
  const liveMatchesRaw = await getLiveScores('Soccer').catch(() => []);
  const liveMatches = Array.isArray(liveMatchesRaw) ? liveMatchesRaw : [];
  const otherLiveMatches = liveMatches.slice(1, 7);

  if (otherLiveMatches.length === 0) return null;

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.liveNow}
          subtitle={t.liveSubtitle}
          href={`/${locale}/matches`}
          viewAll={t.viewAll}
          accent="danger"
          icon={Radio}
          badge="● LIVE"
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {otherLiveMatches.map((match, i) => (
          <ScrollReveal key={match.idEvent} delay={i * 0.06}>
            <MatchMiniCard event={match} locale={locale} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}

function LiveMatchesSkeleton() {
  return (
    <Section spacing="lg" containerSize="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchMiniCardSkeleton key={i} />
        ))}
      </div>
    </Section>
  );
}

// ─── Top Matches (Featured) ───
async function TopMatchesSection({ locale, t }: { locale: string; t: Translations }) {
  const upcomingRaw = await getNextLeagueEvents(POPULAR_LEAGUES.PREMIER_LEAGUE.id).catch(() => []);
  const upcoming = Array.isArray(upcomingRaw) ? upcomingRaw : [];
  const topMatches = upcoming.slice(0, 3);

  if (topMatches.length === 0) return null;

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.topMatches}
          subtitle={t.topMatchesSubtitle}
          href={`/${locale}/matches`}
          viewAll={t.viewAll}
          accent="gold"
          icon={Star}
          badge="★ FEATURED"
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {topMatches.map((match, i) => (
          <ScrollReveal key={match.idEvent} delay={i * 0.1}>
            <FeaturedMatchCard event={match} locale={locale} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}

// ─── AI Predictions ───
async function AIPredictionsSection({ locale, t }: { locale: string; t: Translations }) {
  const upcomingPLRaw = await getNextLeagueEvents(POPULAR_LEAGUES.PREMIER_LEAGUE.id).catch(() => []);
  const upcomingPL = Array.isArray(upcomingPLRaw) ? upcomingPLRaw : [];
  const upcomingMatches = upcomingPL.slice(0, 6);

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.predictions}
          subtitle={t.predictionsSubtitle}
          href={`/${locale}/predictions`}
          viewAll={t.viewAll}
          accent="lime"
          icon={Zap}
          badge="AI POWERED"
        />
      </ScrollReveal>
      {upcomingMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcomingMatches.map((match, i) => (
            <ScrollReveal key={match.idEvent} delay={i * 0.08}>
              <AIPredictionCard event={match} locale={locale} t={t} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal delay={0.1}>
          <EmptyState icon={Target} title={t.noUpcoming} />
        </ScrollReveal>
      )}
    </Section>
  );
}

function AIPredictionsSkeleton() {
  return (
    <Section spacing="lg" containerSize="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <AIPredictionCardSkeleton key={i} />
        ))}
      </div>
    </Section>
  );
}

// ─── News Section ───
async function NewsSection({ locale, t }: { locale: string; t: Translations }) {
  const newsRaw = await getAllRSSNews(8).catch(() => []);
  const news = (newsRaw || []).map(normalizeArticle);

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.news}
          subtitle={t.newsSubtitle}
          href={`/${locale}/news`}
          viewAll={t.viewAll}
          accent="teal"
          icon={Newspaper}
          badge="FRESH"
        />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <NewsGrid
          news={news}
          locale={locale}
          variant="default"
          showFilter={false}
          showFeatured={true}
          emptyMessage={t.noNews}
        />
      </ScrollReveal>
    </Section>
  );
}

function NewsSkeleton() {
  return (
    <Section spacing="lg" containerSize="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface/60 border border-edge rounded-2xl overflow-hidden">
            <Skeleton className="w-full aspect-video" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Videos Section ───
async function VideosSection({ locale, t }: { locale: string; t: Translations }) {
  let videos: YouTubeVideo[] = [];
  try {
    videos = await getVideosFromMultipleChannels(DEFAULT_CHANNELS, 2);
  } catch {
    videos = [];
  }

  const topVideos = videos.slice(0, 6);

  if (topVideos.length === 0) return null;

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.videos}
          subtitle={t.videosSubtitle}
          href={`/${locale}/videos`}
          viewAll={t.viewAll}
          accent="purple"
          icon={Video}
          badge="🎬 YOUTUBE"
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topVideos.map((video, i) => (
          <ScrollReveal key={video.id} delay={i * 0.06}>
            <VideoCard
              id={video.id}
              youtubeId={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channel={video.channelTitle}
              publishedAt={video.publishedAt}
              locale={locale}
              variant="default"
              category="highlights"
            />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}

function VideosSkeleton() {
  return (
    <Section spacing="lg" containerSize="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface/60 border border-edge rounded-2xl overflow-hidden">
            <Skeleton className="w-full aspect-video" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Teams Section ───
async function TeamsSection({ locale, t }: { locale: string; t: Translations }) {
  let teams: SportsDBTeam[] = [];
  try {
    teams = await getAllTeamsInLeague('English Premier League');
  } catch {
    teams = [];
  }

  const topTeams = teams.slice(0, 8);

  if (topTeams.length === 0) return null;

  return (
    <Section spacing="lg" containerSize="lg">
      <ScrollReveal>
        <SectionHeader
          title={t.teams}
          subtitle={t.teamsSubtitle}
          href={`/${locale}/teams`}
          viewAll={t.viewAll}
          accent="lime"
          icon={Shield}
          badge="⚽ CLUBS"
        />
      </ScrollReveal>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {topTeams.map((team, i) => (
          <ScrollReveal key={team.idTeam} delay={i * 0.05}>
            <TeamCard team={team} locale={locale} t={t} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════════════
            1. HERO BANNER
        ═══════════════════════════════════════════════════ */}
        <BannerHero locale={locale} />

        {/* ═══════════════════════════════════════════════════
            2. LIVE MARQUEE
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<HeroMatchSkeleton />}>
          <HeroMatchSection locale={locale} />
        </Suspense>

        {/* ═══════════════════════════════════════════════════
            3. STATS BAR
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection locale={locale} t={t} />
        </Suspense>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════
            4. LIVE MATCHES
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<LiveMatchesSkeleton />}>
          <LiveMatchesSection locale={locale} t={t} />
        </Suspense>

        {/* ═══════════════════════════════════════════════════
            5. CINEMATIC BANNER
        ═══════════════════════════════════════════════════ */}
        <BannerCinematic locale={locale} />

        {/* ═══════════════════════════════════════════════════
            6. TOP MATCHES
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<LiveMatchesSkeleton />}>
          <TopMatchesSection locale={locale} t={t} />
        </Suspense>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════
            7. AI PREDICTIONS
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<AIPredictionsSkeleton />}>
          <AIPredictionsSection locale={locale} t={t} />
        </Suspense>

        {/* ═══════════════════════════════════════════════════
            8. SPOTLIGHT BANNER
        ═══════════════════════════════════════════════════ */}
        <BannerSpotlight locale={locale} />

        {/* ═══════════════════════════════════════════════════
            9. BATTLE SECTION — AI vs User
        ═══════════════════════════════════════════════════ */}
        <Section spacing="lg" containerSize="lg">
          <ScrollReveal>
            <BattleCard locale={locale} t={t} />
          </ScrollReveal>
        </Section>

        {/* ═══════════════════════════════════════════════════
            10. NEWS
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<NewsSkeleton />}>
          <NewsSection locale={locale} t={t} />
        </Suspense>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════
            11. VIDEOS
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<VideosSkeleton />}>
          <VideosSection locale={locale} t={t} />
        </Suspense>

        {/* ═══════════════════════════════════════════════════
            12. TEAMS SPOTLIGHT
        ═══════════════════════════════════════════════════ */}
        <Suspense fallback={<VideosSkeleton />}>
          <TeamsSection locale={locale} t={t} />
        </Suspense>

        {/* ═══════════════════════════════════════════════════
            13. TRIO BANNER
        ═══════════════════════════════════════════════════ */}
        <BannerTrio locale={locale} />

        {/* ═══════════════════════════════════════════════════
            14. WHY US
        ═══════════════════════════════════════════════════ */}
        <Section spacing="xl" containerSize="lg">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/30 mb-5">
                <Sparkles size={13} className="text-lime" />
                <span className="text-[10px] font-black text-lime uppercase tracking-widest">
                  Features
                </span>
              </div>
              <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-text tracking-tight">
                {t.whyUs}
              </h2>
              <p className="mt-4 text-base lg:text-lg text-muted max-w-2xl mx-auto">
                {t.whyUsSubtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                color: 'lime' as const,
                ka: ['AI პროგნოზები', 'ჭკვიანი ალგორითმები ყოველ მატჩზე'],
                en: ['AI Predictions', 'Smart algorithms for every match'],
                ru: ['AI прогнозы', 'Умные алгоритмы на каждый матч'],
              },
              {
                icon: Radio,
                color: 'danger' as const,
                ka: ['რეალურ დროში', 'ცოცხალი ანგარიშები 30 წამში'],
                en: ['Real-time', 'Live scores refreshed every 30s'],
                ru: ['Реальное время', 'Живые счета каждые 30 секунд'],
              },
              {
                icon: Globe,
                color: 'teal' as const,
                ka: ['სამი ენა', 'ქართული, ინგლისური, რუსული'],
                en: ['Three Languages', 'Georgian, English, Russian'],
                ru: ['Три языка', 'Грузинский, английский, русский'],
              },
              {
                icon: MessageCircle,
                color: 'purple' as const,
                ka: ['ორი მხარე', 'ფანების აზრები ცალ-ცალკე'],
                en: ['Two Sides', 'Fan opinions separated'],
                ru: ['Две стороны', 'Мнения фанатов отдельно'],
              },
              {
                icon: Crown,
                color: 'gold' as const,
                ka: ['ლიდერბორდი', 'შეადარე პროგნოზები სხვებს'],
                en: ['Leaderboard', 'Compare predictions with others'],
                ru: ['Лидерборд', 'Сравнивай прогнозы с другими'],
              },
              {
                icon: Gem,
                color: 'teal' as const,
                ka: ['უფასო სამუდამოდ', 'ყველა ფუნქცია უფასოა'],
                en: ['Free Forever', 'All features are free'],
                ru: ['Бесплатно навсегда', 'Все функции бесплатны'],
              },
            ].map((f, i) => {
              const [title, desc] =
                locale === 'ka' ? f.ka : locale === 'ru' ? f.ru : f.en;
              return (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <FeatureCard
                    icon={f.icon}
                    title={title}
                    description={desc}
                    index={i}
                    color={f.color}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            15. PROMO BANNER
        ═══════════════════════════════════════════════════ */}
        <BannerPromo locale={locale} />

        {/* ═══════════════════════════════════════════════════
            16. VIDEO SHOWCASE
        ═══════════════════════════════════════════════════ */}
        <VideoShowcase locale={locale} videoSrc="/icons/video.mp4" />

        {/* ═══════════════════════════════════════════════════
            17. NEWSLETTER
        ═══════════════════════════════════════════════════ */}
        <Section spacing="lg" containerSize="lg">
          <ScrollReveal>
            <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-3xl p-10 lg:p-16">
              {/* Top line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

              {/* Glows */}
              <div className="absolute -top-32 -right-32 w-72 h-72 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-teal flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(217,249,157,0.4)]">
                  <Mail size={26} className="text-ink" />
                </div>
                <h3 className="font-heading text-2xl lg:text-4xl font-black text-text mb-4">
                  {t.newsletter}
                </h3>
                <p className="text-sm lg:text-base text-muted mb-8 max-w-md mx-auto">
                  {t.newsletterDesc}
                </p>

                <form className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    className="flex-1 px-5 py-4 rounded-2xl bg-ink border border-edge text-text placeholder:text-muted/60 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime/40 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    className="group relative px-8 py-4 rounded-2xl bg-lime text-ink font-black text-sm hover:shadow-[0_0_32px_rgba(217,249,157,0.6)] transition-all whitespace-nowrap overflow-hidden"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <span className="relative z-10">{t.subscribe}</span>
                  </button>
                </form>

                <p className="mt-5 text-[10px] text-muted flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={11} className="text-lime" />
                  <span>{t.noSpam}</span>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Section>

        {/* ═══════════════════════════════════════════════════
            18. FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <Section spacing="xl" containerSize="lg">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border border-lime/20 bg-gradient-to-br from-ink via-surface/40 to-ink p-10 lg:p-16">
              {/* Glows */}
              <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-lime/15 rounded-full blur-[160px] pointer-events-none" />
              <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-teal/15 rounded-full blur-[160px] pointer-events-none" />

              {/* Lines */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent" />

              {/* Grid */}
              <div className="absolute inset-0 grid-bg opacity-30" />

              <div className="relative max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 border border-lime/30 backdrop-blur-sm mb-6">
                  <Sparkles size={14} className="text-lime" />
                  <span className="text-xs font-black text-lime uppercase tracking-widest">
                    {locale === 'ka' ? 'ახალი' : locale === 'ru' ? 'Новое' : 'New'}
                  </span>
                </div>
                <h2 className="font-heading text-3xl lg:text-5xl xl:text-6xl font-black text-text leading-tight tracking-tight mb-5">
                  {t.ctaTitle}
                </h2>
                <p className="text-base lg:text-lg text-muted leading-relaxed mb-10 max-w-lg mx-auto">
                  {t.ctaDesc}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={`/${locale}/predictions`}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-lime text-ink font-black text-sm lg:text-base overflow-hidden hover:shadow-[0_0_50px_rgba(217,249,157,0.6)] transition-all"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <Zap size={18} fill="currentColor" className="relative z-10" />
                    <span className="relative z-10">{t.ctaButton}</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/${locale}/authorization`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge text-text font-bold text-sm lg:text-base hover:border-lime/40 hover:bg-surface/80 transition-all"
                  >
                    <Users size={18} />
                    <span>{t.register}</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Section>
      </div>
    </div>
  );
}
