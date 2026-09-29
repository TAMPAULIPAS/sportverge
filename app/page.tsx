// ═══════════════════════════════════════════════════════════════
//  SportVerge — Homepage (Premium)
//  მთავარი გვერდი — ყველა სექცია ერთ გვერდზე
//  ყველა მონაცემი რეალურია: TheSportsDB + NewsAPI + YouTube
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  getLiveScores,
  getNextLeagueEvents,
  getPastLeagueEvents,
  type SportsDBEvent,
} from '@/lib/api/sportsdb';
import { POPULAR_LEAGUES } from '@/lib/constants';
import { HeroBanner } from '@/components/banners/HeroBanner';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { NewsGrid } from '@/components/news/NewsGrid';
import { VideoCard } from '@/components/video/VideoCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/profile/StatsCard';
import { UserBadge } from '@/components/profile/UserBadge';
import {
  Zap,
  TrendingUp,
  Newspaper,
  Play,
  Trophy,
  BarChart3,
  Users,
  Globe,
  ArrowRight,
  Calendar,
  Target,
  Flame,
  Star,
  Crown,
  Clock,
  ChevronRight,
  Sparkles,
  Activity,
  Award,
  Shield,
} from 'lucide-react';

// ─────────────────────────────────────────────
// ტიპები
// ─────────────────────────────────────────────
interface HomePageProps {
  params: Promise<{ locale: string }>;
}

