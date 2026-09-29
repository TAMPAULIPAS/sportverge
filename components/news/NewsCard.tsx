// ═══════════════════════════════════════════════════════════════
//  SportVerge — NewsCard v3
//  ─────────────────────────────────────────────────────────────
//  ✨ Features:
//     - Large high-quality images (16:9)
//     - 4 variants: default, featured, horizontal, compact
//     - Hover animations (Framer Motion)
//     - Category badge overlay
//     - TimeAgo (client-side, no hydration errors)
//     - Reading time
// ═══════════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { SafeImage } from "./SafeImage";
import { TimeAgo } from "@/components/ui/TimeAgo";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export type NewsCardVariant = "default" | "featured" | "horizontal" | "compact";

export interface NewsCardProps {
  id: string;
  title: string;
  excerpt?: string;
  description?: string;
  image?: string | null;
  source?: string;
  publishedAt: string;
  category?: string;
  locale: string;
  variant?: NewsCardVariant;
  priority?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getCategoryLabel(category: string | undefined, locale: string): string {
  if (!category) return "";
  const labels: Record<string, Record<string, string>> = {
    football: { ka: "ფეხბურთი", en: "Football", ru: "Футбол" },
    basketball: { ka: "კალათბურთი", en: "Basketball", ru: "Баскетбол" },
    tennis: { ka: "ჩოგბურთი", en: "Tennis", ru: "Теннис" },
    f1: { ka: "F1", en: "F1", ru: "F1" },
    ufc: { ka: "UFC", en: "UFC", ru: "UFC" },
    transfers: { ka: "ტრანსფერი", en: "Transfers", ru: "Трансферы" },
    general: { ka: "სპორტი", en: "Sports", ru: "Спорт" },
  };
  return labels[category]?.[locale] || labels.general[locale] || "Sports";
}

function getCategoryColor(category: string | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    football: { bg: "bg-lime/90", text: "text-ink", border: "border-lime" },
    basketball: { bg: "bg-amber-400/90", text: "text-ink", border: "border-amber-400" },
    tennis: { bg: "bg-teal/90", text: "text-ink", border: "border-teal" },
    f1: { bg: "bg-red-500/90", text: "text-white", border: "border-red-500" },
    ufc: { bg: "bg-red-600/90", text: "text-white", border: "border-red-600" },
    transfers: { bg: "bg-teal/90", text: "text-ink", border: "border-teal" },
    general: { bg: "bg-lime/90", text: "text-ink", border: "border-lime" },
  };
  return colors[category ?? "general"] ?? colors.general;
}

function getFallbackImage(category: string | undefined): string {
  const map: Record<string, string> = {
    football: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=675&fit=crop&q=80",
    basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop&q=80",
    tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=675&fit=crop&q=80",
    f1: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&h=675&fit=crop&q=80",
    ufc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&h=675&fit=crop&q=80",
    general: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=675&fit=crop&q=80",
  };
  return map[category ?? "general"] ?? map.general;
}

// ═══════════════════════════════════════════════════════════════
//  CARD VARIANTS
// ═══════════════════════════════════════════════════════════════

// ─── Featured (big hero card) ───
function FeaturedCard(props: NewsCardProps) {
  const { id, title, excerpt, description, image, source, publishedAt, category, locale } = props;
  const img = image || getFallbackImage(category);
  const cat = getCategoryColor(category);
  const text = excerpt || description || "";
  const url = `/${locale}/news/${id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative col-span-2 lg:col-span-2 row-span-2"
    >
      <Link href={url} className="block h-full">
        <div className="relative overflow-hidden rounded-3xl border border-edge/70 bg-surface/50 backdrop-blur-xl h-full min-h-[480px] lg:min-h-[560px]">
          {/* Image */}
          <div className="absolute inset-0">
            <SafeImage
              src={img}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              fallbackSrc={getFallbackImage(category)}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-lime/0 via-transparent to-teal/0 group-hover:from-lime/10 transition-colors duration-500" />
          </div>

          {/* Category badge */}
          <div className="absolute top-5 left-5 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cat.bg} ${cat.text} text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm`}
            >
              <TrendingUp size={11} />
              {getCategoryLabel(category, locale)}
            </span>
          </div>

          {/* Time badge */}
          <div className="absolute top-5 right-5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono">
              <Clock size={10} />
              <TimeAgo date={publishedAt} locale={locale} fallback="" />
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 inset-x-0 p-6 lg:p-8 z-10">
            <h3 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-[1.1] tracking-tight mb-3 line-clamp-3 group-hover:text-lime transition-colors">
              {title}
            </h3>

            {text && (
              <p className="text-sm lg:text-base text-white/80 leading-relaxed line-clamp-2 mb-4 max-w-2xl">
                {text}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/20">
              <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">
                {source}
              </span>
              <span className="inline-flex items-center gap-1.5 text-lime text-xs font-bold uppercase tracking-widest group-hover:gap-2.5 transition-all">
                Read
                <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
              </span>
            </div>
          </div>

          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />
        </div>
      </Link>
    </motion.article>
  );
}

