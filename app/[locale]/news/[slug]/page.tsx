// ═══════════════════════════════════════════════════════════════
//  SportVerge — News Detail Page v4
//  ─────────────────────────────────────────────────────────────
//  ✅ Full article text (fetchFullArticle)
//  ✅ Clean typography for reading
//  ✅ Real images only (no promo banners)
//  ✅ Better structure: hero → content → related
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRSSNews, getAllRSSNews, type RSSArticle } from '@/lib/api/rss';
import { fetchFullArticle } from '@/lib/api/article';
import { slugify } from '@/lib/slug';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
  Newspaper,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';
import { NewsShareButtons } from '@/components/news/NewsShareButtons';
import { NewsBookmark } from '@/components/news/NewsBookmark';
import { ReadingProgress } from '@/components/news/ReadingProgress';
import { RelatedNews } from '@/components/news/RelatedNews';
import { BackToTop } from '@/components/ui/BackToTop';

interface DetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    back: isKa ? 'უკან' : isRu ? 'Назад' : 'Back',
    home: isKa ? 'მთავარი' : isRu ? 'Главная' : 'Home',
    news: isKa ? 'სიახლეები' : isRu ? 'Новости' : 'News',
    readFull: isKa ? 'სრულად წაკითხვა' : isRu ? 'Читать полностью' : 'Read full article',
    source: isKa ? 'წყარო' : isRu ? 'Источник' : 'Source',
    min: isKa ? 'წთ' : isRu ? 'мин' : 'min',
    share: isKa ? 'გაზიარება' : isRu ? 'Поделиться' : 'Share',
    save: isKa ? 'შენახვა' : isRu ? 'Сохранить' : 'Save',
    saved: isKa ? 'შენახულია' : isRu ? 'Сохранено' : 'Saved',
    relatedNews: isKa ? 'მსგავსი სიახლეები' : isRu ? 'Похожие новости' : 'Related news',
    summary: isKa ? 'მოკლედ' : isRu ? 'Кратко' : 'Summary',
    copyLink: isKa ? 'ბმულის კოპირება' : isRu ? 'Копировать ссылку' : 'Copy link',
    copied: isKa ? 'დაკოპირდა!' : isRu ? 'Скопировано!' : 'Copied!',
    fullStory: isKa ? 'სრული სტატია' : isRu ? 'Полная статья' : 'Full Story',
    readTime: isKa ? 'წაკითხვის დრო' : isRu ? 'Время чтения' : 'Read time',
    words: isKa ? 'სიტყვა' : isRu ? 'слов' : 'words',
    noFullText: isKa
      ? 'სრული ტექსტი მიუწვდომელია. გადადით წყაროზე სრულად წასაკითხად.'
      : isRu
      ? 'Полный текст недоступен. Перейдите к источнику.'
      : 'Full text unavailable. Read the complete article at the source.',
    openSource: isKa ? 'წყაროზე გადასვლა' : isRu ? 'Перейти к источнику' : 'Open at source',
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

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
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function getRelativeTime(date: string, locale: string): string {
  try {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const labels: Record<string, Record<string, string>> = {
      ka: { now: 'ახლა', m: 'წთ წინ', h: 'სთ წინ', d: 'დღის წინ' },
      en: { now: 'just now', m: 'min ago', h: 'h ago', d: 'd ago' },
      ru: { now: 'только что', m: 'мин назад', h: 'ч назад', d: 'д назад' },
    };

    const l = labels[locale] ?? labels.en;
    if (minutes < 1) return l.now;
    if (minutes < 60) return `${minutes} ${l.m}`;
    if (hours < 24) return `${hours} ${l.h}`;
    if (days < 30) return `${days} ${l.d}`;
    return formatDate(date, locale);
  } catch {
    return date;
  }
}

function getCategoryLabel(category: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    football: { ka: 'ფეხბურთი', en: 'Football', ru: 'Футбол' },
    basketball: { ka: 'კალათბურთი', en: 'Basketball', ru: 'Баскетбол' },
    tennis: { ka: 'ჩოგბურთი', en: 'Tennis', ru: 'Теннис' },
    f1: { ka: 'ფორმულა 1', en: 'F1', ru: 'Формула 1' },
    ufc: { ka: 'UFC', en: 'UFC', ru: 'UFC' },
    transfers: { ka: 'ტრანსფერები', en: 'Transfers', ru: 'Трансферы' },
    general: { ka: 'სპორტი', en: 'Sports', ru: 'Спорт' },
  };
  return labels[category]?.[locale] || labels.general[locale] || 'Sports';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    football: 'lime',
    basketball: 'gold',
    tennis: 'teal',
    f1: 'red',
    ufc: 'red',
    transfers: 'teal',
    general: 'lime',
  };
  return colors[category] || 'lime';
}

