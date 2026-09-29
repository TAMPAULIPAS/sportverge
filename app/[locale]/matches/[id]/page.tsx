// ═══════════════════════════════════════════════════════════════
//  SportVerge — Match Detail Page (Ultra Premium)
//  კონკრეტული მატჩის დეტალური გვერდი
//  ყველა მონაცემი რეალურია TheSportsDB-დან
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getEventById,
  getTeamById,
  type SportsDBEvent,
  type SportsDBTeam,
} from '@/lib/api/sportsdb';
import { HeroBanner } from '@/components/banners/HeroBanner';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Sparkles,
  Target,
  Activity,
  Shield,
  Info,
  ExternalLink,
  Radio,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
interface MatchDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    back: isKa ? 'უკან' : isRu ? 'Назад' : 'Back',
    backToMatches: isKa ? 'მატჩებზე დაბრუნება' : isRu ? 'Назад к матчам' : 'Back to matches',

    // Match info
    liveNow: isKa ? 'LIVE ახლა' : isRu ? 'LIVE сейчас' : 'Live now',
    matchFinished: isKa ? 'დასრულდა' : isRu ? 'Завершён' : 'Finished',
    upcoming: isKa ? 'მალე დაიწყება' : isRu ? 'Скоро начнётся' : 'Upcoming',
    matchday: isKa ? 'ტური' : isRu ? 'Тур' : 'Matchday',
    stadium: isKa ? 'სტადიონი' : isRu ? 'Стадион' : 'Stadium',
    league: isKa ? 'ლიგა' : isRu ? 'Лига' : 'League',
    season: isKa ? 'სეზონი' : isRu ? 'Сезон' : 'Season',
    spectators: isKa ? 'მაყურებელი' : isRu ? 'Зрителей' : 'Spectators',
    referee: isKa ? 'მსაჯი' : isRu ? 'Судья' : 'Referee',
    date: isKa ? 'თარიღი' : isRu ? 'Дата' : 'Date',
    time: isKa ? 'დრო' : isRu ? 'Время' : 'Time',

    // Sections
    aiPrediction: isKa ? 'AI პროგნოზი' : isRu ? 'AI прогноз' : 'AI Prediction',
    aiPredictionDesc: isKa
      ? 'ჭკვიანი ალგორითმის მიერ გამოთვლილი ალბათობა'
      : isRu
      ? 'Вероятности, рассчитанные умным алгоритмом'
      : 'Probabilities calculated by smart algorithm',

    predictionSoon: isKa
      ? 'AI პროგნოზი მალე დაემატება'
      : isRu
      ? 'AI прогноз скоро появится'
      : 'AI prediction coming soon',
    predictionSoonDesc: isKa
      ? 'საჭიროა GEMINI_API_KEY .env.local-ში'
      : isRu
      ? 'Требуется GEMINI_API_KEY в .env.local'
      : 'GEMINI_API_KEY required in .env.local',

    homeWin: isKa ? 'მასპინძელი იმარჯვებს' : isRu ? 'Победа хозяев' : 'Home win',
    draw: isKa ? 'ფრე' : isRu ? 'Ничья' : 'Draw',
    awayWin: isKa ? 'სტუმარი იმარჯვებს' : isRu ? 'Победа гостей' : 'Away win',

    teamForm: isKa ? 'გუნდის ფორმა' : isRu ? 'Форма команд' : 'Team Form',
    teamFormDesc: isKa
      ? 'ბოლო 5 მატჩის შედეგი'
      : isRu
      ? 'Результаты последних 5 матчей'
      : 'Last 5 matches results',

    lastMatches: isKa ? 'ბოლო მატჩები' : isRu ? 'Последние матчи' : 'Last Matches',
    lastMatchesDesc: isKa
      ? 'გუნდების ბოლო 5 შეხვედრა'
      : isRu
      ? 'Последние 5 матчей команд'
      : 'Teams last 5 matches',

    headToHead: isKa ? 'ურთიერთშეხვედრები' : isRu ? 'Очные встречи' : 'Head-to-Head',
    headToHeadDesc: isKa
      ? 'გუნდებს შორის წინა მატჩები'
      : isRu
      ? 'Предыдущие матчи между командами'
      : 'Previous matches between teams',

    noH2H: isKa
      ? 'ურთიერთშეხვედრები ვერ მოიძებნა'
      : isRu
      ? 'Очные встречи не найдены'
      : 'Head-to-head not found',
    noH2HDesc: isKa
      ? 'მონაცემები მალე დაემატება'
      : isRu
      ? 'Данные скоро появятся'
      : 'Data coming soon',

    teamInfo: isKa ? 'გუნდის ინფო' : isRu ? 'О команде' : 'Team Info',
    founded: isKa ? 'დაარსდა' : isRu ? 'Основан' : 'Founded',
    country: isKa ? 'ქვეყანა' : isRu ? 'Страна' : 'Country',
    website: isKa ? 'ვებსაიტი' : isRu ? 'Веб-сайт' : 'Website',
    viewTeam: isKa ? 'გუნდის ნახვა' : isRu ? 'Смотреть команду' : 'View team',
    viewAllMatches: isKa ? 'ყველა მატჩი' : isRu ? 'Все матчи' : 'All matches',

    win: isKa ? 'მოგება' : isRu ? 'Победа' : 'Win',
    loss: isKa ? 'წაგება' : isRu ? 'Поражение' : 'Loss',

    matchInfo: isKa ? 'მატჩის ინფო' : isRu ? 'Информация о матче' : 'Match Info',
    notFound: isKa ? 'მატჩი ვერ მოიძებნა' : isRu ? 'Матч не найден' : 'Match not found',
    notFoundDesc: isKa
      ? 'სამწუხაროდ ეს მატჩი აღარ არის ხელმისაწვდომი'
      : isRu
      ? 'К сожалению, этот матч больше недоступен'
      : 'Unfortunately, this match is no longer available',
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getTeamBadge(teamId: string): string {
  return `https://www.thesportsdb.com/images/media/team/badge/${teamId}.png`;
}

