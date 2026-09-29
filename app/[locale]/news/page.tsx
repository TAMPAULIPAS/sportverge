// ═══════════════════════════════════════════════════════════════
//  SportVerge — News Page (Clean)
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getRSSNews, getAllRSSNews, type RSSArticle } from '@/lib/api/rss';
import { articleSlug } from '@/lib/slug';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { SafeImage } from '@/components/news/SafeImage';
import {
  Sparkles,
  TrendingUp,
  Rss,
  Clock,
  Calendar,
  ArrowRight,
  Newspaper,
  Flame,
  Zap,
} from 'lucide-react';

interface NewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

const CATEGORIES = [
  { key: 'all', emoji: '📰', labelKa: 'ყველა', labelEn: 'All', labelRu: 'Все' },
  { key: 'football', emoji: '⚽', labelKa: 'ფეხბურთი', labelEn: 'Football', labelRu: 'Футбол' },
  { key: 'basketball', emoji: '🏀', labelKa: 'კალათბურთი', labelEn: 'Basketball', labelRu: 'Баскетбол' },
  { key: 'tennis', emoji: '🎾', labelKa: 'ჩოგბურთი', labelEn: 'Tennis', labelRu: 'Теннис' },
  { key: 'f1', emoji: '🏎️', labelKa: 'ფორმულა 1', labelEn: 'F1', labelRu: 'Формула 1' },
  { key: 'ufc', emoji: '🥊', labelKa: 'UFC', labelEn: 'UFC', labelRu: 'UFC' },
];

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'სიახლეები' : isRu ? 'Новости' : 'News',
    subtitle: isKa
      ? 'უახლესი სპორტული ამბები მთელი მსოფლიოდან'
      : isRu
      ? 'Последние спортивные новости со всего мира'
      : 'Latest sports stories from around the world',
    noNews: isKa ? 'სიახლეები მალე დაემატება' : isRu ? 'Новости скоро появятся' : 'News coming soon',
    noNewsDesc: isKa
      ? 'RSS წყაროები მომენტალურად იტვირთება.'
      : isRu
      ? 'RSS-источники загружаются мгновенно.'
      : 'RSS sources load instantly.',
    articles: isKa ? 'სტატია' : isRu ? 'Статей' : 'Articles',
    latest: isKa ? 'უახლესი' : isRu ? 'Последние' : 'Latest',
    trending: isKa ? 'ტრენდული' : isRu ? 'В тренде' : 'Trending',
    readMore: isKa ? 'სრულად' : isRu ? 'Читать' : 'Read more',
    min: isKa ? 'წთ' : isRu ? 'мин' : 'min',
    home: isKa ? 'მთავარი' : isRu ? 'Главная' : 'Home',
    noImage: isKa ? 'სურათი მიუწვდომელია' : isRu ? 'Изображение недоступно' : 'Image unavailable',
    live: isKa ? 'ახალი' : isRu ? 'Новое' : 'New',
    hot: isKa ? 'ცხელი' : isRu ? 'Горячее' : 'Hot',
  };
}

type T = ReturnType<typeof getT>;

function formatDate(date: string, locale: string): string {
  try {
    const d = new Date(date);
    const localeMap: Record<string, string> = {
      ka: 'ka-GE',
      en: 'en-US',
      ru: 'ru-RU',
    };
    return d.toLocaleDateString(localeMap[locale] || 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return date;
  }
}

function calculateReadTime(text: string | null | undefined): number {
  return Math.max(1, Math.ceil((text?.length || 0) / 200));
}

function getCategoryLabel(category: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    football: { ka: 'ფეხბურთი', en: 'Football', ru: 'Футбол' },
    basketball: { ka: 'კალათბურთი', en: 'Basketball', ru: 'Баскетбол' },
    tennis: { ka: 'ჩოგბურთი', en: 'Tennis', ru: 'Теннис' },
    f1: { ka: 'ფორმულა 1', en: 'F1', ru: 'Формула 1' },
    ufc: { ka: 'UFC', en: 'UFC', ru: 'UFC' },
    general: { ka: 'სპორტი', en: 'Sports', ru: 'Спорт' },
  };
  return labels[category]?.[locale] || labels.general[locale] || 'Sports';
}

