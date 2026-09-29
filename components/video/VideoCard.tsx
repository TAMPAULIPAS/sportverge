// ═══════════════════════════════════════════════════════════════
//  SportVerge — VideoCard v2
//  ─────────────────────────────────────────────────────────────
//  🎬 Video card for YouTube content
//     - 4 variants: default, featured, horizontal, compact
//     - Fallback thumbnails (maxres → hq → mq)
//     - Hydration-safe time
//     - Framer Motion animations
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Bookmark } from "lucide-react";
import { TimeAgo } from "@/components/ui/TimeAgo";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export type VideoCategory =
  | "highlights"
  | "goals"
  | "interview"
  | "analysis"
  | "press"
  | "training"
  | "other";

export type VideoVariant = "default" | "featured" | "horizontal" | "compact";

export interface VideoCardProps {
  id: string | number;
  title: string;
  thumbnail?: string | null;
  youtubeId?: string;
  channel?: string;
  channelAvatar?: string | null;
  views?: number;
  duration?: string;
  category?: VideoCategory;
  publishedAt?: string | Date;
  verified?: boolean;
  locale?: string;
  variant?: VideoVariant;
  animated?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
//  CATEGORY CONFIG
// ═══════════════════════════════════════════════════════════════

const CATEGORY_CONFIG: Record<
  VideoCategory,
  {
    labelKa: string;
    labelEn: string;
    labelRu: string;
    bg: string;
    text: string;
    emoji: string;
  }
> = {
  highlights: {
    labelKa: "მიმოხილვა",
    labelEn: "Highlights",
    labelRu: "Обзор",
    bg: "bg-lime/90",
    text: "text-ink",
    emoji: "🎬",
  },
  goals: {
    labelKa: "გოლები",
    labelEn: "Goals",
    labelRu: "Голы",
    bg: "bg-emerald-400/90",
    text: "text-ink",
    emoji: "⚽",
  },
  interview: {
    labelKa: "ინტერვიუ",
    labelEn: "Interview",
    labelRu: "Интервью",
    bg: "bg-teal/90",
    text: "text-ink",
    emoji: "🎤",
  },
  analysis: {
    labelKa: "ანალიზი",
    labelEn: "Analysis",
    labelRu: "Анализ",
    bg: "bg-amber-400/90",
    text: "text-ink",
    emoji: "📊",
  },
  press: {
    labelKa: "პრეს-კონფერენცია",
    labelEn: "Press",
    labelRu: "Пресс-конференция",
    bg: "bg-purple-400/90",
    text: "text-white",
    emoji: "🎙️",
  },
  training: {
    labelKa: "ვარჯიში",
    labelEn: "Training",
    labelRu: "Тренировка",
    bg: "bg-blue-400/90",
    text: "text-ink",
    emoji: "🏃",
  },
  other: {
    labelKa: "ვიდეო",
    labelEn: "Video",
    labelRu: "Видео",
    bg: "bg-slate-500/90",
    text: "text-white",
    emoji: "📹",
  },
};

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function formatViews(views?: number): string {
  if (!views || views <= 0) return "";
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

/**
 * YouTube thumbnail — with fallback chain.
 * ⚠️ maxresdefault.jpg ყოველთვის არ არსებობს, ამიტომ ვიყენებთ hqdefault-ს.
 */
function getYouTubeThumbnail(youtubeId?: string, quality: "max" | "hq" | "mq" = "hq"): string | null {
  if (!youtubeId) return null;
  const q = quality === "max" ? "maxresdefault" : quality === "mq" ? "mqdefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${youtubeId}/${q}.jpg`;
}

function getCategoryLabel(category: VideoCategory | undefined, locale: string): string {
  if (!category) return "";
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
  if (locale === "ka") return cfg.labelKa;
  if (locale === "ru") return cfg.labelRu;
  return cfg.labelEn;
}

function getCategoryStyles(category: VideoCategory | undefined) {
  const cfg = category ? CATEGORY_CONFIG[category] : null;
  return cfg ?? null;
}

// ═══════════════════════════════════════════════════════════════
//  PLAY OVERLAY
// ═══════════════════════════════════════════════════════════════

function PlayOverlay({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { outer: "w-10 h-10", icon: 14 },
    md: { outer: "w-14 h-14", icon: 20 },
    lg: { outer: "w-20 h-20", icon: 28 },
  };
  const s = sizes[size];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
      <div
        className={`rounded-full bg-lime flex items-center justify-center shadow-[0_0_32px_rgba(217,249,157,0.6)] group-hover:scale-110 transition-transform duration-300 ${s.outer}`}
      >
        <Play size={s.icon} className="text-ink ml-0.5" fill="currentColor" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  THUMBNAIL — with fallback
// ═══════════════════════════════════════════════════════════════

function VideoThumbnail({
  thumbnail,
  youtubeId,
  alt,
  priority,
  sizes,
  className = "object-cover",
}: {
  thumbnail?: string | null;
  youtubeId?: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Build thumbnail URL with fallback
  let src: string;
  if (thumbnail && !error) {
    src = thumbnail;
  } else if (youtubeId) {
    src = getYouTubeThumbnail(youtubeId, "hq") ?? "";
  } else {
    src = "";
  }

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-hover">
        <Play size={28} className="text-muted" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // Fallback: if custom thumbnail fails, try YouTube hqdefault
          if (thumbnail && youtubeId && !error) {
            setError(true);
          }
        }}
        unoptimized
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function VideoCard({
  id,
  title,
  thumbnail,
  youtubeId,
  channel,
  views,
  duration,
  category,
  publishedAt,
  verified = false,
  locale = "ka",
  variant = "default",
  animated = true,
  className = "",
}: VideoCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const catCfg = getCategoryStyles(category);
  const href = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : `/${locale}/videos/${id}`;

  const MotionWrapper = animated ? motion.article : "article";
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.4 },
      }
    : {};

  // ═══════════════════════════════════════════════════════════════
  //  COMPACT
  // ═══════════════════════════════════════════════════════════════
  if (variant === "compact") {
    return (
      <MotionWrapper
        {...(wrapperProps as object)}
        className={`group ${className}`}
      >
        <Link
          href={href}
          target={youtubeId ? "_blank" : undefined}
          rel={youtubeId ? "noopener noreferrer" : undefined}
          className="flex gap-3 w-full"
        >
          <div className="relative w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-surface-hover">
            <VideoThumbnail
              thumbnail={thumbnail}
              youtubeId={youtubeId}
              alt={title}
              sizes="128px"
            />
            {duration && (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/90 backdrop-blur-sm rounded text-[9px] font-mono font-bold text-white z-10">
                {duration}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="text-sm font-medium text-text leading-snug line-clamp-2 group-hover:text-lime transition-colors">
              {title}
            </h3>
            {channel && (
              <span className="text-[10px] text-muted mt-1 block truncate">
                {channel}
              </span>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              {views !== undefined && (
                <span className="text-[10px] text-muted">
                  {formatViews(views)} views
                </span>
              )}
            </div>
          </div>
        </Link>
      </MotionWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  HORIZONTAL
  // ═══════════════════════════════════════════════════════════════
  if (variant === "horizontal") {
    return (
      <MotionWrapper
        {...(wrapperProps as object)}
        className={`group ${className}`}
      >
        <Link
          href={href}
          target={youtubeId ? "_blank" : undefined}
          rel={youtubeId ? "noopener noreferrer" : undefined}
          className="flex gap-4 p-3 rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge hover:border-lime/30 transition-colors duration-300 w-full"
        >
          <div className="relative w-40 lg:w-48 aspect-video shrink-0 rounded-xl overflow-hidden bg-surface-hover">
            <VideoThumbnail
              thumbnail={thumbnail}
              youtubeId={youtubeId}
              alt={title}
              sizes="192px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center shadow-[0_0_24px_rgba(217,249,157,0.6)]">
                <Play size={18} className="text-ink ml-0.5" fill="currentColor" />
              </div>
            </div>

            {duration && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 backdrop-blur-sm rounded text-[10px] font-mono font-bold text-white z-10">
                {duration}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
            <div>
              {catCfg && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  <span>{catCfg.emoji}</span>
                  <span>{getCategoryLabel(category, locale)}</span>
                </span>
              )}

              <h3 className="text-sm lg:text-base font-semibold text-text leading-snug line-clamp-2 group-hover:text-lime transition-colors">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted mt-2">
              {channel && <span className="truncate">{channel}</span>}
              {views !== undefined && (
                <span className="flex items-center gap-1 shrink-0">
                  <Eye size={10} />
                  {formatViews(views)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </MotionWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  FEATURED
  // ═══════════════════════════════════════════════════════════════
  if (variant === "featured") {
    return (
      <MotionWrapper
        {...(wrapperProps as object)}
        className={`group relative block w-full overflow-hidden rounded-2xl bg-surface border border-edge hover:border-lime/30 transition-colors duration-300 ${className}`}
      >
        <Link
          href={href}
          target={youtubeId ? "_blank" : undefined}
          rel={youtubeId ? "noopener noreferrer" : undefined}
          className="block"
        >
          <div className="relative aspect-video overflow-hidden bg-surface-hover">
            <VideoThumbnail
              thumbnail={thumbnail}
              youtubeId={youtubeId}
              alt={title}
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            <PlayOverlay size="lg" />

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
              {catCfg && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${catCfg.bg} ${catCfg.text} text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm`}
                >
                  <span>{catCfg.emoji}</span>
                  {getCategoryLabel(category, locale)}
                </span>
              )}

              {duration && (
                <span className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs font-mono font-bold text-white">
                  {duration}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsBookmarked(!isBookmarked);
              }}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-white/70 hover:text-lime transition-colors z-20"
              aria-label="Bookmark"
            >
              <Bookmark
                size={16}
                fill={isBookmarked ? "currentColor" : "none"}
                className={isBookmarked ? "text-lime" : ""}
              />
            </button>
          </div>

          <div className="relative p-5 lg:p-6">
            <h3 className="font-heading text-xl lg:text-2xl font-bold text-text leading-tight line-clamp-2 group-hover:text-lime transition-colors">
              {title}
            </h3>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
              <div className="flex items-center gap-2 min-w-0">
                {channel && (
                  <span className="font-medium text-text/80 truncate">
                    {channel}
                  </span>
                )}
                {verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-teal flex items-center justify-center text-ink text-[8px] font-bold shrink-0">
                    ✓
                  </span>
                )}
                {publishedAt && (
                  <span className="flex items-center gap-1 shrink-0 text-muted/70">
                    <Clock size={10} />
                    <TimeAgo date={String(publishedAt)} locale={locale} fallback="" />
                  </span>
                )}
              </div>

              {views !== undefined && (
                <span className="flex items-center gap-1 shrink-0">
                  <Eye size={12} />
                  {formatViews(views)} views
                </span>
              )}
            </div>
          </div>
        </Link>
      </MotionWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  DEFAULT
  // ═══════════════════════════════════════════════════════════════
  return (
    <MotionWrapper
      {...(wrapperProps as object)}
      className={`group relative block w-full overflow-hidden rounded-2xl bg-surface/60 backdrop-blur-xl border border-edge hover:border-lime/30 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(217,249,157,0.15)] transition-all duration-300 ${className}`}
    >
      <Link
        href={href}
        target={youtubeId ? "_blank" : undefined}
        rel={youtubeId ? "noopener noreferrer" : undefined}
        className="block"
      >
        <div className="relative aspect-video overflow-hidden bg-surface-hover">
          <VideoThumbnail
            thumbnail={thumbnail}
            youtubeId={youtubeId}
            alt={title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <PlayOverlay size="md" />

          {duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/90 backdrop-blur-sm rounded text-[10px] font-mono font-bold text-white z-10">
              {duration}
            </span>
          )}

          {catCfg && (
            <div className="absolute top-2 left-2 z-10">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${catCfg.bg} ${catCfg.text} text-[9px] font-black uppercase tracking-widest shadow-lg`}
              >
                <span>{catCfg.emoji}</span>
                {getCategoryLabel(category, locale)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsBookmarked(!isBookmarked);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-white/70 hover:text-lime opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Bookmark"
          >
            <Bookmark
              size={12}
              fill={isBookmarked ? "currentColor" : "none"}
              className={isBookmarked ? "text-lime" : ""}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm lg:text-base font-semibold text-text leading-snug line-clamp-2 group-hover:text-lime transition-colors min-h-[2.6em]">
            {title}
          </h3>

          <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
            <div className="flex items-center gap-2 min-w-0">
              {channel && <span className="truncate">{channel}</span>}
              {verified && (
                <span className="w-3 h-3 rounded-full bg-teal flex items-center justify-center text-ink text-[7px] font-bold shrink-0">
                  ✓
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {publishedAt && (
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  <TimeAgo date={String(publishedAt)} locale={locale} fallback="" />
                </span>
              )}
              {views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye size={10} />
                  {formatViews(views)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </MotionWrapper>
  );
}

export { CATEGORY_CONFIG, formatViews, getYouTubeThumbnail };

export default VideoCard;