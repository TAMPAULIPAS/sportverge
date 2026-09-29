import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { RSSArticle } from "@/lib/api/rss";
import { newsSlug } from "@/lib/slug";

interface Props {
  articles: RSSArticle[];
  locale: string;
  title: string;
}

export function RelatedNews({ articles, locale, title }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-edge/50">
      <h2 className="font-heading text-2xl font-black text-text mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-lime to-teal rounded-full" />
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/${locale}/news/${newsSlug(a.title, new Date(a.publishedAt))}`}
            className="group block bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl overflow-hidden hover:border-lime/40 transition-all"
          >
            <div className="relative aspect-video bg-surface-hover">
              {a.image ? (
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : null}
            </div>
            <div className="p-4">
              <div className="text-xs text-muted mb-1.5 uppercase tracking-widest">{a.source}</div>
              <h3 className="text-sm font-semibold text-text line-clamp-2 group-hover:text-lime transition-colors">
                {a.title}
              </h3>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-lime">
                <span>Read</span>
                <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}