function getSportFallbackImage(category: string): string {
  const map: Record<string, string> = {
    football: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&h=900&fit=crop&q=80',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&h=900&fit=crop&q=80',
    tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&h=900&fit=crop&q=80',
    f1: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1600&h=900&fit=crop&q=80',
    ufc: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1600&h=900&fit=crop&q=80',
    general: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&h=900&fit=crop&q=80',
  };
  return map[category] || map.general;
}

async function getArticle(slug: string): Promise<RSSArticle | null> {
  try {
    const all = await getAllRSSNews(20);

    // 1. Exact ID
    const byId = all.find((a) => a.id === slug);
    if (byId) return byId;

    // 2. Slugify match
    const bySlug = all.find((a) => slugify(a.title) === slug);
    if (bySlug) return bySlug;

    // 3. Partial match
    const slugBase = slug.toLowerCase().replace(/-[a-z0-9]{5,10}$/, '');
    const partial = all.find((a) => slugify(a.title).startsWith(slugBase));
    if (partial) return partial;

    // 4. Word-based match
    const slugWords = slug.split('-').filter((w) => w.length > 3);
    const byWords = all.find((a) => {
      const titleWords = a.title.toLowerCase().split(/\s+/);
      const matches = slugWords.filter((sw) =>
        titleWords.some((tw) => tw.includes(sw) || sw.includes(tw))
      );
      return matches.length >= Math.min(3, Math.ceil(slugWords.length * 0.7));
    });
    if (byWords) return byWords;

    // 5. Per-category
    const categories = ['football', 'basketball', 'tennis', 'f1', 'ufc'];
    for (const cat of categories) {
      const items = await getRSSNews(cat, 40);
      const match =
        items.find((a) => a.id === slug) ||
        items.find((a) => slugify(a.title) === slug);
      if (match) return match;
    }

    return null;
  } catch (error) {
    console.error('[news/[slug]] fetch error:', error);
    return null;
  }
}

