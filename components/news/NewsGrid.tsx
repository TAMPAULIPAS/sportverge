// ═══════════════════════════════════════════════════════════════
//  SportVerge — NewsGrid v2
//  ─────────────────────────────────────────────────────────────
//  📰 Responsive grid for news cards
//     - Auto-featured first article
//     - Category filter tabs
//     - Empty state
//     - Skeleton loading
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper } from "lucide-react";
import { NewsCard, type NewsCardVariant } from "./NewsCard";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image?: string | null;
  source: string;
  publishedAt: string;
  category?: string;
}

export interface NewsGridProps {
  news: NewsItem[];
  locale: string;
  variant?: NewsCardVariant;
  showFilter?: boolean;
  showFeatured?: boolean;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
//  CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════

function getCategories(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return [
    { id: "all", label: isKa ? "ყველა" : isRu ? "Все" : "All" },
    { id: "football", label: isKa ? "ფეხბურთი" : isRu ? "Футбол" : "Football" },
    { id: "basketball", label: isKa ? "კალათბურთი" : isRu ? "Баскетбол" : "Basketball" },
    { id: "tennis", label: isKa ? "ჩოგბურთი" : isRu ? "Теннис" : "Tennis" },
    { id: "f1", label: isKa ? "F1" : isRu ? "F1" : "F1" },
    { id: "ufc", label: isKa ? "UFC" : isRu ? "UFC" : "UFC" },
  ];
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function NewsGrid({
  news,
  locale,
  variant = "default",
  showFilter = false,
  showFeatured = false,
  columns = 3,
  emptyMessage,
  className = "",
}: NewsGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = getCategories(locale);

  // Filter news
  const filtered = useMemo(() => {
    if (activeCategory === "all") return news;
    return news.filter((n) => n.category === activeCategory);
  }, [news, activeCategory]);

  // Split featured / regular
  const featured = showFeatured && filtered.length > 0 ? filtered[0] : null;
  const regular = showFeatured ? filtered.slice(1) : filtered;

  // Empty state
  if (news.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative overflow-hidden bg-surface/50 backdrop-blur-xl border border-edge/70 border-dashed rounded-3xl p-12 lg:p-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover border border-edge flex items-center justify-center">
            <Newspaper size={28} className="text-lime/60" />
          </div>
          <p className="text-sm text-muted">
            {emptyMessage ?? "News coming soon"}
          </p>
        </div>
      </div>
    );
  }

  // Column classes
  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`w-full ${className}`}>
      {/* Filter tabs */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-6 lg:mb-8">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-lime text-ink shadow-[0_0_20px_rgba(217,249,157,0.4)]"
                    : "bg-surface/50 text-muted hover:text-lime hover:bg-surface/80 border border-edge/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <p className="text-sm text-muted">
              {locale === "ka"
                ? "ამ კატეგორიაში სიახლეები არ არის"
                : locale === "ru"
                ? "В этой категории нет новостей"
                : "No news in this category"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Featured + Grid layout */}
            {featured ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mb-6">
                <div className="lg:col-span-2 lg:row-span-2">
                  <NewsCard
                    {...featured}
                    locale={locale}
                    variant="featured"
                    priority
                  />
                </div>
                {regular.slice(0, 2).map((item, i) => (
                  <NewsCard
                    key={item.id}
                    {...item}
                    locale={locale}
                    variant="default"
                    priority={i === 0}
                  />
                ))}
              </div>
            ) : null}

            {/* Regular grid */}
            <div className={`grid ${colClass} gap-5 lg:gap-6`}>
              {(featured ? regular.slice(2) : regular).map((item, i) => (
                <NewsCard
                  key={item.id}
                  {...item}
                  locale={locale}
                  variant={variant}
                  priority={i < 3}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NewsGrid;