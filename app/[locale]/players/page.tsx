// ═══════════════════════════════════════════════════════════════
//  SportVerge — Players List Page
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { searchPlayersByName } from '@/lib/api/sportsdb';
import { Container } from '@/components/layout/Container';
import { ScrollReveal } from '@/components/layout/ScrollReveal';
import { SponsorTopBanner } from '@/components/sponsors/SponsorBanner';
import { User, ChevronRight, Search } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';
  const t = (ka: string, en: string, ru: string) => (isKa ? ka : isRu ? ru : en);

  return {
    title: t('მოთამაშეები', 'Players', 'Игроки'),
    subtitle: t('ყველა ტოპ სპორტსმენი ერთ სივრცეში', 'All top athletes in one place', 'Все топ-спортсмены в одном месте'),
    home: t('მთავარი', 'Home', 'Главная'),
    noPlayers: t('მოთამაშეები ვერ მოიძებნა', 'No players found', 'Игроки не найдены'),
    viewPlayer: t('ნახვა', 'View', 'Смотреть'),
    searchPlaceholder: t('მოთამაშის ძებნა...', 'Search player...', 'Поиск игрока...'),
  };
}

export default async function PlayersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  // Fetch popular players
  const playerNames = [
    'Messi', 'Ronaldo', 'Mbappe', 'Haaland', 'Kvaratskhelia',
    'Neymar', 'Salah', 'Bellingham', 'Vinicius', 'Kane',
  ];

  const results = await Promise.all(
    playerNames.map(async (name) => {
      try {
        const players = await searchPlayersByName(name);
        return (players || []).slice(0, 3);
      } catch {
        return [];
      }
    })
  );

  const allPlayers = results.flat().slice(0, 40);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-lime/[0.04] rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          <div className="pt-6 lg:pt-8">
            <SponsorTopBanner locale={locale} />
          </div>

          <header className="pt-8 lg:pt-12 pb-8">
            <nav className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">
                {t.home}
              </Link>
              <ChevronRight size={12} />
              <span className="text-text font-medium">{t.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-7 rounded-full bg-teal shadow-[0_0_14px_rgba(20,184,166,0.8)]" />
              <User size={24} className="text-teal" />
              <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.05]">
                {t.title}
              </h1>
            </div>
            <p className="text-base lg:text-lg text-muted max-w-2xl">{t.subtitle}</p>
          </header>

          {allPlayers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 pb-16">
              {allPlayers.map((player, i) => (
                <ScrollReveal key={player.idPlayer} delay={Math.min(i * 0.03, 0.5)}>
                  <Link
                    href={`/${locale}/players/${player.idPlayer}`}
                    className="group relative block overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-4 hover:border-teal/50 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex flex-col items-center text-center">
                      <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden bg-surface-hover border border-edge/50">
                        {player.strCutout || player.strThumb ? (
                          <Image
                            src={player.strCutout || player.strThumb || ''}
                            alt={player.strPlayer}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={32} className="text-teal/40" />
                          </div>
                        )}
                      </div>

                      <h4 className="font-heading text-sm font-bold text-text truncate w-full mb-1 group-hover:text-teal transition-colors">
                        {player.strPlayer}
                      </h4>

                      {player.strTeam && (
                        <div className="text-[10px] uppercase tracking-widest text-muted font-bold truncate w-full mb-3">
                          {player.strTeam}
                        </div>
                      )}

                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-surface/60 border border-edge/60 text-muted group-hover:border-teal/40 group-hover:text-teal transition-all">
                        {t.viewPlayer}
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
                <Search size={32} className="text-teal/60" />
              </div>
              <p className="text-base lg:text-lg text-muted font-medium">{t.noPlayers}</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}