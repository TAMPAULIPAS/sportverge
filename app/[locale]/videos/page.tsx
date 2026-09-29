// ═══════════════════════════════════════════════════════════════
//  SportVerge — Videos Page (Ultra Premium v2)
//  ─────────────────────────────────────────────────────────────
//  ✅ Clean Georgian text
//  ✅ Featured + grid layout
//  ✅ Category tabs
//  ✅ Stats header
// ═══════════════════════════════════════════════════════════════

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
import { Container } from '@/components/layout/Container';
import { VideoCard } from '@/components/video/VideoCard';
import { VideoShowcase } from '@/components/banners/VideoShowcase';
import { ScrollReveal } from '@/components/layout/ScrollReveal';
import {
  getVideosFromMultipleChannels,
  getGeorgianVideos,
  DEFAULT_CHANNELS,
  type YouTubeVideo,
} from '@/lib/api/youtube';
import {
  Play,
  Video,
  ExternalLink,
  ChevronRight,
  Globe,
  TrendingUp,
  Trophy,
  Sparkles,
  Flame,
  Radio,
  Zap,
} from 'lucide-react';

interface VideosPageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';
  const t = (ka: string, en: string, ru: string) =>
    isKa ? ka : isRu ? ru : en;

  return {
    title: t('ვიდეოები', 'Videos', 'Видео'),
    subtitle: t(
      'მიმოხილვები, გოლები და ინტერვიუები — პირდაპირ YouTube-დან',
      'Highlights, goals and interviews — directly from YouTube',
      'Обзоры, голы и интервью — прямо с YouTube'
    ),

    // Tabs
    all: t('ყველა', 'All', 'Все'),
    georgian: t('ქართული', 'Georgian', 'Грузинские'),
    latest: t('უახლესი', 'Latest', 'Последние'),
    trending: t('პოპულარული', 'Trending', 'В тренде'),

    // Sections
    featured: t('გამორჩეული', 'Featured', 'Избранное'),

    // Stats
    totalVideos: t('სულ ვიდეო', 'Total videos', 'Всего видео'),
    channels: t('არხები', 'Channels', 'Каналы'),
    liveUpdates: t('ლაივ განახლება', 'Live updates', 'Обновления'),

    // CTAs
    watchOnYoutube: t('YouTube-ზე ნახვა', 'Watch on YouTube', 'Смотреть на YouTube'),
    subscribe: t('გამოწერა', 'Subscribe', 'Подписаться'),

    // Navigation
    home: t('მთავარი', 'Home', 'Главная'),
    videos: t('ვიდეოები', 'Videos', 'Видео'),

    // Empty state
    noVideos: t('ვიდეოები მალე დაემატება', 'Videos coming soon', 'Видео скоро появятся'),
    noVideosHint: t(
      'მონაცემები იტვირთება YouTube-დან — სცადე ხელახლა 1 წუთში',
      'Data loading from YouTube — try again in 1 minute',
      'Данные загружаются из YouTube — попробуй через минуту'
    ),

    // YouTube banner
    youtubeBanner: t(
      'ათასობით სპორტული ვიდეო უფასოდ',
      'Thousands of sports videos for free',
      'Тысячи спортивных видео бесплатно'
    ),
    youtubeBannerDesc: t(
      'გოლები, მიმოხილვები, ინტერვიუები — პირდაპირ YouTube-დან, რეგისტრაციის გარეშე',
      'Goals, highlights, interviews — directly from YouTube, no registration',
      'Голы, обзоры, интервью — прямо с YouTube, без регистрации'
    ),
  };
}

type Translations = ReturnType<typeof getT>;