// ─── Default (vertical card) ───
function DefaultCard(props: NewsCardProps) {
  const { id, title, excerpt, description, image, source, publishedAt, category, locale, priority } = props;
  const img = image || getFallbackImage(category);
  const cat = getCategoryColor(category);
  const text = excerpt || description || "";
  const url = `/${locale}/news/${id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group h-full"
    >
      <Link href={url} className="block h-full">
        <div className="relative flex flex-col h-full overflow-hidden rounded-2xl border border-edge/70 bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl transition-all duration-300 hover:border-lime/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(217,249,157,0.15)]">
          {/* Image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-hover">
            <SafeImage
              src={img}
              alt={title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              fallbackSrc={getFallbackImage(category)}
            />
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg ${cat.bg} ${cat.text} text-[9px] font-black uppercase tracking-widest shadow-lg`}
              >
                {getCategoryLabel(category, locale)}
              </span>
            </div>

            {/* Time badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-mono">
                <Clock size={9} />
                <TimeAgo date={publishedAt} locale={locale} fallback="" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 lg:p-5">
            <h3 className="font-heading text-base lg:text-lg font-bold text-text leading-[1.25] tracking-tight mb-2.5 line-clamp-2 group-hover:text-lime transition-colors">
              {title}
            </h3>

            {text && (
              <p className="text-xs lg:text-sm text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
                {text}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-edge/50 mt-auto">
              <span className="text-[10px] uppercase tracking-widest text-muted font-bold truncate">
                {source}
              </span>
              <ArrowUpRight
                size={14}
                className="text-lime/60 group-hover:text-lime group-hover:rotate-45 transition-all shrink-0"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ─── Horizontal (image left, text right) ───
function HorizontalCard(props: NewsCardProps) {
  const { id, title, excerpt, description, image, source, publishedAt, category, locale } = props;
  const img = image || getFallbackImage(category);
  const cat = getCategoryColor(category);
  const text = excerpt || description || "";
  const url = `/${locale}/news/${id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="group"
    >
      <Link href={url} className="block">
        <div className="relative flex gap-4 overflow-hidden rounded-2xl border border-edge/70 bg-surface/50 backdrop-blur-xl p-3 transition-all duration-300 hover:border-lime/40 hover:bg-surface/70">
          {/* Image */}
          <div className="relative shrink-0 w-32 h-24 sm:w-40 sm:h-28 rounded-xl overflow-hidden bg-surface-hover">
            <SafeImage
              src={img}
              alt={title}
              fill
              sizes="160px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              fallbackSrc={getFallbackImage(category)}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded ${cat.bg} ${cat.text} text-[8px] font-black uppercase tracking-widest`}
                >
                  {getCategoryLabel(category, locale)}
                </span>
                <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                  <Clock size={9} />
                  <TimeAgo date={publishedAt} locale={locale} fallback="" />
                </span>
              </div>

              <h3 className="font-heading text-sm lg:text-base font-bold text-text leading-snug line-clamp-2 group-hover:text-lime transition-colors">
                {title}
              </h3>

              {text && (
                <p className="text-[11px] text-muted leading-relaxed line-clamp-1 mt-1.5">
                  {text}
                </p>
              )}
            </div>

            <span className="text-[9px] uppercase tracking-widest text-muted/70 font-bold mt-1">
              {source}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ─── Compact (for sidebars) ───
function CompactCard(props: NewsCardProps) {
  const { id, title, image, publishedAt, category, locale } = props;
  const img = image || getFallbackImage(category);
  const url = `/${locale}/news/${id}`;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={url} className="block">
        <div className="flex items-start gap-3 p-3 rounded-xl border border-edge/50 bg-surface/30 hover:bg-surface/60 hover:border-lime/30 transition-all">
          <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-hover">
            <SafeImage
              src={img}
              alt={title}
              fill
              sizes="64px"
              className="object-cover"
              fallbackSrc={getFallbackImage(category)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-text leading-snug line-clamp-2 mb-1 group-hover:text-lime transition-colors">
              {title}
            </h4>
            <span className="text-[10px] text-muted font-mono flex items-center gap-1">
              <Clock size={9} />
              <TimeAgo date={publishedAt} locale={locale} fallback="" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export function NewsCard(props: NewsCardProps) {
  const { variant = "default" } = props;

  switch (variant) {
    case "featured":
      return <FeaturedCard {...props} />;
    case "horizontal":
      return <HorizontalCard {...props} />;
    case "compact":
      return <CompactCard {...props} />;
    default:
      return <DefaultCard {...props} />;
  }
}

export default NewsCard;