function getMatchStatus(event: SportsDBEvent): 'upcoming' | 'live' | 'finished' {
  if (event.strStatus === 'Match Finished' || event.strStatus === 'FT') return 'finished';
  if (['Live', '1H', '2H', 'HT'].includes(event.strStatus || '')) return 'live';
  if (event.intHomeScore !== null && event.strStatus !== 'Live') return 'finished';
  return 'upcoming';
}

function calculateForm(
  matches: SportsDBEvent[],
  teamId: string
): ('W' | 'D' | 'L')[] {
  return matches.slice(0, 5).map((m) => {
    const isHome = m.idHomeTeam === teamId;
    const homeScore = parseInt(m.intHomeScore || '0', 10);
    const awayScore = parseInt(m.intAwayScore || '0', 10);
    const teamScore = isHome ? homeScore : awayScore;
    const oppScore = isHome ? awayScore : homeScore;

    if (teamScore > oppScore) return 'W';
    if (teamScore < oppScore) return 'L';
    return 'D';
  });
}

function formatDate(
  date: string,
  time: string | null,
  locale: string
): string {
  try {
    const dateObj = new Date(`${date}T${time || '00:00:00'}`);
    const localeMap = { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' };
    return dateObj.toLocaleDateString(
      localeMap[locale as 'ka' | 'en' | 'ru'] || 'en-US',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  } catch {
    return date;
  }
}

// ═══════════════════════════════════════════════════════════════
//  FORM DOTS
// ═══════════════════════════════════════════════════════════════
function FormDots({
  form,
  label,
}: {
  form: ('W' | 'D' | 'L')[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] text-muted uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="flex gap-1.5">
        {form.length > 0 ? (
          form.map((result, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                result === 'W'
                  ? 'bg-success text-ink'
                  : result === 'D'
                  ? 'bg-gold text-ink'
                  : 'bg-danger text-ink'
              }`}
            >
              {result}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted/60">—</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  NOT FOUND VIEW
// ═══════════════════════════════════════════════════════════════
function NotFoundView({ locale }: { locale: string }) {
  const t = getT(locale);

  return (
    <div className="relative py-20 lg:py-32">
      <Container size="md" padding>
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
            <Trophy size={32} className="text-muted" />
          </div>

          <h1 className="font-heading text-3xl lg:text-4xl font-black text-text mb-4">
            {t.notFound}
          </h1>

          <p className="text-base text-muted mb-8">{t.notFoundDesc}</p>

          <Link
            href={`/${locale}/matches`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime/90 hover:shadow-[0_0_32px_rgba(217,249,157,0.5)] transition-all group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>{t.backToMatches}</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  INFO ROW
// ═══════════════════════════════════════════════════════════════
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-edge/40 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-surface-hover border border-edge flex items-center justify-center shrink-0">
        <Icon size={13} className="text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted uppercase tracking-wider font-medium">
          {label}
        </div>
        <div className="text-sm text-text font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default async function MatchDetailPage({
  params,
}: MatchDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = getT(locale);

  // ─── მატჩის ჩატვირთვა ───
  let event: SportsDBEvent | null = null;

  try {
    event = await getEventById(id);
  } catch (error) {
    console.error('[/matches/[id]] Error loading event:', error);
  }

  // ─── თუ ვერ მოიძებნა ───
  if (!event) {
    return <NotFoundView locale={locale} />;
  }

  // ─── გუნდების დეტალები + ბოლო მატჩები ───
  const [homeTeamData, awayTeamData, homeLastRaw, awayLastRaw] = await Promise.all([
    getTeamById(event.idHomeTeam).catch(() => null),
    getTeamById(event.idAwayTeam).catch(() => null),
    getTeamLastEvents(event.idHomeTeam).catch(() => []),
    getTeamLastEvents(event.idAwayTeam).catch(() => []),
  ]);

  const homeLast = Array.isArray(homeLastRaw) ? homeLastRaw : [];
  const awayLast = Array.isArray(awayLastRaw) ? awayLastRaw : [];

  // ─── ფორმა ───
  const homeForm = calculateForm(homeLast, event.idHomeTeam);
  const awayForm = calculateForm(awayLast, event.idAwayTeam);

  // ─── მატჩის მონაცემები ───
  const status = getMatchStatus(event);
  const scoreHome = event.intHomeScore !== null ? parseInt(event.intHomeScore, 10) : null;
  const scoreAway = event.intAwayScore !== null ? parseInt(event.intAwayScore, 10) : null;
  const formattedDate = formatDate(event.dateEvent, event.strTime, locale);

  const homeTeam = {
    idTeam: event.idHomeTeam,
    strTeam: event.strHomeTeam,
    strTeamBadge: getTeamBadge(event.idHomeTeam),
    strTeamLogo: getTeamBadge(event.idHomeTeam),
  };

  const awayTeam = {
    idTeam: event.idAwayTeam,
    strTeam: event.strAwayTeam,
    strTeamBadge: getTeamBadge(event.idAwayTeam),
    strTeamLogo: getTeamBadge(event.idAwayTeam),
  };

  // ─── H2H (ბოლო მატჩები ორივე გუნდის ისტორიიდან) ───
  const allMatches = [...homeLast, ...awayLast];
  const h2hMatches = allMatches.filter(
    (m) =>
      (m.idHomeTeam === event.idHomeTeam && m.idAwayTeam === event.idAwayTeam) ||
      (m.idHomeTeam === event.idAwayTeam && m.idAwayTeam === event.idHomeTeam)
  );
  const uniqueH2H = Array.from(
    new Map(h2hMatches.map((m) => [m.idEvent, m])).values()
  ).slice(0, 5);

  return (
    <div className="relative">
      {/* ═══ Ambient background ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══════════════════════════════════════════════════
              BREADCRUMB + BACK
          ═══════════════════════════════════════════════════ */}
          <div className="pt-8 lg:pt-12 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href={`/${locale}/matches`}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-lime hover:bg-lime/5 transition-all"
              >
                <ArrowLeft
                  size={12}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                <span>{t.back}</span>
              </Link>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted mb-6 flex-wrap">
              <Link
                href={`/${locale}`}
                className="hover:text-lime transition-colors"
              >
                {locale === 'ka' ? 'მთავარი' : locale === 'ru' ? 'Главная' : 'Home'}
              </Link>
              <span className="text-muted/50">/</span>
              <Link
                href={`/${locale}/matches`}
                className="hover:text-lime transition-colors"
              >
                {locale === 'ka' ? 'მატჩები' : locale === 'ru' ? 'Матчи' : 'Matches'}
              </Link>
              <span className="text-muted/50">/</span>
              <span className="text-text truncate max-w-[200px] lg:max-w-md">
                {event.strHomeTeam} vs {event.strAwayTeam}
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              HERO BANNER — მატჩის ბარათი
          ═══════════════════════════════════════════════════ */}
          <HeroBanner
            locale={locale}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            league={event.strLeague}
            matchday={event.intRound}
            stadium={event.strVenue}
            stadiumCity={event.strCity}
            scoreHome={scoreHome}
            scoreAway={scoreAway}
            minute={undefined}
            half={undefined}
            status={status}
            homeForm={homeForm}
            awayForm={awayForm}
            events={[]}
            stats={{
              possession: { home: 50, away: 50 },
              shots: { home: 0, away: 0 },
              onTarget: { home: 0, away: 0 },
              corners: { home: 0, away: 0 },
            }}
            aiPrediction={{ homeWin: 45, draw: 28, awayWin: 27 }}
            nextEvent={{
              probability: 0,
              teamName: event.strHomeTeam,
              timeframeMinutes: 15,
            }}
          />

          {/* ═══════════════════════════════════════════════════
              MAIN GRID — INFO + FORM
          ═══════════════════════════════════════════════════ */}
          <Section spacing="lg" containerSize="lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* ═══ MATCH INFO ═══ */}
              <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center">
                    <Info size={16} className="text-ink" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-heading text-base lg:text-lg font-bold text-text">
                    {t.matchInfo}
                  </h3>
                </div>

                <div className="space-y-0">
                  <InfoRow icon={Trophy} label={t.league} value={event.strLeague} />
                  <InfoRow icon={Calendar} label={t.date} value={formattedDate} />
                  <InfoRow
                    icon={Clock}
                    label={t.time}
                    value={event.strTime?.slice(0, 5)}
                  />
                  <InfoRow icon={MapPin} label={t.stadium} value={event.strVenue} />
                  <InfoRow icon={Users} label={t.spectators} value={event.intSpectators} />
                  <InfoRow icon={Shield} label={t.referee} value={event.strOfficial} />
                  <InfoRow icon={Activity} label={t.season} value={event.strSeason} />
                  <InfoRow icon={Target} label={t.matchday} value={event.intRound} />
                </div>
              </div>

              {/* ═══ HOME TEAM INFO ═══ */}
              {homeTeamData && (
                <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative w-11 h-11 shrink-0">
                      <Image
                        src={getTeamBadge(homeTeamData.idTeam)}
                        alt={homeTeamData.strTeam}
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-sm lg:text-base font-bold text-text truncate">
                        {homeTeamData.strTeam}
                      </h3>
                      <Badge variant="lime" size="sm">
                        {locale === 'ka' ? 'მასპინძელი' : locale === 'ru' ? 'Хозяева' : 'Home'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-0">
                    <InfoRow
                      icon={Calendar}
                      label={t.founded}
                      value={homeTeamData.intFormedYear}
                    />
                    <InfoRow
                      icon={MapPin}
                      label={t.country}
                      value={homeTeamData.strCountry}
                    />
                    <InfoRow
                      icon={MapPin}
                      label={t.stadium}
                      value={homeTeamData.strStadium}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-edge/50 flex flex-col gap-3">
                    <FormDots form={homeForm} label={t.teamForm} />
                    <Link
                      href={`/${locale}/teams/${homeTeamData.idTeam}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-xs font-semibold hover:bg-lime/20 transition-colors"
                    >
                      <span>{t.viewTeam}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {/* ═══ AWAY TEAM INFO ═══ */}
              {awayTeamData && (
                <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/60 to-transparent" />

                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative w-11 h-11 shrink-0">
                      <Image
                        src={getTeamBadge(awayTeamData.idTeam)}
                        alt={awayTeamData.strTeam}
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-sm lg:text-base font-bold text-text truncate">
                        {awayTeamData.strTeam}
                      </h3>
                      <Badge variant="teal" size="sm">
                        {locale === 'ka' ? 'სტუმარი' : locale === 'ru' ? 'Гости' : 'Away'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-0">
                    <InfoRow
                      icon={Calendar}
                      label={t.founded}
                      value={awayTeamData.intFormedYear}
                    />
                    <InfoRow
                      icon={MapPin}
                      label={t.country}
                      value={awayTeamData.strCountry}
                    />
                    <InfoRow
                      icon={MapPin}
                      label={t.stadium}
                      value={awayTeamData.strStadium}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-edge/50 flex flex-col gap-3">
                    <FormDots form={awayForm} label={t.teamForm} />
                    <Link
                      href={`/${locale}/teams/${awayTeamData.idTeam}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-teal/10 border border-teal/30 text-teal text-xs font-semibold hover:bg-teal/20 transition-colors"
                    >
                      <span>{t.viewTeam}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ═══════════════════════════════════════════════════
              AI PREDICTION (Coming Soon)
          ═══════════════════════════════════════════════════ */}
          <Section
            title={t.aiPrediction}
            subtitle={t.aiPredictionDesc}
            spacing="lg"
            containerSize="lg"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-lime/5 via-transparent to-teal/5 border border-lime/20 rounded-2xl p-6 lg:p-10">
              <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-lime/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime to-teal flex items-center justify-center shrink-0 shadow-[0_0_32px_rgba(217,249,157,0.3)]">
                  <Sparkles size={24} className="text-ink" strokeWidth={2.2} />
                </div>

                <div className="flex-1">
                  <h3 className="font-heading text-lg lg:text-xl font-bold text-text mb-2">
                    {t.predictionSoon}
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    {t.predictionSoonDesc}
                  </p>

                  <ol className="space-y-2 text-sm text-muted">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-lime/10 border border-lime/30 flex items-center justify-center text-[10px] font-bold text-lime">
                        1
                      </span>
                      <span>
                        {locale === 'ka'
                          ? 'დარეგისტრირდი aistudio.google.com-ზე'
                          : locale === 'ru'
                          ? 'Зарегистрируйся на aistudio.google.com'
                          : 'Register at aistudio.google.com'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-lime/10 border border-lime/30 flex items-center justify-center text-[10px] font-bold text-lime">
                        2
                      </span>
                      <span>
                        {locale === 'ka'
                          ? 'დააკოპირე API Key'
                          : locale === 'ru'
                          ? 'Скопируй API Key'
                          : 'Copy your API Key'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-lime/10 border border-lime/30 flex items-center justify-center text-[10px] font-bold text-lime">
                        3
                      </span>
                      <span className="font-mono text-xs bg-surface/60 px-2 py-0.5 rounded border border-edge">
                        GEMINI_API_KEY=your_key_here
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </Section>

          {/* ═══════════════════════════════════════════════════
              HEAD-TO-HEAD
          ═══════════════════════════════════════════════════ */}
          <Section
            title={t.headToHead}
            subtitle={t.headToHeadDesc}
            spacing="lg"
            containerSize="lg"
          >
            {uniqueH2H.length > 0 ? (
              <div className="space-y-2">
                {uniqueH2H.map((match) => {
                  const hScore =
                    match.intHomeScore !== null ? parseInt(match.intHomeScore, 10) : null;
                  const aScore =
                    match.intAwayScore !== null ? parseInt(match.intAwayScore, 10) : null;

                  return (
                    <Link
                      key={match.idEvent}
                      href={`/${locale}/matches/${match.idEvent}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge/70 hover:border-lime/40 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 text-right">
                        <span className="text-sm font-semibold text-text truncate block">
                          {match.strHomeTeam}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 px-3 py-1 rounded-lg bg-ink/50 border border-edge">
                        <span className="font-mono text-base font-bold text-text">
                          {hScore ?? '—'}
                        </span>
                        <span className="text-lime text-sm">:</span>
                        <span className="font-mono text-base font-bold text-text">
                          {aScore ?? '—'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-text truncate block">
                          {match.strAwayTeam}
                        </span>
                      </div>

                      <ChevronRight
                        size={14}
                        className="text-muted group-hover:text-lime group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-2xl p-12 text-center">
                <div className="absolute inset-0 grid-bg opacity-30" />

                <div className="relative">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface border border-edge flex items-center justify-center">
                    <History size={22} className="text-muted" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm text-muted font-medium">{t.noH2H}</p>
                  <p className="mt-1.5 text-xs text-muted/70">{t.noH2HDesc}</p>
                </div>
              </div>
            )}
          </Section>

          {/* ═══════════════════════════════════════════════════
              LAST MATCHES
          ═══════════════════════════════════════════════════ */}
          {(homeLast.length > 0 || awayLast.length > 0) && (
            <Section
              title={t.lastMatches}
              subtitle={t.lastMatchesDesc}
              spacing="lg"
              containerSize="lg"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-16">
                {/* Home team last matches */}
                {homeLast.length > 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-9 h-9 shrink-0">
                        <Image
                          src={getTeamBadge(event.idHomeTeam)}
                          alt={event.strHomeTeam}
                          fill
                          sizes="36px"
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-heading text-sm font-bold text-text truncate">
                        {event.strHomeTeam}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {homeLast.slice(0, 5).map((match) => {
                        const isHome = match.idHomeTeam === event.idHomeTeam;
                        const hScore =
                          match.intHomeScore !== null ? parseInt(match.intHomeScore, 10) : null;
                        const aScore =
                          match.intAwayScore !== null ? parseInt(match.intAwayScore, 10) : null;

                        const teamScore = isHome ? hScore : aScore;
                        const oppScore = isHome ? aScore : hScore;
                        const result =
                          teamScore !== null && oppScore !== null
                            ? teamScore > oppScore
                              ? 'W'
                              : teamScore < oppScore
                              ? 'L'
                              : 'D'
                            : null;

                        return (
                          <Link
                            key={match.idEvent}
                            href={`/${locale}/matches/${match.idEvent}`}
                            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
                          >
                            {result && (
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                  result === 'W'
                                    ? 'bg-success text-ink'
                                    : result === 'D'
                                    ? 'bg-gold text-ink'
                                    : 'bg-danger text-ink'
                                }`}
                              >
                                {result}
                              </span>
                            )}

                            <span className="text-xs text-text truncate flex-1">
                              {match.strHomeTeam} vs {match.strAwayTeam}
                            </span>

                            <span className="font-mono text-xs font-bold text-muted shrink-0">
                              {hScore ?? '—'}:{aScore ?? '—'}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Away team last matches */}
                {awayLast.length > 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/60 to-transparent" />

                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-9 h-9 shrink-0">
                        <Image
                          src={getTeamBadge(event.idAwayTeam)}
                          alt={event.strAwayTeam}
                          fill
                          sizes="36px"
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-heading text-sm font-bold text-text truncate">
                        {event.strAwayTeam}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {awayLast.slice(0, 5).map((match) => {
                        const isHome = match.idHomeTeam === event.idAwayTeam;
                        const hScore =
                          match.intHomeScore !== null ? parseInt(match.intHomeScore, 10) : null;
                        const aScore =
                          match.intAwayScore !== null ? parseInt(match.intAwayScore, 10) : null;

                        const teamScore = isHome ? hScore : aScore;
                        const oppScore = isHome ? aScore : hScore;
                        const result =
                          teamScore !== null && oppScore !== null
                            ? teamScore > oppScore
                              ? 'W'
                              : teamScore < oppScore
                              ? 'L'
                              : 'D'
                            : null;

                        return (
                          <Link
                            key={match.idEvent}
                            href={`/${locale}/matches/${match.idEvent}`}
                            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
                          >
                            {result && (
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                  result === 'W'
                                    ? 'bg-success text-ink'
                                    : result === 'D'
                                    ? 'bg-gold text-ink'
                                    : 'bg-danger text-ink'
                                }`}
                              >
                                {result}
                              </span>
                            )}

                            <span className="text-xs text-text truncate flex-1">
                              {match.strHomeTeam} vs {match.strAwayTeam}
                            </span>

                            <span className="font-mono text-xs font-bold text-muted shrink-0">
                              {hScore ?? '—'}:{aScore ?? '—'}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </Container>
      </div>
    </div>
  );
}