// ═══════════════════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  value,
  label,
  color = 'lime',
}: {
  icon: typeof Video;
  value: string | number;
  label: string;
  color?: 'lime' | 'teal' | 'red' | 'gold';
}) {
  const colorMap = {
    lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30' },
    teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
  };
  const c = colorMap[color];

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-4 hover:border-lime/40 transition-all duration-300">
      <div className="relative flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
        >
          <Icon size={18} className={c.text} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-mono text-xl lg:text-2xl font-black ${c.text} leading-none mb-0.5`}>
            {value}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted font-bold truncate">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  YOUTUBE CTA BANNER
// ═══════════════════════════════════════════════════════════════

function YouTubeBanner({ locale, t }: { locale: string; t: Translations }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-surface/50 to-red-500/5 backdrop-blur-xl p-8 lg:p-10">
      {/* Glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <YoutubeIcon size={26} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-heading text-2xl lg:text-3xl font-black text-text tracking-tight mb-2">
              {t.youtubeBanner}
            </h3>
            <p className="text-sm lg:text-base text-muted leading-relaxed">
              {t.youtubeBannerDesc}
            </p>
          </div>
        </div>

        <Link
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-black text-sm overflow-hidden hover:bg-red-700 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all shrink-0"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <Play size={16} fill="currentColor" className="relative z-10" />
          <span className="relative z-10">{t.watchOnYoutube}</span>
          <ChevronRight
            size={16}
            className="relative z-10 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-surface/60 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-edge flex items-center justify-center">
          <Video size={32} className="text-lime/60" strokeWidth={1.8} />
        </div>
        <p className="text-base lg:text-lg text-muted font-medium">{title}</p>
        {hint && <p className="mt-2 text-xs text-muted/70 max-w-md mx-auto">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION HEADER
// ═══════════════════════════════════════════════════════════════

function SectionHeader({
  icon: Icon,
  title,
  href,
  hrefLabel,
  accent = 'lime',
}: {
  icon: typeof Trophy;
  title: string;
  href?: string;
  hrefLabel?: string;
  accent?: 'lime' | 'teal' | 'red' | 'gold';
}) {
  const accentColor = {
    lime: 'bg-lime shadow-[0_0_14px_rgba(217,249,157,0.8)]',
    teal: 'bg-teal shadow-[0_0_14px_rgba(20,184,166,0.8)]',
    red: 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.8)]',
    gold: 'bg-gold shadow-[0_0_14px_rgba(251,191,36,0.8)]',
  }[accent];

  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className={`w-1 h-7 rounded-full ${accentColor}`} />
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-lime" />
          <h2 className="font-heading text-2xl lg:text-3xl font-black text-text tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      {href && (
        <Link
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs lg:text-sm font-bold text-lime hover:bg-lime/10 border border-lime/30 hover:border-lime/50 transition-all shrink-0"
        >
          <ExternalLink size={14} />
          <span>{hrefLabel}</span>
          <ChevronRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default async function VideosPage({ params }: VideosPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getT(locale);

  // Fetch videos in parallel
  let videos: YouTubeVideo[] = [];
  let georgianVideos: YouTubeVideo[] = [];

  try {
    [videos, georgianVideos] = await Promise.all([
      getVideosFromMultipleChannels(DEFAULT_CHANNELS, 3),
      getGeorgianVideos(6, 'ka'),
    ]);
  } catch (err) {
    console.error('[VideosPage] fetch error:', err);
    videos = [];
    georgianVideos = [];
  }

  const topVideos = videos.slice(0, 9);
  const gVideos = georgianVideos.slice(0, 6);
  const featured = topVideos[0] ?? null;
  const rest = topVideos.slice(1);
  const totalCount = topVideos.length + gVideos.length;
  const channelCount = new Set(
    [...topVideos, ...gVideos].map((v) => v.channelTitle)
  ).size;

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10">
        <Container size="lg" padding>
          {/* ═══ HEADER ═══ */}
          <div className="pt-8 lg:pt-12 pb-8">
            <nav className="flex items-center gap-2 text-xs text-muted mb-6">
              <Link
                href={`/${locale}`}
                className="hover:text-lime transition-colors"
              >
                {t.home}
              </Link>
              <span className="text-muted/50">/</span>
              <span className="text-lime">{t.videos}</span>
            </nav>

            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                  <YoutubeIcon size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    YouTube
                  </span>
                </div>

                <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-black text-text tracking-tight leading-[1.05]">
                  {t.title}
                </h1>

                <p className="mt-3 text-base lg:text-lg text-muted max-w-2xl">
                  {t.subtitle}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 shrink-0 w-full lg:w-auto">
                <StatCard icon={Video} value={totalCount} label={t.totalVideos} color="lime" />
                <StatCard icon={Radio} value={channelCount} label={t.channels} color="teal" />
                <StatCard icon={Zap} value="24/7" label={t.liveUpdates} color="gold" />
              </div>
            </div>
          </div>

          {/* ═══ YOUTUBE BANNER ═══ */}
          <ScrollReveal>
            <section className="mb-14">
              <YouTubeBanner locale={locale} t={t} />
            </section>
          </ScrollReveal>

          {/* ═══ FEATURED VIDEO ═══ */}
          {featured && (
            <ScrollReveal>
              <section className="mb-14">
                <SectionHeader
                  icon={Sparkles}
                  title={t.featured}
                  accent="gold"
                />
                <VideoCard
                  id={featured.id}
                  youtubeId={featured.id}
                  title={featured.title}
                  thumbnail={featured.thumbnail}
                  channel={featured.channelTitle}
                  publishedAt={featured.publishedAt}
                  locale={locale}
                  variant="featured"
                  category="highlights"
                />
              </section>
            </ScrollReveal>
          )}

          {/* ═══ ALL VIDEOS ═══ */}
          {rest.length > 0 ? (
            <section className="mb-14">
              <ScrollReveal>
                <SectionHeader
                  icon={TrendingUp}
                  title={t.latest}
                  href="https://youtube.com"
                  hrefLabel={t.watchOnYoutube}
                  accent="lime"
                />
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((video, i) => (
                  <ScrollReveal key={video.id} delay={i * 0.06}>
                    <VideoCard
                      id={video.id}
                      youtubeId={video.id}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      channel={video.channelTitle}
                      publishedAt={video.publishedAt}
                      locale={locale}
                      variant="default"
                      category="highlights"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ) : null}

          {/* ═══ GEORGIAN VIDEOS ═══ */}
          {gVideos.length > 0 && (
            <ScrollReveal>
              <section className="mb-14">
                <SectionHeader
                  icon={Globe}
                  title={t.georgian}
                  accent="teal"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gVideos.map((video, i) => (
                    <ScrollReveal key={video.id} delay={i * 0.06}>
                      <VideoCard
                        id={video.id}
                        youtubeId={video.id}
                        title={video.title}
                        thumbnail={video.thumbnail}
                        channel={video.channelTitle}
                        publishedAt={video.publishedAt}
                        locale={locale}
                        variant="default"
                        category="highlights"
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )}

          {/* ═══ EMPTY STATE ═══ */}
          {topVideos.length === 0 && gVideos.length === 0 && (
            <EmptyState title={t.noVideos} hint={t.noVideosHint} />
          )}
        </Container>

        {/* ═══ VIDEO SHOWCASE ═══ */}
        <VideoShowcase locale={locale} videoSrc="/icons/video.mp4" />
      </div>
    </div>
  );
}