function getRelatedArticles(
  current: RSSArticle,
  all: RSSArticle[],
  limit = 3
): RSSArticle[] {
  return all
    .filter((a) => a.id !== current.id)
    .filter((a) => a.category === current.category || a.source === current.source)
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
//  SEO
// ═══════════════════════════════════════════════════════════════

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: locale === 'ka' ? 'სიახლე ვერ მოიძებნა' : 'Article not found',
    };
  }

  const image = article.image || getSportFallbackImage(article.category);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/${locale}/news/${slug}`;

  return {
    title: article.title,
    description: article.description?.slice(0, 160) || article.title,
    openGraph: {
      title: article.title,
      description: article.description?.slice(0, 160) || article.title,
      url,
      siteName: 'SportVerge',
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      locale: locale === 'ka' ? 'ka_GE' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'article',
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description?.slice(0, 160) || article.title,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default async function NewsDetailPage({ params }: DetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  const article = await getArticle(slug);
  if (!article) notFound();

  // Fetch related + full text in parallel
  const [allArticles, fullContent] = await Promise.all([
    getAllRSSNews(20),
    fetchFullArticle(article.sourceUrl).catch(() => null),
  ]);

  const related = getRelatedArticles(article, allArticles, 3);

  const hasImage = article.image && article.image.trim().length > 0;
  const imageToUse = hasImage ? article.image : getSportFallbackImage(article.category);
  const categoryColor = getCategoryColor(article.category);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const articleUrl = `${baseUrl}/${locale}/news/${slug}`;

  // Read time
  const readTime = fullContent?.readTime ?? Math.max(1, Math.ceil((article.description?.split(' ').length ?? 50) / 200));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: [imageToUse],
    datePublished: article.publishedAt,
    author: { '@type': 'Organization', name: article.source },
    publisher: { '@type': 'Organization', name: 'SportVerge' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  };

  return (
    <div className="relative min-h-screen bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══ TOP BAR ═══ */}
          <div className="pt-8 lg:pt-12 pb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <Link
                href={`/${locale}/news`}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-sm font-medium text-muted hover:text-lime hover:border-lime/40 transition-all"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t.back}</span>
              </Link>

              <div className="flex items-center gap-2">
                <NewsShareButtons
                  url={articleUrl}
                  title={article.title}
                  labels={{ share: t.share, copyLink: t.copyLink, copied: t.copied }}
                />
                <NewsBookmark
                  articleId={article.id}
                  labels={{ save: t.save, saved: t.saved }}
                />
              </div>
            </div>

            <nav className="flex items-center gap-2 text-xs text-muted flex-wrap" aria-label="Breadcrumb">
              <Link href={`/${locale}`} className="hover:text-lime transition-colors">{t.home}</Link>
              <span className="text-muted/50">/</span>
              <Link href={`/${locale}/news`} className="hover:text-lime transition-colors">{t.news}</Link>
              <span className="text-muted/50">/</span>
              <span className="text-text truncate max-w-[200px] lg:max-w-md">{article.title}</span>
            </nav>
          </div>

          {/* ═══ ARTICLE ═══ */}
          <article className="pb-16">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Badge variant={categoryColor as 'lime' | 'teal' | 'gold' | 'red'} size="md">
                <Sparkles size={11} className="mr-1.5" />
                {getCategoryLabel(article.category, locale)}
              </Badge>

              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar size={12} />
                <span>{formatDate(article.publishedAt, locale)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Clock size={12} />
                <span>{readTime} {t.min}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-lime/80">
                <TrendingUp size={12} />
                <span>{getRelativeTime(article.publishedAt, locale)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.1] mb-6">
              {article.title}
            </h1>

            {/* Source */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-edge/50">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lime/20 to-teal/20 border border-lime/30 flex items-center justify-center">
                <Newspaper size={19} className="text-lime" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted mb-0.5">{t.source}</div>
                <div className="text-sm font-semibold text-text">{article.source}</div>
              </div>
            </div>

            {/* Hero Image */}
            <figure className="relative w-full aspect-video rounded-3xl overflow-hidden border border-edge/50 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] mb-10 bg-surface">
              <Image
                src={imageToUse}
                alt={article.title}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
                className="object-cover object-center"
              />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />
            </figure>

            {/* ═══ CONTENT ═══ */}
            <div className="max-w-3xl mx-auto">
              {/* Summary Box */}
              {article.description && (
                <aside className="relative overflow-hidden bg-gradient-to-br from-lime/5 via-transparent to-teal/5 border border-lime/20 rounded-2xl p-6 mb-10">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0">
                      <Zap size={15} className="text-lime" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-lime font-bold mb-2">
                        {t.summary}
                      </div>
                      <p className="text-base lg:text-lg text-text leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </aside>
              )}

              {/* Full Text Section */}
              {fullContent && fullContent.paragraphs.length > 0 ? (
                <>
                  {/* Section divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen size={16} className="text-lime" />
                    <span className="text-[10px] uppercase tracking-widest text-lime font-bold">
                      {t.fullStory}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-lime/40 to-transparent" />
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-6">
                    {fullContent.paragraphs.map((para, i) => (
                      <p
                        key={i}
                        className="text-base lg:text-[17px] text-text/85 leading-[1.8] tracking-[0.01em]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Read stats */}
                  <div className="mt-8 pt-6 border-t border-edge/50 flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-lime/70" />
                      <span>
                        {fullContent.wordCount.toLocaleString()} {t.words}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-edge" />
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-lime/70" />
                      <span>
                        {fullContent.readTime} {t.min}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback — no full text */
                <div className="relative overflow-hidden bg-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-hover border border-edge flex items-center justify-center">
                    <BookOpen size={24} className="text-lime/60" />
                  </div>
                  <p className="text-sm text-muted mb-4">{t.noFullText}</p>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-ink font-bold text-sm hover:shadow-[0_0_30px_rgba(217,249,157,0.4)] transition-all"
                  >
                    <ExternalLink size={14} />
                    {t.openSource}
                  </a>
                </div>
              )}

              {/* CTA — Source Link */}
              <div className="mt-12 pt-8 border-t border-edge/50">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-lime text-ink font-bold text-base overflow-hidden hover:shadow-[0_0_40px_rgba(217,249,157,0.6)] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <ExternalLink size={18} className="relative z-10" />
                  <span className="relative z-10">{t.readFull}</span>
                  <span className="relative z-10 text-sm opacity-70">({article.source})</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <RelatedNews articles={related} locale={locale} title={t.relatedNews} />
            )}

            {/* Bottom Nav */}
            <div className="mt-16 max-w-3xl mx-auto">
              <Link
                href={`/${locale}/news`}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-sm font-medium text-text hover:border-lime/40 hover:text-lime transition-all"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t.back}</span>
              </Link>
            </div>
          </article>
        </Container>

        <BackToTop />
      </div>
    </div>
  );
}