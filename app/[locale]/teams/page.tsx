// ═══════════════════════════════════════════════════════════════
//  SportVerge — Teams List Page
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getAllTeamsInLeague } from '@/lib/api/sportsdb';
import { LEAGUES } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { ScrollReveal } from '@/components/layout/ScrollReveal';
import { SponsorTopBanner } from '@/components/sponsors/SponsorBanner';
import { Shield, ChevronRight, Trophy } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';
  const t = (ka: string, en: string, ru: string) => (isKa ? ka : isRu ? ru : en);

  return {
    title: t('გუნდები', 'Teams', 'Команды'),
    subtitle: t('ყველა ტოპ გუნდი ერთ სივრცეში', 'All top teams in one place', 'Все топ-команды в одном месте'),
    home: t('მთავარი', 'Home', 'Главная'),
    noTeams: t('გუნდები ვერ მოიძებნა', 'No teams found', 'Команды не найдены'),
    viewTeam: t('გუნდის ნახვა', 'View team', 'Смотреть'),
  };
}

export default async function TeamsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  // Fetch teams from major leagues
  const leagueIds = [
    { name: 'English Premier League', id: LEAGUES.PREMIER_LEAGUE.id },
    { name: 'Spanish La Liga', id: LEAGUES.LA_LIGA.id },
    { name: 'Italian Serie A', id: LEAGUES.SERIE_A.id },
    { name: 'German Bundesliga', id: LEAGUES.BUNDESLIGA.id },
    { name: 'French Ligue 1', id: LEAGUES.LIGUE_1.id },
  ];

  const results = await Promise.all(
    leagueIds.map(async (l) => {
      try {
        const teams = await getAllTeamsInLeague(l.name);
        return (teams || []).map((team) => ({ ...team, leagueId: l.id }));
      } catch {
        return [];
      }
    })
  );

  const allTeams = results.flat().slice(0, 60);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal/[0.04] rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* Sponsor Top Banner */}
          <div className="pt-6 lg:pt-8">
            <SponsorTopBanner locale={locale} />
          </div>

          {/* Header */}
          <header className="pt-8 lg:pt-12 pb-8">
            <nav className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">
                {t.home}
              </Link>
              <ChevronRight size={12} />
              <span className="text-text font-medium">{t.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-7 rounded-full bg-lime shadow-[0_0_14px_rgba(217,249,157,0.8)]" />
              <Shield size={24} className="text-lime" />
              <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.05]">
                {t.title}
              </h1>
            </div>
            <p className="text-base lg:text-lg text-muted max-w-2xl">{t.subtitle}</p>
          </header>

          {/* Teams Grid */}
          {allTeams.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 pb-16">
              {allTeams.map((team, i) => (
                <ScrollReveal key={team.idTeam} delay={Math.min(i * 0.03, 0.5)}>
                  <Link
                    href={`/${locale}/teams/${team.idTeam}`}
                    className="group relative block overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 hover:border-lime/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(217,249,157,0.2)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 mb-4 group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-lime/20 to-teal/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                        <Image
                          src={team.strTeamBadge || `https://r2.thesportsdb.com/images/media/team/badge/${team.idTeam}.png`}
                          alt={team.strTeam}
                          fill
                          sizes="80px"
                          className="object-contain relative z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                          unoptimized
                        />
                      </div>

                      <h4 className="font-heading text-sm font-bold text-text truncate w-full mb-1 group-hover:text-lime transition-colors">
                        {team.strTeam}
                      </h4>

                      {team.strLeague && (
                        <div className="text-[10px] uppercase tracking-widest text-muted font-bold truncate w-full mb-3">
                          {team.strLeague}
                        </div>
                      )}

                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-surface/60 border border-edge/60 text-muted group-hover:border-lime/40 group-hover:text-lime transition-all">
                        {t.viewTeam}
                        <ChevronRight size={10} />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center mb-16">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-surface-hover border border-edge flex items-center justify-center">
                <Trophy size={32} className="text-lime/60" />
              </div>
              <p className="text-base lg:text-lg text-muted font-medium">{t.noTeams}</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}