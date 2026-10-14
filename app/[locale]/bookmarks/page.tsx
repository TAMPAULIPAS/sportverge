// ═══════════════════════════════════════════════════════════════
//  SportVerge — Bookmarks Page
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { SponsorTopBanner } from '@/components/sponsors/SponsorBanner';
import { Bookmark, ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';
  const t = (ka: string, en: string, ru: string) => (isKa ? ka : isRu ? ru : en);

  return {
    title: t('შენახული', 'Bookmarks', 'Сохранённые'),
    subtitle: t('შენი შენახული სიახლეები და მატჩები', 'Your saved news and matches', 'Ваши сохранённые новости и матчи'),
    home: t('მთავარი', 'Home', 'Главная'),
    empty: t('ჯერ არაფერი გაქვს შენახული', 'Nothing saved yet', 'Пока ничего не сохранено'),
    emptyHint: t('დააჭირე 🔖 შენახვის ღილაკს სიახლეებში', 'Click the 🔖 save button on news', 'Нажмите 🔖 на новостях'),
    explore: t('სიახლეების დათვალიერება', 'Explore news', 'Изучить новости'),
  };
}

export default async function BookmarksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/[0.04] rounded-full blur-[200px]" />
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
              <span className="w-1.5 h-7 rounded-full bg-lime shadow-[0_0_14px_rgba(217,249,157,0.8)]" />
              <Bookmark size={24} className="text-lime" />
              <h1 className="font-heading text-4xl lg:text-5xl font-black text-text tracking-tight">
                {t.title}
              </h1>
            </div>
            <p className="text-base lg:text-lg text-muted">{t.subtitle}</p>
          </header>

          <div className="relative overflow-hidden bg-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-surface-hover border border-edge flex items-center justify-center">
              <Bookmark size={32} className="text-lime/60" />
            </div>
            <p className="text-base lg:text-lg text-muted font-medium mb-2">{t.empty}</p>
            <p className="text-sm text-muted/70 mb-6">{t.emptyHint}</p>
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime text-ink font-bold text-sm hover:shadow-[0_0_25px_rgba(217,249,157,0.5)] transition-all"
            >
              <span>{t.explore}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}