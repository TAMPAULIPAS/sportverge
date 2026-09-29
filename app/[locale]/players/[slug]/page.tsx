// ═══════════════════════════════════════════════════════════════
//  SportVerge — Players Page (Ultra Premium)
//  მოთამაშეები რეალური მონაცემებით TheSportsDB API-დან
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import {
  getPlayersByTeam,
  GEORGIAN_TEAMS,
  type SportsDBPlayer,
} from '@/lib/api/sportsdb';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  User,
  Shield,
  Sparkles,
  ChevronRight,
  Search,
  Trophy,
  Star,
  TrendingUp,
  MapPin,
  Calendar,
  Ruler,
  Weight,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
interface PlayersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ team?: string }>;
}

// ═══════════════════════════════════════════════════════════════
//  TEAMS CONFIG
// ═══════════════════════════════════════════════════════════════
const TEAMS = [
  {
    id: GEORGIAN_TEAMS.dinamoTbilisi,
    nameKa: 'დინამო თბილისი',
    nameEn: 'Dinamo Tbilisi',
    nameRu: 'Динамо Тбилиси',
    flag: '🇬🇪',
  },
  {
    id: GEORGIAN_TEAMS.dinamoBatumi,
    nameKa: 'დინამო ბათუმი',
    nameEn: 'Dinamo Batumi',
    nameRu: 'Динамо Батуми',
    flag: '🇬🇪',
  },
  {
    id: GEORGIAN_TEAMS.torpedoKutaisi,
    nameKa: 'ტორპედო ქუთაისი',
    nameEn: 'Torpedo Kutaisi',
    nameRu: 'Торпедо Кутаиси',
    flag: '🇬🇪',
  },
  {
    id: GEORGIAN_TEAMS.saburtalo,
    nameKa: 'საბურთალო',
    nameEn: 'Saburtalo',
    nameRu: 'Сабуртало',
    flag: '🇬🇪',
  },
];

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'მოთამაშეები' : isRu ? 'Игроки' : 'Players',
    subtitle: isKa
      ? 'მოთამაშეები რეალური მონაცემებით'
      : isRu
      ? 'Игроки с реальными данными'
      : 'Players with real data',

    allTeams: isKa ? 'ყველა გუნდი' : isRu ? 'Все команды' : 'All teams',
    selectTeam: isKa ? 'აირჩიე გუნდი' : isRu ? 'Выбери команду' : 'Select team',

    noPlayers: isKa
      ? 'მოთამაშეები მალე დაემატება'
      : isRu
      ? 'Игроки скоро появятся'
      : 'Players coming soon',
    noPlayersHint: isKa
      ? 'მონაცემები იტვირთება TheSportsDB-დან'
      : isRu
      ? 'Данные загружаются из TheSportsDB'
      : 'Data loading from TheSportsDB',

    position: isKa ? 'პოზიცია' : isRu ? 'Позиция' : 'Position',
    nationality: isKa ? 'ეროვნება' : isRu ? 'Гражданство' : 'Nationality',
    birthDate: isKa ? 'დაბადება' : isRu ? 'Дата рождения' : 'Born',
    height: isKa ? 'სიმაღლე' : isRu ? 'Рост' : 'Height',
    weight: isKa ? 'წონა' : isRu ? 'Вес' : 'Weight',
    number: isKa ? 'ნომერი' : isRu ? 'Номер' : 'Number',
    viewPlayer: isKa ? 'პროფილის ნახვა' : isRu ? 'Смотреть профиль' : 'View profile',

    positionGroups: {
      goalkeeper: isKa ? 'მეკარე' : isRu ? 'Вратарь' : 'Goalkeeper',
      defender: isKa ? 'მცველი' : isRu ? 'Защитник' : 'Defender',
      midfielder: isKa ? 'ნახევარმცველი' : isRu ? 'Полузащитник' : 'Midfielder',
      forward: isKa ? 'თავდამსხმელი' : isRu ? 'Нападающий' : 'Forward',
      unknown: isKa ? 'უცნობი' : isRu ? 'Неизвестно' : 'Unknown',
    },

    stats: {
      teams: isKa ? 'გუნდი' : isRu ? 'Команд' : 'Teams',
      players: isKa ? 'მოთამაშე' : isRu ? 'Игроков' : 'Players',
      countries: isKa ? 'ქვეყანა' : isRu ? 'Стран' : 'Countries',
    },

    nationality: isKa ? 'ეროვნება' : isRu ? 'Гражданство' : 'Nationality',
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getPositionGroup(position: string | null): string {
  if (!position) return 'unknown';
  const p = position.toLowerCase();
  if (p.includes('goalkeeper') || p.includes('keeper')) return 'goalkeeper';
  if (p.includes('defender') || p.includes('back')) return 'defender';
  if (p.includes('midfielder') || p.includes('midfield')) return 'midfielder';
  if (p.includes('forward') || p.includes('striker') || p.includes('winger'))
    return 'forward';
  return 'unknown';
}