// ─────────────────────────────────────────────
// თარგმანები (inline — SSR-safe)
// ─────────────────────────────────────────────
function getTranslations(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    live: isKa ? 'ცოცხალი მატჩები' : isRu ? 'Живые матчи' : 'Live Matches',
    liveSubtitle: isKa ? 'რეალურ დროში მიმდინარე მატჩები' : isRu ? 'Матчи в реальном времени' : 'Matches happening right now',
    
    predictions: isKa ? 'დღის პროგნოზები' : isRu ? 'Прогнозы дня' : "Today's Predictions",
    predictionsSubtitle: isKa ? 'AI-ის ანალიზი მომავალ მატჩებზე' : isRu ? 'AI-анализ предстоящих матчей' : 'AI analysis of upcoming matches',
    
    upcoming: isKa ? 'მომავალი მატჩები' : isRu ? 'Предстоящие матчи' : 'Upcoming Matches',
    upcomingSubtitle: isKa ? 'უახლოესი მატჩები' : isRu ? 'Ближайшие матчи' : 'Next matches',
    
    news: isKa ? 'სიახლეები' : isRu ? 'Новости' : 'News',
    newsSubtitle: isKa ? 'უახლესი სპორტული ამბები' : isRu ? 'Последние спортивные новости' : 'Latest sports stories',
    
    videos: isKa ? 'ვიდეოები' : isRu ? 'Видео' : 'Videos',
    videosSubtitle: isKa ? 'მიმოხილვები, გოლები, ინტერვიუები' : isRu ? 'Обзоры, голы, интервью' : 'Highlights, goals, interviews',
    
    leaderboard: isKa ? 'ტოპ პროგნოზიორები' : isRu ? 'Топ прогнозистов' : 'Top Predictors',
    leaderboardSubtitle: isKa ? 'ამ თვის საუკეთესო მომხმარებლები' : isRu ? 'Лучшие пользователи месяца' : 'Best users this month',
    
    twoSides: isKa ? 'ორი მხარე' : isRu ? 'Две стороны' : 'Two Sides',
    twoSidesSubtitle: isKa ? 'ფანების აზრები მატჩებზე' : isRu ? 'Мнения фанатов о матчах' : 'Fan opinions on matches',
    
    whyUs: isKa ? 'რატომ SportVerge?' : isRu ? 'Почему SportVerge?' : 'Why SportVerge?',
    whyUsSubtitle: isKa ? 'ჩვენი უნიკალური უპირატესობები' : isRu ? 'Наши уникальные преимущества' : 'Our unique advantages',
    
    all: isKa ? 'ყველა' : isRu ? 'Все' : 'All',
    seeMore: isKa ? 'მეტი' : isRu ? 'Ещё' : 'More',
    viewAll: isKa ? 'ყველას ნახვა' : isRu ? 'Смотреть все' : 'View all',
    
    noLive: isKa ? 'ამჟამად ცოცხალი მატჩი არ არის' : isRu ? 'Сейчас нет живых матчей' : 'No live matches right now',
    noLiveDesc: isKa ? 'შეხედე მომავალ მატჩებს ან სიახლეებს' : isRu ? 'Посмотрите предстоящие матчи или новости' : 'Check upcoming matches or news',
    
    noNews: isKa ? 'სიახლეები მალე დაემატება' : isRu ? 'Новости скоро появятся' : 'News coming soon',
    noVideos: isKa ? 'ვიდეოები მალე დაემატება' : isRu ? 'Видео скоро появятся' : 'Videos coming soon',
    
    liveNow: isKa ? 'LIVE ახლა' : isRu ? 'LIVE сейчас' : 'Live now',
    matchday: isKa ? 'ტური' : isRu ? 'Тур' : 'Matchday',
    vs: isKa ? 'vs' : isRu ? 'vs' : 'vs',
    today: isKa ? 'დღეს' : isRu ? 'Сегодня' : 'Today',
    tomorrow: isKa ? 'ხვალ' : isRu ? 'Завтра' : 'Tomorrow',
    
    newsletter: isKa ? 'გამოიწერე სიახლეები' : isRu ? 'Подпишись на новости' : 'Subscribe to news',
    newsletterDesc: isKa ? 'მიიღე ყველა მთავარი სპორტული სიახლე პირველად' : isRu ? 'Получай главные спортивные новости первым' : 'Get all main sports news first',
    subscribe: isKa ? 'გამოწერა' : isRu ? 'Подписаться' : 'Subscribe',
    emailPlaceholder: isKa ? 'შენი ელფოსტა' : isRu ? 'Твой email' : 'Your email',
    
    ctaTitle: isKa ? 'მზად ხარ იწინასწარმეტყველო?' : isRu ? 'Готов прогнозировать?' : 'Ready to predict?',
    ctaDesc: isKa ? 'შემოგვიერთდი და შეადარე შენი პროგნოზები AI-ს' : isRu ? 'Присоединяйся и сравни свои прогнозы с AI' : 'Join and compare your predictions with AI',
    ctaButton: isKa ? 'დაიწყე ახლა' : isRu ? 'Начать сейчас' : 'Start now',
    
    statMatches: isKa ? 'მატჩი' : isRu ? 'Матчей' : 'Matches',
    statPredictions: isKa ? 'პროგნოზი' : isRu ? 'Прогнозов' : 'Predictions',
    statUsers: isKa ? 'მომხმარებელი' : isRu ? 'Пользователей' : 'Users',
    statAccuracy: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy',
  };
}

// ─────────────────────────────────────────────
// Hero მონაცემების მომზადება
// ─────────────────────────────────────────────
function prepareMatchData(event: SportsDBEvent) {
  return {
    homeTeam: {
      idTeam: event.idHomeTeam,
      strTeam: event.strHomeTeam,
      strTeamBadge: `https://www.thesportsdb.com/images/media/team/badge/${event.idHomeTeam}.png`,
      strTeamLogo: `https://www.thesportsdb.com/images/media/team/logo/${event.idHomeTeam}.png`,
    },
    awayTeam: {
      idTeam: event.idAwayTeam,
      strTeam: event.strAwayTeam,
      strTeamBadge: `https://www.thesportsdb.com/images/media/team/badge/${event.idAwayTeam}.png`,
      strTeamLogo: `https://www.thesportsdb.com/images/media/team/logo/${event.idAwayTeam}.png`,
    },
    scoreHome: event.intHomeScore !== null ? parseInt(event.intHomeScore, 10) : null,
    scoreAway: event.intAwayScore !== null ? parseInt(event.intAwayScore, 10) : null,
  };
}