// ═══════════════════════════════════════════════════════════════
//  FEATURED CARD
// ═══════════════════════════════════════════════════════════════
function FeaturedCard({
  article,
  locale,
  t,
}: {
  article: RSSArticle;
  locale: string;
  t: T;
}) {
  const readTime = calculateReadTime(article.description);
  const categoryLabel = getCategoryLabel(article.category, locale);
  const slug = articleSlug(article);

  return (
    <Link
      href={`/${locale}/news/${slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-edge/50 bg-surface/60 backdrop-blur-xl hover:border-lime/50 transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-surface to-surface-hover">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-lime/10 via-surface to-teal/10">
              <div className="w-16 h-16 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center">
                <Newspaper size={28} className="text-lime/60" />
              </div>
              <p className="text-[10px] text-muted/60">{t.noImage}</p>
            </div>
          }
        />

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant="lime" size="sm">
            <Flame size={10} className="mr-1" />
            {t.hot}
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur-md border border-white/10 text-[10px] font-medium text-text">
            {article.source}
          </span>
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="px-2.5 py-1 rounded-full bg-lime/20 backdrop-blur-md border border-lime/30 text-[10px] font-semibold text-lime">
            {categoryLabel}
          </span>
        </div>
      </div>

      <div className="relative p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-3 text-[10px] text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} />
            <span>{formatDate(article.publishedAt, locale)}</span>
          </div>
          <span className="text-muted/40">•</span>
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>
              {readTime} {t.min}
            </span>
          </div>
        </div>

        <h3 className="font-heading text-lg lg:text-2xl font-bold text-text leading-tight mb-3 line-clamp-3 group-hover:text-lime/90 transition-colors">
          {article.title}
        </h3>

        {article.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs font-semibold text-lime">
          <span>{t.readMore}</span>
          <ArrowRight
            size={12}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  NEWS CARD
// ═══════════════════════════════════════════════════════════════
function NewsCard({
  article,
  locale,
  t,
}: {
  article: RSSArticle;
  locale: string;
  t: T;
}) {
  const readTime = calculateReadTime(article.description);
  const categoryLabel = getCategoryLabel(article.category, locale);
  const slug = articleSlug(article);

  return (
    <Link
      href={`/${locale}/news/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-edge/50 bg-surface/40 backdrop-blur-xl hover:border-lime/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-surface to-surface-hover">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-lime/5 via-surface to-teal/5">
              <div className="w-12 h-12 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center">
                <Newspaper size={22} className="text-lime/50" />
              </div>
              <p className="text-[9px] text-muted/50">{t.noImage}</p>
            </div>
          }
        />

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full bg-ink/80 backdrop-blur-md border border-white/10 text-[9px] font-medium text-text">
            {article.source}
          </span>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ink/60 backdrop-blur-md border border-lime/30">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-lime animate-ping opacity-75" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-lime" />
          </span>
          <span className="text-[9px] font-bold text-lime uppercase tracking-wider">
            {t.live}
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded-full bg-lime/20 backdrop-blur-md border border-lime/30 text-[9px] font-semibold text-lime">
            {categoryLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 lg:p-5">
        <div className="flex items-center gap-2.5 mb-2.5 text-[10px] text-muted">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{formatDate(article.publishedAt, locale)}</span>
          </div>
          <span className="text-muted/40">•</span>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>
              {readTime} {t.min}
            </span>
          </div>
        </div>

        <h3 className="font-heading text-sm lg:text-base font-bold text-text leading-snug mb-2 line-clamp-2 group-hover:text-lime/90 transition-colors">
          {article.title}
        </h3>

        {article.description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3 flex-1">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-[11px] font-semibold text-lime mt-auto">
          <span>{t.readMore}</span>
          <ArrowRight
            size={11}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Rss size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <h3 className="font-heading text-xl lg:text-2xl font-bold text-text mb-3">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { category = 'all' } = await searchParams;

  setRequestLocale(locale);

  const t = getT(locale);

  let articlesRaw: RSSArticle[] = [];
  try {
    if (category === 'all') {
      articlesRaw = await getAllRSSNews(8);
    } else {
      articlesRaw = await getRSSNews(category, 40);
    }
  } catch (error) {
    console.error('[/news] RSS error:', error);
    articlesRaw = [];
  }

  const articles = articlesRaw;

  const categoryCounts = articles.reduce((acc, article) => {
    const cat = article.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const featured = articles.slice(0, 2);
  const rest = articles.slice(2);
  const latestArticles = rest.length > 0 ? rest : articles;

  return (
    <div className="relative">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          <header className="pt-8 lg:pt-12 pb-8">
            <div className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">
                {t.home}
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

              {articles.length > 0 && (
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                  <div className="px-5 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-center">
                    <div className="font-mono text-2xl font-bold text-lime">
                      {articles.length}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {t.articles}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <nav className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const isActive = cat.key === category;
                const label =
                  locale === 'ka' ? cat.labelKa : locale === 'ru' ? cat.labelRu : cat.labelEn;
                const count = cat.key === 'all' ? articles.length : categoryCounts[cat.key] || 0;

                return (
                  <Link
                    key={cat.key}
                    href={`/${locale}/news?category=${cat.key}`}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-lime text-ink shadow-[0_0_24px_rgba(217,249,157,0.3)]'
                        : 'bg-surface/60 backdrop-blur-xl border border-edge text-muted hover:text-text hover:border-lime/40'
                    }`}
                  >
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <span>{label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-ink/20 text-ink' : 'bg-surface-hover text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {featured.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1 h-6 rounded-full bg-lime shadow-[0_0_12px_rgba(217,249,157,0.8)]" />
                <h2 className="font-heading text-lg lg:text-xl font-bold text-text">
                  {t.trending}
                </h2>
                <Badge variant="lime" size="sm" icon={<TrendingUp size={10} />}>
                  {t.hot.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featured.map((article, i) => (
                  <FeaturedCard
                    key={`featured-${articleSlug(article)}-${i}`}
                    article={article}
                    locale={locale}
                    t={t}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="pb-16">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-teal shadow-[0_0_12px_rgba(20,184,166,0.8)]" />
                <h2 className="font-heading text-lg lg:text-xl font-bold text-text">
                  {t.latest}
                </h2>
              </div>
              {latestArticles.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  <Zap size={11} className="text-lime" />
                  <span className="font-mono">
                    {latestArticles.length} {t.articles}
                  </span>
                </div>
              )}
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {latestArticles.map((article, i) => (
                  <NewsCard
                    key={`news-${articleSlug(article)}-${i}`}
                    article={article}
                    locale={locale}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={t.noNews} description={t.noNewsDesc} />
            )}
          </section>
        </Container>
      </div>
    </div>
  );
}