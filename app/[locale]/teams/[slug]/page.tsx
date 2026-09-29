// ═══════════════════════════════════════════════════════════════
//  SportVerge — Teams Page (Ultra Premium)
//  ყველა გუნდი რეალურია TheSportsDB API-დან. არავითარი fake!
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getLeagueTable } from '@/lib/api/sportsdb';
import { POPULAR_LEAGUES } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
interface TeamsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ league?: string }>;
}

interface TableRow {
  intRank: string;
  idTeam: string;
  strTeam: string;
  strTeamBadge: string | null;
  strBadge?: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm: string | null;
}

// ═══════════════════════════════════════════════════════════════
//  LEAGUES CONFIG
// ═══════════════════════════════════════════════════════════════
const LEAGUES = [
  {
    id: POPULAR_LEAGUES.premierLeague,
    nameKa: 'პრემიერ ლიგა',
    nameEn: 'Premier League',
    nameRu: 'Премьер-лига',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  {
    id: POPULAR_LEAGUES.laLiga,
    nameKa: 'ლა ლიგა',
    nameEn: 'La Liga',
    nameRu: 'Ла Лига',
    country: 'Spain',
    flag: '🇪🇸',
  },
  {
    id: POPULAR_LEAGUES.serieA,
    nameKa: 'სერია A',
    nameEn: 'Serie A',
    nameRu: 'Серия A',
    country: 'Italy',
    flag: '🇮🇹',
  },
  {
    id: POPULAR_LEAGUES.bundesliga,
    nameKa: 'ბუნდესლიგა',
    nameEn: 'Bundesliga',
    nameRu: 'Бундеслига',
    country: 'Germany',
    flag: '🇩🇪',
  },
  {
    id: POPULAR_LEAGUES.ligue1,
    nameKa: 'ლიგა 1',
    nameEn: 'Ligue 1',
    nameRu: 'Лига 1',
    country: 'France',
    flag: '🇫🇷',
  },
];

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'გუნდები' : isRu ? 'Команды' : 'Teams',
    subtitle: isKa
      ? 'პოპულარული ლიგების გუნდები რეალური სტატისტიკით'
      : isRu
      ? 'Команды популярных лиг с реальной статистикой'
      : 'Teams from popular leagues with real stats',
    allLeagues: isKa ? 'ყველა ლიგა' : isRu ? 'Все лиги' : 'All leagues',
    noTeams: isKa ? 'გუნდები მალე დაემატება' : isRu ? 'Команды скоро появятся' : 'Teams coming soon',
    noTeamsHint: isKa
      ? 'მონაცემები იტვირთება TheSportsDB-დან'
      : isRu
      ? 'Данные загружаются из TheSportsDB'
      : 'Data loading from TheSportsDB',
    position: isKa ? 'ადგილი' : isRu ? 'Место' : 'Position',
    points: isKa ? 'ქულები' : isRu ? 'Очки' : 'Points',
    played: isKa ? 'თამაშები' : isRu ? 'Игры' : 'Played',
    wins: isKa ? 'მოგება' : isRu ? 'Победы' : 'Wins',
    draws: isKa ? 'ფრე' : isRu ? 'Ничьи' : 'Draws',
    losses: isKa ? 'წაგება' : isRu ? 'Поражения' : 'Losses',
    goalsFor: isKa ? 'გატანილი' : isRu ? 'Забито' : 'GF',
    goalsAgainst: isKa ? 'გაშვებული' : isRu ? 'Пропущено' : 'GA',
    goalDiff: isKa ? 'სხვაობა' : isRu ? 'Разница' : 'GD',
    form: isKa ? 'ფორმა' : isRu ? 'Форма' : 'Form',
    viewTeam: isKa ? 'გუნდის ნახვა' : isRu ? 'Смотреть команду' : 'View team',
    leagueTable: isKa ? 'ლიგის ცხრილი' : isRu ? 'Таблица лиги' : 'League Table',
    teamsCount: isKa ? 'გუნდი' : isRu ? 'Команд' : 'Teams',
    matches: isKa ? 'მატჩი' : isRu ? 'Матчей' : 'Matches',
    statLeagues: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues',
    statTeams: isKa ? 'გუნდი' : isRu ? 'Команд' : 'Teams',
    statData: isKa ? 'რეალური მონაცემი' : isRu ? 'Реальных данных' : 'Real data',
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
function getFormColor(char: string): string {
  if (char === 'W') return 'bg-success text-ink';
  if (char === 'D') return 'bg-gold text-ink';
  if (char === 'L') return 'bg-danger text-ink';
  return 'bg-surface-hover text-muted';
}

function getRankColor(rank: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (rank === 1) return { bg: 'bg-gold/15', text: 'text-gold', border: 'border-gold/40' };
  if (rank === 2) return { bg: 'bg-muted/15', text: 'text-text', border: 'border-muted/40' };
  if (rank === 3) return { bg: 'bg-[#CD7F32]/15', text: 'text-[#CD7F32]', border: 'border-[#CD7F32]/40' };
  if (rank <= 5) return { bg: 'bg-teal/10', text: 'text-teal', border: 'border-teal/30' };
  if (rank >= 18) return { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' };
  return { bg: 'bg-surface/60', text: 'text-muted', border: 'border-edge' };
}

function getTeamBadge(team: TableRow): string | null {
  return team.strTeamBadge || team.strBadge || null;
}

// ═══════════════════════════════════════════════════════════════
//  TEAM CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
function TeamCard({
  team,
  locale,
  index,
}: {
  team: TableRow;
  locale: string;
  index: number;
}) {
  const rank = parseInt(team.intRank, 10);
  const badge = getTeamBadge(team);
  const colors = getRankColor(rank);

  return (
    <Link
      href={`/${locale}/teams/${team.idTeam}`}
      className="group relative block overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
    >
      {/* Top gradient line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Corner glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative">
        {/* Rank badge + form row */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.bg} border ${colors.border}`}
          >
            <Trophy size={12} className={colors.text} />
            <span className={`text-xs font-bold font-mono ${colors.text}`}>
              #{rank}
            </span>
          </div>

          {/* Form dots */}
          {team.strForm && (
            <div className="flex gap-1">
              {team.strForm
                .split('')
                .slice(-5)
                .map((char, i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${getFormColor(char)}`}
                  >
                    {char}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Badge + Name */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-14 h-14 lg:w-16 lg:h-16 shrink-0">
            {badge ? (
              <Image
                src={badge}
                alt={team.strTeam}
                fill
                sizes="64px"
                className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-hover flex items-center justify-center">
                <Shield size={24} className="text-muted" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base lg:text-lg font-bold text-text truncate group-hover:text-lime transition-colors">
              {team.strTeam}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
              <span className="font-mono">
                {team.intPlayed} {locale === 'ka' ? 'მატჩი' : locale === 'ru' ? 'игр' : 'matches'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-edge/50">
          <div className="text-center">
            <div className="text-[9px] text-muted uppercase tracking-wider mb-1">
              {locale === 'ka' ? 'ქულა' : locale === 'ru' ? 'Очки' : 'Pts'}
            </div>
            <div className="font-mono text-lg font-bold text-lime">
              {team.intPoints}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-muted uppercase tracking-wider mb-1">
              {locale === 'ka' ? 'მოგება' : locale === 'ru' ? 'Побед' : 'Wins'}
            </div>
            <div className="font-mono text-lg font-bold text-success">
              {team.intWin}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-muted uppercase tracking-wider mb-1">
              {locale === 'ka' ? 'სხვაობა' : locale === 'ru' ? 'Разн.' : 'GD'}
            </div>
            <div
              className={`font-mono text-lg font-bold ${
                parseInt(team.intGoalDifference, 10) > 0
                  ? 'text-teal'
                  : parseInt(team.intGoalDifference, 10) < 0
                  ? 'text-danger'
                  : 'text-muted'
              }`}
            >
              {parseInt(team.intGoalDifference, 10) > 0 ? '+' : ''}
              {team.intGoalDifference}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Shield size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <p className="text-base lg:text-lg text-muted font-medium">{title}</p>
        {hint && <p className="mt-2 text-xs text-muted/70">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default async function TeamsPage({
  params,
  searchParams,
}: TeamsPageProps) {
  const { locale } = await params;
  const { league: leagueParam } = await searchParams;

  setRequestLocale(locale);

  const t = getT(locale);

  // ─── აქტიური ლიგა ───
  const activeLeagueId = leagueParam || LEAGUES[0].id;
  const activeLeague = LEAGUES.find((l) => l.id === activeLeagueId) || LEAGUES[0];

  // ─── ცხრილის ჩატვირთვა ───
  const currentSeason = new Date().getFullYear();
  const seasonString = `${currentSeason - 1}-${currentSeason}`;

  let tableRaw: any[] = [];
  try {
    tableRaw = await getLeagueTable(activeLeague.id, seasonString);
  } catch {
    tableRaw = [];
  }

  const teams: TableRow[] = Array.isArray(tableRaw) ? tableRaw : [];

  // ─── ლიგის სახელი locale-ის მიხედვით ───
  const getLeagueName = (league: typeof LEAGUES[number]) => {
    if (locale === 'ka') return league.nameKa;
    if (locale === 'ru') return league.nameRu;
    return league.nameEn;
  };

  return (
    <div className="relative">
      {/* ═══ AMBIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══════════════════════════════════════════════════
              HERO HEADER
          ═══════════════════════════════════════════════════ */}
          <div className="pt-8 lg:pt-12 pb-10 lg:pb-14">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link
                href={`/${locale}`}
                className="hover:text-lime transition-colors"
              >
                {locale === 'ka' ? 'მთავარი' : locale === 'ru' ? 'Главная' : 'Home'}
              </Link>
              <span className="text-muted/50">/</span>
              <span className="text-text">{t.title}</span>
            </div>

            {/* Title section */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 mb-4">
                  <Sparkles size={12} className="text-lime" />
                  <span className="text-[10px] font-bold text-lime uppercase tracking-widest">
                    SportVerge
                  </span>
                </div>

                <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.05]">
                  {t.title}
                </h1>

                <p className="mt-3 text-base lg:text-lg text-muted max-w-2xl">
                  {t.subtitle}
                </p>
              </div>

              {/* Stats badges — only real */}
              {teams.length > 0 && (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="px-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-center">
                    <div className="font-mono text-2xl font-bold text-lime">
                      {teams.length}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {t.teamsCount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              LEAGUE FILTER TABS
          ═══════════════════════════════════════════════════ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {LEAGUES.map((league) => {
                const isActive = league.id === activeLeagueId;
                return (
                  <Link
                    key={league.id}
                    href={`/${locale}/teams?league=${league.id}`}
                    className={`group shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-lime text-ink shadow-[0_0_24px_rgba(217,249,157,0.3)]'
                        : 'bg-surface/60 backdrop-blur-xl border border-edge text-muted hover:text-text hover:border-lime/40'
                    }`}
                  >
                    <span className="text-base leading-none">{league.flag}</span>
                    <span>{getLeagueName(league)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              CURRENT LEAGUE INFO
          ═══════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6 mb-8">
            {/* Top gradient */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl lg:text-5xl leading-none">
                  {activeLeague.flag}
                </div>
                <div>
                  <h2 className="font-heading text-lg lg:text-xl font-bold text-text">
                    {getLeagueName(activeLeague)}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <span>{activeLeague.country}</span>
                    {teams.length > 0 && (
                      <>
                        <span className="text-muted/50">•</span>
                        <span className="font-mono">
                          {teams.length} {t.teamsCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-teal" />
                </span>
                <span className="text-[10px] font-medium text-teal uppercase tracking-wider">
                  {t.leagueTable}
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              TEAMS GRID
          ═══════════════════════════════════════════════════ */}
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 pb-16">
              {teams.map((team, index) => (
                <TeamCard
                  key={team.idTeam}
                  team={team}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="pb-16">
              <EmptyState title={t.noTeams} hint={t.noTeamsHint} />
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}