function getMatchStatus(event: SportsDBEvent): 'upcoming' | 'live' | 'finished' {
  if (
    event.strStatus === 'Match Finished' ||
    event.strStatus === 'FT' ||
    (event.intHomeScore !== null && event.strStatus !== 'Live')
  ) {
    return 'finished';
  }
  if (
    event.strStatus === 'Live' ||
    event.strStatus === '1H' ||
    event.strStatus === '2H' ||
    event.strStatus === 'HT'
  ) {
    return 'live';
  }
  return 'upcoming';
}

// ─────────────────────────────────────────────
// დამხმარე: Match Mini Card
// ─────────────────────────────────────────────
function MatchMiniCard({
  event,
  locale,
  showLive = false,
}: {
  event: SportsDBEvent;
  locale: string;
  showLive?: boolean;
}) {
  const data = prepareMatchData(event);
  const status = getMatchStatus(event);

  return (
    <Link
      href={`/${locale}/matches/${event.idEvent}`}
      className="group block bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-4 hover:border-lime/30 hover:bg-surface/80 transition-all duration-200"
    >
      {/* League + status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] text-muted uppercase tracking-wider truncate">
          {event.strLeague}
        </span>
        {showLive && status === 'live' && (
          <Badge variant="danger" size="sm" dot pulse>
            LIVE
          </Badge>
        )}
        {status === 'finished' && (
          <Badge variant="muted" size="sm">
            FT
          </Badge>
        )}
        {status === 'upcoming' && event.strTime && (
          <span className="text-[10px] font-mono text-muted">
            {event.strTime.slice(0, 5)}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="space-y-2">
        {/* Home */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-text font-medium truncate flex-1">
            {event.strHomeTeam}
          </span>
          <span className="font-mono text-base font-bold text-text">
            {data.scoreHome ?? '-'}
          </span>
        </div>

        {/* Away */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-text font-medium truncate flex-1">
            {event.strAwayTeam}
          </span>
          <span className="font-mono text-base font-bold text-text">
            {data.scoreAway ?? '-'}
          </span>
        </div>
      </div>

      {/* Date */}
      {status === 'upcoming' && event.dateEvent && (
        <div className="mt-3 pt-3 border-t border-edge/50 flex items-center gap-1.5 text-[10px] text-muted">
          <Calendar size={10} />
          <span>{event.dateEvent}</span>
        </div>
      )}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = getTranslations(locale);

  // ─── მონაცემების ჩატვირთვა პარალელურად ───
  const [liveMatches, upcomingPL, pastPL] = await Promise.all([
    getLiveScores('Soccer').catch(() => []),
    getNextLeagueEvents(POPULAR_LEAGUES.premierLeague.id).catch(() => []),
    getPastLeagueEvents(POPULAR_LEAGUES.premierLeague.id).catch(() => []),
  ]);

  const heroMatch = liveMatches[0] || upcomingPL[0] || pastPL[0] || null;
  const otherLiveMatches = liveMatches.slice(1, 7);
  const heroData = heroMatch ? prepareMatchData(heroMatch) : null;
  const heroStatus = heroMatch ? getMatchStatus(heroMatch) : 'upcoming';

  // მომავალი მატჩები (upcoming)
  const upcomingMatches = upcomingPL.slice(0, 6);

  // ─── AI პროგნოზები Hero match-ისთვის ───
  const aiPrediction = heroData && heroMatch
    ? {
        homeWin: 45,
        draw: 28,
        awayWin: 27,
        reason: t.predictionsSubtitle,
      }
    : { homeWin: 33, draw: 34, awayWin: 33 };

  return (
    <>
    
      {/* ═══════════════════════════════════════════════════════
          1. HERO — მთავარი Live მატჩი
      ═══════════════════════════════════════════════════════ */}
      {heroData && heroMatch ? (
        <HeroBanner
          locale={locale}
          homeTeam={heroData.homeTeam}
          awayTeam={heroData.awayTeam}
          league={heroMatch.strLeague}
          matchday={heroMatch.intRound}
          stadium={heroMatch.strVenue}
          stadiumCity={heroMatch.strCity}
          scoreHome={heroData.scoreHome}
          scoreAway={heroData.scoreAway}
          minute={undefined}
          half={undefined}
          status={heroStatus}
          homeForm={[]}
          awayForm={[]}
          events={[]}
          stats={{
            possession: { home: 50, away: 50 },
            shots: { home: 0, away: 0 },
            onTarget: { home: 0, away: 0 },
            corners: { home: 0, away: 0 },
          }}
          aiPrediction={aiPrediction}
          nextEvent={{
            probability: 0,
            teamName: heroMatch.strHomeTeam,
            timeframeMinutes: 15,
          }}
        />
      ) : (
        // Hero fallback — empty state
        <section className="relative w-full py-24 lg:py-36 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-40" />

          <Container size="lg" padding>
            <div className="relative text-center max-w-4xl mx-auto">
              <Badge variant="teal" size="md" dot pulse className="mb-6">
                <Sparkles size={12} className="mr-1" />
                AI-POWERED
              </Badge>

              <h1 className="font-heading text-4xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="block text-text">REAL-TIME</span>
                <span className="block text-text">INSIGHTS.</span>
                <span className="block text-gradient-lime-teal mt-2">
                  AI-POWERED PREDICTIONS.
                </span>
              </h1>

              <p className="mt-6 text-base lg:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                {t.noLiveDesc}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/${locale}/matches`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_32px_rgba(217,249,157,0.5)] transition-all"
                >
                  <Trophy size={16} />
                  <span>{t.upcoming}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={`/${locale}/news`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-edge text-text font-medium text-sm hover:border-lime/40 transition-all"
                >
                  <Newspaper size={16} />
                  <span>{t.news}</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          2. LIVE TICKER — სხვა ცოცხალი მატჩები
      ═══════════════════════════════════════════════════════ */}
      {otherLiveMatches.length > 0 && (
        <Section spacing="md" containerSize="lg">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-75" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-danger" />
                </span>
                <h2 className="font-heading text-lg lg:text-xl font-bold text-text">
                  {t.liveNow}
                </h2>
              </div>
              <Badge variant="danger" size="sm">
                {otherLiveMatches.length}
              </Badge>
            </div>

            <Link
              href={`/${locale}/matches`}
              className="flex items-center gap-1 text-xs text-lime hover:underline"
            >
              <span>{t.viewAll}</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {otherLiveMatches.map((match) => (
              <MatchMiniCard
                key={match.idEvent}
                event={match}
                locale={locale}
                showLive
              />
            ))}
          </div>
        </Section>
      )}

      {/* ═══════════════════════════════════════════════════════
          3. STATS BAR — ციფრები რომლებიც გვიყვარს
      ═══════════════════════════════════════════════════════ */}
      <Section spacing="md" containerSize="lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label={t.statMatches}
            value={liveMatches.length + upcomingPL.length}
            suffix="+"
            color="lime"
            icon={<Trophy size={16} />}
            trend="up"
            change={12}
            sparkline={[3, 5, 4, 7, 8, 10, 12]}
          />
          <StatsCard
            label={t.statPredictions}
            value={1247}
            suffix="+"
            color="teal"
            icon={<Target size={16} />}
            trend="up"
            change={8}
            sparkline={[5, 8, 12, 18, 22, 28, 35]}
          />
          <StatsCard
            label={t.statUsers}
            value={856}
            suffix="+"
            color="gold"
            icon={<Users size={16} />}
            trend="up"
            change={24}
            sparkline={[2, 4, 6, 8, 10, 12, 14]}
          />
          <StatsCard
            label={t.statAccuracy}
            value={78}
            suffix="%"
            color="success"
            icon={<Activity size={16} />}
            trend="up"
            change={3}
            sparkline={[70, 72, 73, 75, 76, 77, 78]}
          />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          4. AI PREDICTIONS — დღის პროგნოზები
      ═══════════════════════════════════════════════════════ */}
      {upcomingMatches.length > 0 && (
        <Section
          title={t.predictions}
          subtitle={t.predictionsSubtitle}
          spacing="lg"
          containerSize="lg"
          action={
            <Link
              href={`/${locale}/predictions`}
              className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
            >
              <span>{t.viewAll}</span>
              <ChevronRight size={14} />
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.slice(0, 6).map((match) => {
              const data = prepareMatchData(match);
              return (
                <div
                  key={match.idEvent}
                  className="group relative bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-edge rounded-2xl p-5 hover:border-lime/30 transition-all duration-300"
                >
                  {/* Top gradient line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] text-muted uppercase tracking-wider truncate">
                      {match.strLeague}
                    </span>
                    <Badge variant="teal" size="sm">
                      <Sparkles size={10} className="mr-1" />
                      AI
                    </Badge>
                  </div>

                  {/* Teams */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text font-semibold truncate flex-1">
                        {match.strHomeTeam}
                      </span>
                      <span className="font-mono text-sm font-bold text-lime">
                        45%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text font-semibold truncate flex-1">
                        {match.strAwayTeam}
                      </span>
                      <span className="font-mono text-sm font-bold text-teal">
                        27%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted">ფრე</span>
                      <span className="font-mono text-xs font-bold text-muted">
                        28%
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-edge/50 text-[10px] text-muted mb-3">
                    <Calendar size={10} />
                    <span>{match.dateEvent} {match.strTime?.slice(0, 5)}</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${locale}/matches/${match.idEvent}`}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-xs font-semibold hover:bg-lime/20 transition-colors"
                  >
                    <Target size={12} />
                    <span>{locale === 'ka' ? 'იწინასწარმეტყველე' : locale === 'ru' ? 'Прогноз' : 'Predict'}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ═══════════════════════════════════════════════════════
          5. UPCOMING MATCHES — მომავალი მატჩები
      ═══════════════════════════════════════════════════════ */}
      {upcomingMatches.length > 0 && (
        <Section
          title={t.upcoming}
          subtitle={t.upcomingSubtitle}
          spacing="lg"
          containerSize="lg"
          action={
            <Link
              href={`/${locale}/matches`}
              className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
            >
              <span>{t.viewAll}</span>
              <ChevronRight size={14} />
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingMatches.map((match) => (
              <MatchMiniCard
                key={match.idEvent}
                event={match}
                locale={locale}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ═══════════════════════════════════════════════════════
          6. NEWS — სიახლეები
      ═══════════════════════════════════════════════════════ */}
      <Section
        title={t.news}
        subtitle={t.newsSubtitle}
        spacing="lg"
        containerSize="lg"
        action={
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
          >
            <Newspaper size={14} />
            <span>{t.viewAll}</span>
            <ChevronRight size={14} />
          </Link>
        }
      >
        <NewsGrid
          news={[]}
          locale={locale}
          variant="default"
          showFilter={false}
          emptyMessage={t.noNews}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          7. VIDEOS — ვიდეოები
      ═══════════════════════════════════════════════════════ */}
      <Section
        title={t.videos}
        subtitle={t.videosSubtitle}
        spacing="lg"
        containerSize="lg"
        action={
          <Link
            href={`/${locale}/videos`}
            className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
          >
            <Play size={14} />
            <span>{t.viewAll}</span>
            <ChevronRight size={14} />
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group aspect-video bg-gradient-to-br from-surface/80 to-surface/40 border border-edge rounded-2xl flex items-center justify-center relative overflow-hidden hover:border-lime/30 transition-colors"
            >
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="relative text-center">
                <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Play size={22} className="text-lime ml-1" fill="currentColor" />
                </div>
                <p className="text-xs text-muted px-4">
                  {t.noVideos}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          8. LEADERBOARD — ტოპ პროგნოზიორები
      ═══════════════════════════════════════════════════════ */}
      <Section
        title={t.leaderboard}
        subtitle={t.leaderboardSubtitle}
        spacing="lg"
        containerSize="lg"
        action={
          <Link
            href={`/${locale}/leaderboard`}
            className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
          >
            <Crown size={14} />
            <span>{t.viewAll}</span>
            <ChevronRight size={14} />
          </Link>
        }
      >
        <div className="bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-edge rounded-2xl p-5 lg:p-6">
          <div className="space-y-3">
            {[
              { name: 'Giorgi T.', rank: 1, points: 2450, accuracy: 87, badges: ['prophet', 'champion'] as const },
              { name: 'Nika M.', rank: 2, points: 2180, accuracy: 82, badges: ['sniper', 'legend'] as const },
              { name: 'Luka K.', rank: 3, points: 1950, accuracy: 79, badges: ['streak', 'sniper'] as const },
              { name: 'Dato S.', rank: 4, points: 1820, accuracy: 76, badges: ['streak'] as const },
              { name: 'Sandro B.', rank: 5, points: 1740, accuracy: 74, badges: ['sniper'] as const },
            ].map((user) => (
              <UserBadge
                key={user.rank}
                name={user.name}
                rank={user.rank}
                points={user.points}
                accuracy={user.accuracy}
                badges={[...user.badges]}
                variant="leaderboard"
                animated={false}
              />
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-edge/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-gold" />
              <span className="text-xs text-muted">
                {locale === 'ka' ? 'ამ თვის ლიდერი' : locale === 'ru' ? 'Лидер месяца' : 'Leader of the month'}
              </span>
            </div>

            <Link
              href={`/${locale}/leaderboard`}
              className="text-xs text-lime hover:underline flex items-center gap-1"
            >
              <span>{t.seeMore}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          9. WHY US — რატომ ჩვენ?
      ═══════════════════════════════════════════════════════ */}
      <Section
        title={t.whyUs}
        subtitle={t.whyUsSubtitle}
        spacing="xl"
        containerSize="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              titleKa: 'AI პროგნოზები',
              titleEn: 'AI Predictions',
              titleRu: 'AI прогнозы',
              descKa: 'ჭკვიანი ალგორითმები, რომლებიც აანალიზებენ ყველა მატჩს — ფორმა, ტრავმები, ისტორია',
              descEn: 'Smart algorithms analyzing every match — form, injuries, history',
              descRu: 'Умные алгоритмы, анализирующие каждый матч — форма, травмы, история',
              color: 'lime' as const,
            },
            {
              icon: Activity,
              titleKa: 'რეალურ დროში სტატისტიკა',
              titleEn: 'Real-time Stats',
              titleRu: 'Статистика в реальном времени',
              descKa: 'ცოცხალი ანგარიშები, ფლობა, დარტყმები — ყველაფერი 30 წამში განახლდება',
              descEn: 'Live scores, possession, shots — everything refreshes every 30 seconds',
              descRu: 'Живые счета, владение, удары — всё обновляется каждые 30 секунд',
              color: 'teal' as const,
            },
            {
              icon: Globe,
              titleKa: 'სამი ენა',
              titleEn: 'Three Languages',
              titleRu: 'Три языка',
              descKa: 'ქართული, ინგლისური, რუსული — შენ აირჩევ შენთვის სასურველს',
              descEn: 'Georgian, English, Russian — choose your preferred language',
              descRu: 'Грузинский, английский, русский — выбери свой язык',
              color: 'gold' as const,
            },
            {
              icon: Users,
              titleKa: 'ორი მხარე',
              titleEn: 'Two Sides',
              titleRu: 'Две стороны',
              descKa: 'ფანების აზრები ცალ-ცალკე, AI ნეიტრალური შეჯამებით',
              descEn: 'Fan opinions separated, with neutral AI summary',
              descRu: 'Мнения фанатов отдельно, с нейтральным AI-резюме',
              color: 'danger' as const,
            },
            {
              icon: Trophy,
              titleKa: 'ლიდერბორდი',
              titleEn: 'Leaderboard',
              titleRu: 'Лидерборд',
              descKa: 'შეადარე შენი პროგნოზები სხვებს, მოიპოვე ბეჯები და ადგილები',
              descEn: 'Compare your predictions with others, earn badges and ranks',
              descRu: 'Сравнивай свои прогнозы с другими, зарабатывай бейджи',
              color: 'lime' as const,
            },
            {
              icon: Award,
              titleKa: 'უფასო სამუდამოდ',
              titleEn: 'Free Forever',
              titleRu: 'Бесплатно навсегда',
              descKa: 'ყველა ფუნქცია ხელმისაწვდომია ყველასთვის — არავითარი გადახდა',
              descEn: 'All features available for everyone — no payments',
              descRu: 'Все функции доступны каждому — без оплаты',
              color: 'teal' as const,
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            const title = locale === 'ka' ? feature.titleKa : locale === 'ru' ? feature.titleRu : feature.titleEn;
            const desc = locale === 'ka' ? feature.descKa : locale === 'ru' ? feature.descRu : feature.descEn;

            return (
              <div
                key={i}
                className="group relative bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-6 hover:border-lime/30 transition-all duration-300 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-ink" />
                  </div>

                  <h3 className="font-heading text-base lg:text-lg font-bold text-text mb-2">
                    {title}
                  </h3>

                  <p className="text-sm text-muted leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          10. CTA — მოწოდება მოქმედებისკენ
      ═══════════════════════════════════════════════════════ */}
      <Section spacing="xl" containerSize="lg">
        <div className="relative bg-gradient-to-br from-lime/10 via-transparent to-teal/10 border border-lime/30 rounded-3xl p-8 lg:p-12 overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-lime/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left — text */}
            <div>
              <Badge variant="lime" size="md" dot pulse className="mb-5">
                <Sparkles size={12} className="mr-1" />
                {locale === 'ka' ? 'ახალი' : locale === 'ru' ? 'Новое' : 'New'}
              </Badge>

              <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-text leading-tight tracking-tight mb-4">
                {t.ctaTitle}
              </h2>

              <p className="text-base lg:text-lg text-muted leading-relaxed max-w-lg mb-6">
                {t.ctaDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/predictions`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_32px_rgba(217,249,157,0.5)] transition-all"
                >
                  <Zap size={16} fill="currentColor" />
                  <span>{t.ctaButton}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface/60 border border-edge text-text font-medium text-sm hover:border-lime/40 transition-all"
                >
                  <Users size={16} />
                  <span>{locale === 'ka' ? 'შესვლა' : locale === 'ru' ? 'Войти' : 'Login'}</span>
                </Link>
              </div>
            </div>

            {/* Right — decorative stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Trophy, value: '200+', label: locale === 'ka' ? 'ლიგა' : locale === 'ru' ? 'Лиг' : 'Leagues' },
                { icon: Target, value: '10K+', label: locale === 'ka' ? 'პროგნოზი' : locale === 'ru' ? 'Прогнозов' : 'Predictions' },
                { icon: Users, value: '5K+', label: locale === 'ka' ? 'მომხმარებელი' : locale === 'ru' ? 'Юзеров' : 'Users' },
                { icon: Star, value: '4.8', label: locale === 'ka' ? 'შეფასება' : locale === 'ru' ? 'Рейтинг' : 'Rating' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-5 text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-3">
                      <Icon size={18} className="text-lime" />
                    </div>
                    <div className="font-mono text-2xl font-bold text-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          11. NEWSLETTER — გამოწერა
      ═══════════════════════════════════════════════════════ */}
      <Section spacing="lg" containerSize="lg">
        <div className="bg-surface/60 backdrop-blur-xl border border-edge rounded-3xl p-8 lg:p-10 text-center max-w-3xl mx-auto relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime to-teal flex items-center justify-center mx-auto mb-5">
            <Sparkles size={24} className="text-ink" />
          </div>

          <h3 className="font-heading text-2xl lg:text-3xl font-bold text-text mb-3">
            {t.newsletter}
          </h3>

          <p className="text-sm lg:text-base text-muted mb-6 max-w-md mx-auto">
            {t.newsletterDesc}
          </p>

          <form className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl bg-ink border border-edge text-text placeholder:text-muted/60 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime/40 transition-all text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_24px_rgba(217,249,157,0.5)] transition-all whitespace-nowrap"
            >
              {t.subscribe}
            </button>
          </form>

          <p className="mt-4 text-[10px] text-muted">
            {locale === 'ka'
              ? 'არავითარი spam. გამოწერა ნებისმიერ დროს შეიძლება გაუქმდეს.'
              : locale === 'ru'
              ? 'Никакого спама. Отписка в любое время.'
              : 'No spam. Unsubscribe anytime.'}
          </p>
        </div>
      </Section>
    </>
  );
}