function getPositionColor(group: string): {
  text: string;
  bg: string;
  border: string;
} {
  const colors = {
    goalkeeper: {
      text: 'text-gold',
      bg: 'bg-gold/10',
      border: 'border-gold/30',
    },
    defender: {
      text: 'text-teal',
      bg: 'bg-teal/10',
      border: 'border-teal/30',
    },
    midfielder: {
      text: 'text-lime',
      bg: 'bg-lime/10',
      border: 'border-lime/30',
    },
    forward: {
      text: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/30',
    },
    unknown: {
      text: 'text-muted',
      bg: 'bg-surface-hover',
      border: 'border-edge',
    },
  };
  return colors[group as keyof typeof colors] || colors.unknown;
}

function getPlayerPhoto(player: SportsDBPlayer): string | null {
  return player.strCutout || player.strThumb || player.strRender || null;
}

function formatBirthDate(date: string | null, locale: string): string | null {
  if (!date) return null;
  try {
    const dateObj = new Date(date);
    const localeMap = { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' };
    return dateObj.toLocaleDateString(
      localeMap[locale as 'ka' | 'en' | 'ru'] || 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  } catch {
    return date;
  }
}

// ═══════════════════════════════════════════════════════════════
//  PLAYER CARD
// ═══════════════════════════════════════════════════════════════
function PlayerCard({
  player,
  locale,
  index,
}: {
  player: SportsDBPlayer;
  locale: string;
  index: number;
}) {
  const t = getT(locale);
  const photo = getPlayerPhoto(player);
  const positionGroup = getPositionGroup(player.strPosition);
  const colors = getPositionColor(positionGroup);
  const positionLabel =
    t.positionGroups[positionGroup as keyof typeof t.positionGroups];
  const birthDate = formatBirthDate(player.dateBorn, locale);

  return (
    <Link
      href={`/${locale}/players/${player.idPlayer}`}
      className="group relative block overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl hover:border-lime/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
    >
      {/* Top gradient line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />

      {/* Corner glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />

      <div className="relative">
        {/* Photo section */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-surface-hover/50 to-surface/20">
          {/* Number badge */}
          {player.strNumber && (
            <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-ink/80 backdrop-blur-sm border border-edge flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-lime">
                {player.strNumber}
              </span>
            </div>
          )}

          {/* Photo */}
          {photo ? (
            <Image
              src={photo}
              alt={player.strPlayer}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain object-bottom p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-surface-hover border border-edge flex items-center justify-center">
                <User size={32} className="text-muted" />
              </div>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        </div>

        {/* Info section */}
        <div className="relative p-4 -mt-8">
          {/* Position badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${colors.bg} border ${colors.border}`}
            >
              <Shield size={10} className={colors.text} />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}
              >
                {positionLabel}
              </span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-heading text-base lg:text-lg font-bold text-text truncate group-hover:text-lime transition-colors mb-1">
            {player.strPlayer}
          </h3>

          {/* Team */}
          {player.strTeam && (
            <div className="flex items-center gap-1.5 mb-3">
              <Trophy size={10} className="text-muted shrink-0" />
              <span className="text-xs text-muted truncate">
                {player.strTeam}
              </span>
            </div>
          )}

          {/* Meta info */}
          <div className="space-y-1.5 pt-3 border-t border-edge/50">
            {player.strNationality && (
              <div className="flex items-center gap-2 text-[11px]">
                <MapPin size={10} className="text-muted shrink-0" />
                <span className="text-muted truncate">
                  {player.strNationality}
                </span>
              </div>
            )}

            {birthDate && (
              <div className="flex items-center gap-2 text-[11px]">
                <Calendar size={10} className="text-muted shrink-0" />
                <span className="text-muted truncate">{birthDate}</span>
              </div>
            )}

            {player.strHeight && (
              <div className="flex items-center gap-2 text-[11px]">
                <Ruler size={10} className="text-muted shrink-0" />
                <span className="text-muted truncate">{player.strHeight}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-lime uppercase tracking-wider">
            <span>{t.viewPlayer}</span>
            <ChevronRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
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
          <Users size={32} className="text-lime/60" strokeWidth={1.8} />
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
export default async function PlayersPage({
  params,
  searchParams,
}: PlayersPageProps) {
  const { locale } = await params;
  const { team: teamParam } = await searchParams;

  setRequestLocale(locale);

  const t = getT(locale);

  // ─── აქტიური გუნდი ───
  const activeTeamId = teamParam || TEAMS[0].id;
  const activeTeam = TEAMS.find((tm) => tm.id === activeTeamId) || TEAMS[0];

  // ─── მოთამაშეების ჩატვირთვა ───
  let playersRaw: SportsDBPlayer[] = [];
  try {
    playersRaw = await getPlayersByTeam(activeTeam.id);
  } catch {
    playersRaw = [];
  }

  const players: SportsDBPlayer[] = Array.isArray(playersRaw) ? playersRaw : [];

  // ─── გუნდის სახელი locale-ის მიხედვით ───
  const getTeamName = (tm: typeof TEAMS[number]) => {
    if (locale === 'ka') return tm.nameKa;
    if (locale === 'ru') return tm.nameRu;
    return tm.nameEn;
  };

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
              HEADER
          ═══════════════════════════════════════════════════ */}
          <div className="pt-8 lg:pt-12 pb-8">
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

            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
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

              {/* Count badge */}
              {players.length > 0 && (
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                  <div className="px-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-center">
                    <div className="font-mono text-2xl font-bold text-lime">
                      {players.length}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {t.stats.players}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              TEAM FILTER TABS
          ═══════════════════════════════════════════════════ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TEAMS.map((tm) => {
                const isActive = tm.id === activeTeamId;
                return (
                  <Link
                    key={tm.id}
                    href={`/${locale}/players?team=${tm.id}`}
                    className={`group shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-lime text-ink shadow-[0_0_24px_rgba(217,249,157,0.3)]'
                        : 'bg-surface/60 backdrop-blur-xl border border-edge text-muted hover:text-text hover:border-lime/40'
                    }`}
                  >
                    <span className="text-base leading-none">{tm.flag}</span>
                    <span>{getTeamName(tm)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              CURRENT TEAM INFO
          ═══════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6 mb-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl lg:text-5xl leading-none">
                  {activeTeam.flag}
                </div>
                <div>
                  <h2 className="font-heading text-lg lg:text-xl font-bold text-text">
                    {getTeamName(activeTeam)}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <Users size={12} />
                    <span className="font-mono">
                      {players.length} {t.stats.players}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-teal" />
                </span>
                <span className="text-[10px] font-medium text-teal uppercase tracking-wider">
                  Squad
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              PLAYERS GRID
          ═══════════════════════════════════════════════════ */}
          <div className="pb-16">
            {players.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {players.map((player, index) => (
                  <PlayerCard
                    key={player.idPlayer}
                    player={player}
                    locale={locale}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={t.noPlayers} hint={t.noPlayersHint} />
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}