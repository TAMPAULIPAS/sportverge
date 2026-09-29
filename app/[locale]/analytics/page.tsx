// ═══════════════════════════════════════════════════════════════
//  SportVerge — Analytics Page (Ultra Premium v3)
//  ლიგის ცხრილები — TheSportsDB-დან
//  • გუნდის ემბლემები ყოველთვის ჩანს (ID-ზე დაფუძნებული URL fallback)
//  • Podium (TOP 3) + ფორმის ინდიკატორები + პროგრესის ზოლები
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getLeagueTable } from '@/lib/api/sportsdb';
import { POPULAR_LEAGUES } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { SafeImage } from '@/components/news/SafeImage';
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Shield,
  ChevronRight,
  Target,
  Flame,
  Activity,
  Users,
  Info,
  Crown,
  Medal,
  Award,
  Zap,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface AnalyticsPageProps {
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

type Accent = 'lime' | 'teal' | 'gold' | 'danger';

// ═══════════════════════════════════════════════════════════════
//  LEAGUES CONFIG
// ═══════════════════════════════════════════════════════════════
const LEAGUES = [
  {
    id: POPULAR_LEAGUES.premierLeague.id,
    nameKa: 'პრემიერ ლიგა',
    nameEn: 'Premier League',
    nameRu: 'Премьер-лига',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color: 'from-purple-500 to-indigo-600',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    id: POPULAR_LEAGUES.laLiga.id,
    nameKa: 'ლა ლიგა',
    nameEn: 'La Liga',
    nameRu: 'Ла Лига',
    flag: '🇪🇸',
    color: 'from-red-500 to-yellow-500',
    glow: 'rgba(239,68,68,0.35)',
  },
  {
    id: POPULAR_LEAGUES.serieA.id,
    nameKa: 'სერია A',
    nameEn: 'Serie A',
    nameRu: 'Серия A',
    flag: '🇮🇹',
    color: 'from-emerald-500 to-blue-600',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    id: POPULAR_LEAGUES.bundesliga.id,
    nameKa: 'ბუნდესლიგა',
    nameEn: 'Bundesliga',
    nameRu: 'Бундеслига',
    flag: '🇩🇪',
    color: 'from-red-600 to-zinc-800',
    glow: 'rgba(220,38,38,0.35)',
  },
  {
    id: POPULAR_LEAGUES.ligue1.id,
    nameKa: 'ლიგა 1',
    nameEn: 'Ligue 1',
    nameRu: 'Лига 1',
    flag: '🇫🇷',
    color: 'from-blue-600 to-red-500',
    glow: 'rgba(37,99,235,0.35)',
  },
];

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'ანალიტიკა' : isRu ? 'Аналитика' : 'Analytics',
    subtitle: isKa
      ? 'ლიგის ცხრილები და გუნდების სტატისტიკა'
      : isRu
      ? 'Таблицы лиг и статистика команд'
      : 'League tables and team statistics',
    leagueTable: isKa ? 'ლიგის ცხრილი' : isRu ? 'Таблица лиги' : 'League Table',
    team: isKa ? 'გუნდი' : isRu ? 'Команда' : 'Team',
    played: isKa ? 'თ' : isRu ? 'И' : 'P',
    wins: isKa ? 'მ' : isRu ? 'В' : 'W',
    draws: isKa ? 'ფ' : isRu ? 'Н' : 'D',
    losses: isKa ? 'წ' : isRu ? 'П' : 'L',
    goalsFor: isKa ? 'გტ' : isRu ? 'ЗБ' : 'GF',
    goalsAgainst: isKa ? 'გშ' : isRu ? 'ПР' : 'GA',
    goalDiff: isKa ? 'სხ' : isRu ? 'РЗ' : 'GD',
    points: isKa ? 'ქულა' : isRu ? 'Очки' : 'Pts',
    form: isKa ? 'ფორმა' : isRu ? 'Форма' : 'Form',
    overview: isKa ? 'მიმოხილვა' : isRu ? 'Обзор' : 'Overview',
    totalTeams: isKa ? 'გუნდები' : isRu ? 'Команд' : 'Teams',
    totalMatches: isKa ? 'მატჩები' : isRu ? 'Матчей' : 'Matches',
    totalGoals: isKa ? 'გოლები' : isRu ? 'Голов' : 'Goals',
    avgGoals: isKa ? 'საშ. გოლი' : isRu ? 'Сред. голов' : 'Avg goals',
    topTeams: isKa ? 'საუკეთესო გუნდები' : isRu ? 'Лучшие команды' : 'Top Teams',
    bestAttack: isKa ? 'საუკეთესო შეტევა' : isRu ? 'Лучшая атака' : 'Best Attack',
    bestDefense: isKa ? 'საუკეთესო დაცვა' : isRu ? 'Лучшая защита' : 'Best Defense',
    noData: isKa ? 'მონაცემები მალე დაემატება' : isRu ? 'Данные скоро появятся' : 'Data coming soon',
    noDataHint: isKa
      ? 'მონაცემები იტვირთება TheSportsDB-დან'
      : isRu
      ? 'Данные загружаются из TheSportsDB'
      : 'Data loading from TheSportsDB',
    info: isKa
      ? 'ლიგის ცხრილი ავტომატურად ახლდება TheSportsDB API-დან'
      : isRu
      ? 'Таблица лиги автоматически обновляется из TheSportsDB API'
      : 'League table auto-updates from TheSportsDB API',
    home: isKa ? 'მთავარი' : isRu ? 'Главная' : 'Home',
    liveTable: isKa ? 'ცოცხალი ცხრილი' : isRu ? 'Живая таблица' : 'Live Table',
    season: isKa ? 'სეზონი' : isRu ? 'Сезон' : 'Season',
    champion: isKa ? 'ჩემპიონი' : isRu ? 'Чемпион' : 'Champion',
    relegated: isKa ? 'დაქვეითება' : isRu ? 'Вылет' : 'Relegation',
    championsLeague: isKa ? 'ჩემპიონთა ლიგა' : isRu ? 'Лига чемпионов' : 'Champions League',
    podium: isKa ? 'ლიდერები' : isRu ? 'Лидеры' : 'Leaders',
    pts: isKa ? 'ქულა' : isRu ? 'очк.' : 'pts',
    goals: isKa ? 'გოლი' : isRu ? 'голов' : 'goals',
    conceded: isKa ? 'გაშვებული' : isRu ? 'пропущено' : 'conceded',
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * გუნდის ემბლემის URL.
 * TheSportsDB table endpoint ხშირად არ აბრუნებს ბეჯს, ამიტომ
 * თუ ველი ცარიელია — ვაგებთ URL-ს გუნდის ID-ით (იგივე პატერნი
 * რაც Homepage-სა და Predictions გვერდზე გვაქვს).
 */
function getTeamBadge(team: TableRow): string {
  const direct = team.strTeamBadge || team.strBadge;
  if (direct) return direct;
  return `https://www.thesportsdb.com/images/media/team/badge/${team.idTeam}.png`;
}

/** სტატიკური Tailwind კლასები (დინამიკური `hover:border-${x}` არ მუშაობს) */
const ACCENT_STYLES: Record<
  Accent,
  { text: string; bg: string; border: string; hoverBorder: string; glow: string; bar: string }
> = {
  lime: {
    text: 'text-lime',
    bg: 'bg-lime/10',
    border: 'border-lime/30',
    hoverBorder: 'hover:border-lime/50',
    glow: 'hover:shadow-[0_0_28px_rgba(217,249,157,0.18)]',
    bar: 'from-lime to-teal',
  },
  teal: {
    text: 'text-teal',
    bg: 'bg-teal/10',
    border: 'border-teal/30',
    hoverBorder: 'hover:border-teal/50',
    glow: 'hover:shadow-[0_0_28px_rgba(20,184,166,0.2)]',
    bar: 'from-teal to-blue-500',
  },
  gold: {
    text: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/30',
    hoverBorder: 'hover:border-gold/50',
    glow: 'hover:shadow-[0_0_28px_rgba(251,191,36,0.2)]',
    bar: 'from-gold to-orange-500',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    hoverBorder: 'hover:border-danger/50',
    glow: 'hover:shadow-[0_0_28px_rgba(239,68,68,0.2)]',
    bar: 'from-danger to-orange-500',
  },
};

function getRankStyle(rank: number, total: number) {
  if (rank === 1)
    return {
      text: 'text-gold',
      bg: 'bg-gradient-to-br from-gold/30 to-gold/10',
      border: 'border-gold/60',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
      icon: Crown,
    };
  if (rank === 2)
    return {
      text: 'text-slate-300',
      bg: 'bg-gradient-to-br from-slate-400/30 to-slate-500/10',
      border: 'border-slate-400/40',
      glow: 'shadow-[0_0_16px_rgba(148,163,184,0.3)]',
      icon: Medal,
    };
  if (rank === 3)
    return {
      text: 'text-[#CD7F32]',
      bg: 'bg-gradient-to-br from-[#CD7F32]/30 to-[#CD7F32]/10',
      border: 'border-[#CD7F32]/50',
      glow: 'shadow-[0_0_16px_rgba(205,127,50,0.3)]',
      icon: Award,
    };
  if (rank <= 4)
    return { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', glow: '', icon: null };
  // ბოლო 3 გუნდი — დაქვეითების ზონა (ლიგის ზომის მიხედვით)
  if (total > 0 && rank > total - 3)
    return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', glow: '', icon: null };
  return { text: 'text-muted', bg: 'bg-surface-hover', border: 'border-edge', glow: '', icon: null };
}

function getFormColor(char: string): string {
  if (char === 'W')
    return 'bg-gradient-to-br from-success to-emerald-600 text-white shadow-[0_0_8px_rgba(34,197,94,0.45)]';
  if (char === 'D')
    return 'bg-gradient-to-br from-gold to-amber-600 text-white shadow-[0_0_8px_rgba(251,191,36,0.45)]';
  if (char === 'L')
    return 'bg-gradient-to-br from-danger to-red-700 text-white shadow-[0_0_8px_rgba(239,68,68,0.45)]';
  return 'bg-surface-hover text-muted';
}

function getFormLetter(char: string, locale: string): string {
  if (locale === 'ka') {
    if (char === 'W') return 'მ';
    if (char === 'D') return 'ფ';
    if (char === 'L') return 'წ';
  }
  if (locale === 'ru') {
    if (char === 'W') return 'В';
    if (char === 'D') return 'Н';
    if (char === 'L') return 'П';
  }
  return char;
}

const toInt = (v: string | null | undefined) => parseInt(v || '0', 10) || 0;

// ═══════════════════════════════════════════════════════════════
//  TEAM BADGE — SafeImage + ლამაზი ინიციალების fallback
// ═══════════════════════════════════════════════════════════════
const BADGE_GRADIENTS = [
  'from-lime to-teal',
  'from-teal to-blue-500',
  'from-gold to-orange-500',
  'from-purple-500 to-pink-500',
  'from-red-500 to-yellow-500',
];

function TeamBadge({ team, size = 32 }: { team: TableRow; size?: number }) {
  const initials = team.strTeam
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const gradient = BADGE_GRADIENTS[team.strTeam.charCodeAt(0) % BADGE_GRADIENTS.length];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <SafeImage
        src={getTeamBadge(team)}
        alt={team.strTeam}
        fill
        unoptimized
        sizes={`${size}px`}
        className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
        fallback={
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-ink font-black`}
            style={{ fontSize: size * 0.36 }}
          >
            {initials}
          </div>
        }
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LEAGUE TABS
// ═══════════════════════════════════════════════════════════════
function LeagueTabs({ activeId, locale }: { activeId: string; locale: string }) {
  const getName = (l: (typeof LEAGUES)[number]) =>
    locale === 'ka' ? l.nameKa : locale === 'ru' ? l.nameRu : l.nameEn;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide">
      {LEAGUES.map((league) => {
        const isActive = league.id === activeId;
        return (
          <Link
            key={league.id}
            href={`/${locale}/analytics?league=${league.id}`}
            scroll={false}
            aria-current={isActive ? 'page' : undefined}
            className={`group shrink-0 inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-br ${league.color} text-white scale-105`
                : 'bg-surface/60 backdrop-blur-xl border border-edge text-muted hover:text-text hover:border-lime/40 hover:scale-105'
            }`}
            style={isActive ? { boxShadow: `0 10px 40px -10px ${league.glow}` } : undefined}
          >
            <span className="text-2xl leading-none">{league.flag}</span>
            <span className="whitespace-nowrap">{getName(league)}</span>
            {isActive && <Sparkles size={14} className="opacity-90" />}
          </Link>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════════════════
const STAT_COLORS = {
  lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30', gradient: 'from-lime/20' },
  teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', gradient: 'from-teal/20' },
  gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', gradient: 'from-gold/20' },
  danger: { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', gradient: 'from-danger/20' },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'lime',
  trend,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  color?: keyof typeof STAT_COLORS;
  trend?: { direction: 'up' | 'down' | 'flat'; value: string };
}) {
  const c = STAT_COLORS[color];
  const TrendIcon = trend?.direction === 'up' ? ArrowUp : trend?.direction === 'down' ? ArrowDown : Minus;
  const trendColor =
    trend?.direction === 'up' ? 'text-success' : trend?.direction === 'down' ? 'text-danger' : 'text-muted';

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-[10px] lg:text-xs font-bold text-muted uppercase tracking-widest">{label}</span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${c.bg} ${c.border} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={16} className={c.text} />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className={`font-mono text-3xl lg:text-4xl font-black ${c.text} leading-none tabular-nums`}>
            {value}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PODIUM — TOP 3 დიდი ბარათებით ემბლემებით
// ═══════════════════════════════════════════════════════════════
function Podium({
  teams,
  locale,
  t,
}: {
  teams: TableRow[];
  locale: string;
  t: ReturnType<typeof getT>;
}) {
  if (teams.length < 3) return null;

  // ვიზუალური თანმიმდევრობა: 2 - 1 - 3
  const order = [teams[1], teams[0], teams[2]];
  const config = [
    { rank: 2, height: 'lg:mt-10', ring: 'border-slate-400/50', glow: 'rgba(148,163,184,0.25)', Icon: Medal, color: 'text-slate-300', grad: 'from-slate-400/20' },
    { rank: 1, height: '', ring: 'border-gold/60', glow: 'rgba(251,191,36,0.35)', Icon: Crown, color: 'text-gold', grad: 'from-gold/25' },
    { rank: 3, height: 'lg:mt-16', ring: 'border-[#CD7F32]/50', glow: 'rgba(205,127,50,0.25)', Icon: Award, color: 'text-[#CD7F32]', grad: 'from-[#CD7F32]/20' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
      {order.map((team, i) => {
        const c = config[i];
        const gd = toInt(team.intGoalDifference);
        return (
          <Link
            key={team.idTeam}
            href={`/${locale}/teams/${team.idTeam}`}
            className={`group relative overflow-hidden rounded-3xl border ${c.ring} bg-gradient-to-b ${c.grad} via-surface/50 to-surface/70 backdrop-blur-xl p-6 text-center transition-all duration-500 hover:-translate-y-2 ${c.height} ${
              c.rank === 1 ? 'order-first lg:order-none' : ''
            }`}
            style={{ boxShadow: `0 20px 60px -20px ${c.glow}` }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"
              style={{ background: c.glow }}
            />

            <div className="relative">
              <div className={`inline-flex items-center gap-1.5 mb-4 ${c.color}`}>
                <c.Icon size={18} strokeWidth={2.4} />
                <span className="font-mono text-sm font-black tracking-widest">#{c.rank}</span>
              </div>

              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <TeamBadge team={team} size={c.rank === 1 ? 88 : 72} />
              </div>

              <h3 className="font-heading text-lg font-black text-text mb-1 truncate group-hover:text-lime transition-colors">
                {team.strTeam}
              </h3>

              <div className={`font-mono text-4xl font-black ${c.color} tabular-nums leading-none mb-1`}>
                {team.intPoints}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-widest mb-5">{t.pts}</div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-edge/50">
                <div>
                  <div className="font-mono text-sm font-bold text-success">{team.intWin}</div>
                  <div className="text-[9px] text-muted uppercase">{t.wins}</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-gold">{team.intDraw}</div>
                  <div className="text-[9px] text-muted uppercase">{t.draws}</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-danger">{team.intLoss}</div>
                  <div className="text-[9px] text-muted uppercase">{t.losses}</div>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-muted font-mono">
                {team.intGoalsFor}:{team.intGoalsAgainst}{' '}
                <span className={gd > 0 ? 'text-teal' : gd < 0 ? 'text-danger' : ''}>
                  ({gd > 0 ? '+' : ''}
                  {gd})
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  FORM DOTS — ბოლო 5 მატჩი
// ═══════════════════════════════════════════════════════════════
function FormDots({ form, locale }: { form: string | null; locale: string }) {
  if (!form) return null;
  const chars = form.trim().toUpperCase().slice(-5).split('');
  return (
    <div className="flex items-center gap-1">
      {chars.map((ch, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${getFormColor(ch)}`}
        >
          {getFormLetter(ch, locale)}
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LEAGUE TABLE
// ═══════════════════════════════════════════════════════════════
function LeagueTable({
  teams,
  locale,
  t,
}: {
  teams: TableRow[];
  locale: string;
  t: ReturnType<typeof getT>;
}) {
  const total = teams.length;
  const maxPoints = Math.max(...teams.map((tm) => toInt(tm.intPoints)), 1);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

      {/* Header — desktop */}
      <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-4 bg-gradient-to-r from-surface/80 via-surface/60 to-surface/80 border-b border-edge/50 text-[10px] font-black text-muted uppercase tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-3">{t.team}</div>
        <div className="col-span-1 text-center">{t.played}</div>
        <div className="col-span-1 text-center">{t.wins}</div>
        <div className="col-span-1 text-center">{t.draws}</div>
        <div className="col-span-1 text-center">{t.losses}</div>
        <div className="col-span-1 text-center">{t.goalDiff}</div>
        <div className="col-span-2 text-center">{t.form}</div>
        <div className="col-span-1 text-center">{t.points}</div>
      </div>

      <div className="divide-y divide-edge/30">
        {teams.map((team) => {
          const rank = toInt(team.intRank);
          const colors = getRankStyle(rank, total);
          const gd = toInt(team.intGoalDifference);
          const pts = toInt(team.intPoints);
          const RankIcon = colors.icon;
          const pct = Math.round((pts / maxPoints) * 100);

          return (
            <Link
              key={team.idTeam}
              href={`/${locale}/teams/${team.idTeam}`}
              className="group relative grid grid-cols-12 gap-2 items-center px-5 py-4 hover:bg-surface-hover/40 transition-all duration-300"
            >
              {/* Left zone indicator */}
              {rank === 1 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/60 to-transparent" />
              )}
              {rank >= 2 && rank <= 4 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal/60 via-teal/30 to-transparent" />
              )}
              {total > 0 && rank > total - 3 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-danger/60 via-danger/30 to-transparent" />
              )}

              {/* Rank */}
              <div className="col-span-2 lg:col-span-1 flex justify-center">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm font-black border ${colors.bg} ${colors.border} ${colors.text} ${colors.glow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {RankIcon ? <RankIcon size={16} strokeWidth={2.5} /> : rank}
                </span>
              </div>

              {/* Team */}
              <div className="col-span-10 lg:col-span-3 flex items-center gap-3 min-w-0">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <TeamBadge team={team} size={34} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-text truncate group-hover:text-lime transition-colors">
                    {team.strTeam}
                  </div>
                  {/* points progress */}
                  <div className="mt-1.5 h-1 rounded-full bg-edge/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime to-teal transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile stats */}
              <div className="col-span-12 lg:hidden flex items-center justify-between text-[10px] mt-3 pt-3 border-t border-edge/40">
                {[
                  { l: t.played, v: team.intPlayed, c: 'text-text' },
                  { l: t.wins, v: team.intWin, c: 'text-success' },
                  { l: t.draws, v: team.intDraw, c: 'text-gold' },
                  { l: t.losses, v: team.intLoss, c: 'text-danger' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="text-muted uppercase text-[9px] mb-0.5">{s.l}</div>
                    <div className={`font-mono text-xs font-bold ${s.c}`}>{s.v}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="text-muted uppercase text-[9px] mb-0.5">{t.goalDiff}</div>
                  <div
                    className={`font-mono text-xs font-bold ${
                      gd > 0 ? 'text-teal' : gd < 0 ? 'text-danger' : 'text-muted'
                    }`}
                  >
                    {gd > 0 ? '+' : ''}
                    {gd}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted uppercase text-[9px] mb-0.5">{t.points}</div>
                  <div className="font-mono text-sm font-black text-lime">{team.intPoints}</div>
                </div>
              </div>

              {/* Desktop stats */}
              <div className="hidden lg:block col-span-1 text-center font-mono text-sm text-muted">
                {team.intPlayed}
              </div>
              <div className="hidden lg:block col-span-1 text-center font-mono text-sm text-success font-semibold">
                {team.intWin}
              </div>
              <div className="hidden lg:block col-span-1 text-center font-mono text-sm text-gold font-semibold">
                {team.intDraw}
              </div>
              <div className="hidden lg:block col-span-1 text-center font-mono text-sm text-danger font-semibold">
                {team.intLoss}
              </div>
              <div
                className={`hidden lg:block col-span-1 text-center font-mono text-sm font-bold ${
                  gd > 0 ? 'text-teal' : gd < 0 ? 'text-danger' : 'text-muted'
                }`}
              >
                {gd > 0 ? '+' : ''}
                {gd}
              </div>
              <div className="hidden lg:flex col-span-2 justify-center">
                <FormDots form={team.strForm} locale={locale} />
              </div>
              <div className="hidden lg:flex col-span-1 justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-lime/10 border border-lime/30 font-mono text-sm font-black text-lime">
                  {team.intPoints}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 px-5 py-4 bg-surface/40 border-t border-edge/50 text-[10px] text-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span>{t.champion}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal" />
          <span>{t.championsLeague}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span>{t.relegated}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOP TEAM CARD
// ═══════════════════════════════════════════════════════════════
function TopTeamCard({
  team,
  rank,
  metric,
  metricLabel,
  locale,
  accent = 'lime',
  percent,
}: {
  team: TableRow;
  rank: number;
  metric: string;
  metricLabel: string;
  locale: string;
  accent?: Accent;
  percent: number;
}) {
  const a = ACCENT_STYLES[accent];
  const rankColors = getRankStyle(rank, 0);
  const RankIcon = rank <= 3 ? rankColors.icon : null;

  return (
    <Link
      href={`/${locale}/teams/${team.idTeam}`}
      className={`group relative overflow-hidden block p-4 rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge/70 ${a.hoverBorder} ${a.glow} transition-all duration-300 hover:-translate-x-1`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm font-black border shrink-0 ${rankColors.bg} ${rankColors.border} ${rankColors.text} group-hover:scale-110 transition-transform`}
        >
          {RankIcon ? <RankIcon size={16} /> : rank}
        </span>

        <div className="group-hover:scale-110 transition-transform duration-300">
          <TeamBadge team={team} size={38} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-text truncate group-hover:text-lime transition-colors">
            {team.strTeam}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider">{metricLabel}</div>
        </div>

        <div className={`font-mono text-2xl font-black ${a.text} tabular-nums shrink-0`}>{metric}</div>
      </div>

      {/* progress bar */}
      <div className="mt-3 h-1 rounded-full bg-edge/50 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${a.bar} transition-all duration-1000`}
          style={{ width: `${Math.max(percent, 6)}%` }}
        />
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION TITLE
// ═══════════════════════════════════════════════════════════════
function SectionTitle({
  title,
  subtitle,
  from = 'from-lime',
  to = 'to-teal',
  children,
}: {
  title: string;
  subtitle?: string;
  from?: string;
  to?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-1 h-7 rounded-full bg-gradient-to-b ${from} ${to} shadow-[0_0_16px_rgba(217,249,157,0.6)]`} />
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="font-heading text-xl lg:text-2xl font-bold text-text tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ title, hint, icon: Icon }: { title: string; hint?: string; icon: typeof BarChart3 }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Icon size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <h3 className="font-heading text-xl lg:text-2xl font-bold text-text mb-3">{title}</h3>
        {hint && <p className="text-sm text-muted/70 max-w-md mx-auto">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
  const { locale } = await params;
  const { league: leagueParam } = await searchParams;

  setRequestLocale(locale);
  const t = getT(locale);

  const activeLeague = LEAGUES.find((l) => l.id === leagueParam) || LEAGUES[0];
  const activeLeagueId = activeLeague.id;

  const now = new Date();
  const currentYear = now.getFullYear();
  const seasonString =
    now.getMonth() >= 6 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

  let tableRaw: TableRow[] = [];
  try {
    tableRaw = await getLeagueTable(activeLeague.id, seasonString);
  } catch {
    tableRaw = [];
  }

  const teams: TableRow[] = Array.isArray(tableRaw) ? tableRaw : [];

  const totalTeams = teams.length;
  const totalMatches = teams.reduce((sum, tm) => sum + toInt(tm.intPlayed), 0) / 2;
  const totalGoals = teams.reduce((sum, tm) => sum + toInt(tm.intGoalsFor), 0);
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0.00';

  const topTeams = teams.slice(0, 5);
  const bestAttack = [...teams].sort((a, b) => toInt(b.intGoalsFor) - toInt(a.intGoalsFor)).slice(0, 5);
  const bestDefense = [...teams].sort((a, b) => toInt(a.intGoalsAgainst) - toInt(b.intGoalsAgainst)).slice(0, 5);

  const maxPts = Math.max(...topTeams.map((x) => toInt(x.intPoints)), 1);
  const maxAttack = Math.max(...bestAttack.map((x) => toInt(x.intGoalsFor)), 1);
  const worstDefenseInList = Math.max(...bestDefense.map((x) => toInt(x.intGoalsAgainst)), 1);

  const leagueName =
    locale === 'ka' ? activeLeague.nameKa : locale === 'ru' ? activeLeague.nameRu : activeLeague.nameEn;

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/5 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[200px]" />
        <div
          className="absolute bottom-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[220px] transition-colors"
          style={{ background: activeLeague.glow, opacity: 0.12 }}
        />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══ HEADER ═══ */}
          <header className="pt-8 lg:pt-14 pb-8">
            <nav className="flex items-center gap-2 text-xs text-muted mb-6" aria-label="Breadcrumb">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">
                {t.home}
              </Link>
              <ChevronRight size={12} className="text-muted/50" />
              <span className="text-text font-medium">{t.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal/15 via-lime/10 to-teal/15 border border-teal/30 mb-5">
                  <BarChart3 size={13} className="text-teal" />
                  <span className="text-[10px] font-black text-teal uppercase tracking-widest">
                    Live Statistics
                  </span>
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-75" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-teal" />
                  </span>
                </div>

                <h1 className="font-heading text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[0.95] bg-gradient-to-br from-text via-text to-text/60 bg-clip-text text-transparent">
                  {t.title}
                </h1>

                <p className="mt-4 text-base lg:text-lg text-muted max-w-2xl leading-relaxed">{t.subtitle}</p>
              </div>

              {/* League badge */}
              <div
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${activeLeague.color} p-4 min-w-[200px] shrink-0`}
                style={{ boxShadow: `0 20px 60px -20px ${activeLeague.glow}` }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <span className="text-4xl leading-none">{activeLeague.flag}</span>
                  <div>
                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-0.5">
                      {t.season}
                    </div>
                    <div className="text-sm font-black text-white leading-tight">{leagueName}</div>
                    <div className="font-mono text-xs font-bold text-white/90 mt-0.5">{seasonString}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ LEAGUE TABS ═══ */}
          <section className="mb-10">
            <LeagueTabs activeId={activeLeagueId} locale={locale} />
          </section>

          {teams.length > 0 ? (
            <>
              {/* ═══ PODIUM ═══ */}
              {teams.length >= 3 && (
                <section className="mb-14">
                  <SectionTitle title={t.podium} from="from-gold" to="to-orange-500" />
                  <Podium teams={teams} locale={locale} t={t} />
                </section>
              )}

              {/* ═══ OVERVIEW ═══ */}
              <section className="mb-14">
                <SectionTitle title={t.overview} subtitle={t.subtitle} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label={t.totalTeams} value={totalTeams} color="lime" />
                  <StatCard icon={Activity} label={t.totalMatches} value={Math.floor(totalMatches)} color="teal" />
                  <StatCard icon={Target} label={t.totalGoals} value={totalGoals} color="gold" />
                  <StatCard icon={TrendingUp} label={t.avgGoals} value={avgGoals} color="danger" />
                </div>
              </section>

              {/* ═══ TABLE ═══ */}
              <section className="mb-14">
                <SectionTitle title={t.leagueTable} from="from-teal" to="to-lime">
                  <Badge variant="teal" size="sm">
                    <Zap size={10} className="mr-1" />
                    {t.liveTable}
                  </Badge>
                </SectionTitle>
                <LeagueTable teams={teams} locale={locale} t={t} />
              </section>

              {/* ═══ TOP LISTS ═══ */}
              <section className="mb-14">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Teams */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        <Trophy size={16} className="text-ink" strokeWidth={2.2} />
                      </div>
                      <h3 className="font-heading text-sm font-black text-text uppercase tracking-widest">
                        {t.topTeams}
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {topTeams.map((team, i) => (
                        <TopTeamCard
                          key={team.idTeam}
                          team={team}
                          rank={i + 1}
                          metric={team.intPoints}
                          metricLabel={t.points}
                          locale={locale}
                          accent="gold"
                          percent={(toInt(team.intPoints) / maxPts) * 100}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Best Attack */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-danger to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        <Flame size={16} className="text-white" strokeWidth={2.2} />
                      </div>
                      <h3 className="font-heading text-sm font-black text-text uppercase tracking-widest">
                        {t.bestAttack}
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {bestAttack.map((team, i) => (
                        <TopTeamCard
                          key={team.idTeam}
                          team={team}
                          rank={i + 1}
                          metric={team.intGoalsFor}
                          metricLabel={t.goals}
                          locale={locale}
                          accent="danger"
                          percent={(toInt(team.intGoalsFor) / maxAttack) * 100}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Best Defense */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                        <Shield size={16} className="text-white" strokeWidth={2.2} />
                      </div>
                      <h3 className="font-heading text-sm font-black text-text uppercase tracking-widest">
                        {t.bestDefense}
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {bestDefense.map((team, i) => (
                        <TopTeamCard
                          key={team.idTeam}
                          team={team}
                          rank={i + 1}
                          metric={team.intGoalsAgainst}
                          metricLabel={t.conceded}
                          locale={locale}
                          accent="teal"
                          // ნაკლები გაშვებული გოლი = უკეთესი → ზოლი შებრუნებულია
                          percent={
                            100 - (toInt(team.intGoalsAgainst) / worstDefenseInList) * 60
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ═══ INFO ═══ */}
              <section className="pb-16">
                <div className="relative overflow-hidden bg-gradient-to-br from-teal/5 via-transparent to-lime/5 border border-teal/20 rounded-3xl p-6">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
                      <Info size={18} className="text-teal" />
                    </div>
                    <p className="text-sm text-muted leading-relaxed pt-2">{t.info}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="pb-16">
              <EmptyState title={t.noData} hint={t.noDataHint} icon={BarChart3} />
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}