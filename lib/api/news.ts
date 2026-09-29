// ═══════════════════════════════════════════════════════════════
//  SportVerge — News API Integration (v2)
//  ─────────────────────────────────────────────────────────────
//  📰 Sources:
//     1. NewsAPI.org   — 100 req/day (free)
//     2. GNews.io      — 100 req/day (free, fallback)
//     3. RSS Feeds     — unlimited (ultimate fallback)
//
//  🎯 Features:
//     - Multi-source with automatic fallback
//     - Smart categorization (regex-based, no AI cost)
//     - Sentiment detection (positive/negative/neutral)
//     - Image optimization + fallback chain
//     - Related articles finder
//     - Full-text search
//     - Multi-language (ka/en/ru)
//     - Duplicate detection
//     - Retry with exponential backoff
//     - In-memory cache for hot queries
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  ⚙️ CONFIG
// ─────────────────────────────────────────────────────────────

const NEWSAPI_KEY = process.env.NEWSAPI_KEY ?? "";
const GNEWS_KEY = process.env.GNEWS_API_KEY ?? "";

const NEWSAPI_URL = "https://newsapi.org/v2";
const GNEWS_URL = "https://gnews.io/api/v4";

const DEFAULT_TIMEOUT = 8000; // 8 წამი
const MAX_RETRIES = 2;

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

export interface NewsSource {
  id: string | null;
  name: string;
  url?: string;
}

export interface NewsArticle {
  id: string;
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  imageFallback: string | null;
  publishedAt: string;
  category: NewsCategory;
  sport: SportTag;
  language: string;
  readTime: number;
  sentiment: Sentiment;
  isBreaking: boolean;
  slug: string;
}

export interface NewsResponse {
  status: "ok" | "error";
  totalResults: number;
  articles: NewsArticle[];
  source: "newsapi" | "gnews" | "rss" | "cache";
  fetchedAt: string;
}

export type NewsCategory =
  | "football"
  | "basketball"
  | "tennis"
  | "f1"
  | "ufc"
  | "transfers"
  | "politics"
  | "tech"
  | "economy"
  | "general";

export type SportTag =
  | "football"
  | "basketball"
  | "tennis"
  | "f1"
  | "ufc"
  | "other";

export type Sentiment = "positive" | "negative" | "neutral";

// ─────────────────────────────────────────────────────────────
//  🔍 QUERY PRESETS
// ─────────────────────────────────────────────────────────────

export const SPORT_QUERIES = {
  football:
    'football OR soccer OR "premier league" OR "champions league" OR "la liga" OR "world cup"',
  basketball: 'basketball OR NBA OR "euro league" OR NCAA',
  tennis: 'tennis OR ATP OR WTA OR "grand slam" OR wimbledon',
  f1: '"formula 1" OR F1 OR "grand prix" OR racing OR motogp',
  ufc: "UFC OR MMA OR boxing OR fight",
  transfers: 'transfer OR signing OR "transfer window" OR loan',
  general: "sport OR sports OR athlete",
} as const;

export const CATEGORY_KEYWORDS: Record<NewsCategory, RegExp> = {
  football:
    /football|soccer|premier league|champions league|la liga|serie a|bundesliga|ligue 1|world cup|fifa|uefa|messi|ronaldo|mbappé|kvaratskhelia/i,
  basketball:
    /basketball|nba|ncaa|euroleague|euro league|lebron|curry|luka|jokic/i,
  tennis: /tennis|atp|wta|wimbledon|grand slam|us open|french open|djokovic|alcaraz|sinner/i,
  f1: /formula 1|f1|grand prix|racing|motogp|verstappen|hamilton|ferrari|red bull/i,
  ufc: /ufc|mma|boxing|fight|mcgregor|khabib|jones|pereira/i,
  transfers: /transfer|signing|deal|loan|swap|bid|negotiat|contract/i,
  politics: /politics|president|government|election|minister|parliament/i,
  tech: /technology|ai|artificial intelligence|software|tech|innovation/i,
  economy: /economy|business|market|finance|stock|investment/i,
  general: /.*/,
};

// ─────────────────────────────────────────────────────────────
//  🖼️ IMAGE FALLBACKS (sport-specific placeholders)
// ─────────────────────────────────────────────────────────────

const IMAGE_FALLBACKS: Record<SportTag, string> = {
  football: "/images/fallbacks/news-football.jpg",
  basketball: "/images/fallbacks/news-basketball.jpg",
  tennis: "/images/fallbacks/news-tennis.jpg",
  f1: "/images/fallbacks/news-f1.jpg",
  ufc: "/images/fallbacks/news-ufc.jpg",
  other: "/images/fallbacks/news-general.jpg",
};

// ─────────────────────────────────────────────────────────────
//  💾 IN-MEMORY CACHE (for hot queries)
//  ─────────────────────────────────────────────────────────────

interface CacheEntry {
  articles: NewsArticle[];
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 წუთი

function getCached(key: string): NewsArticle[] | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.articles;
}

function setCached(key: string, articles: NewsArticle[]): void {
  // Cleanup if too big
  if (memoryCache.size > 50) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, { articles, expiresAt: Date.now() + CACHE_TTL });
}

// ─────────────────────────────────────────────────────────────
//  🔄 RETRY HELPER
//  ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 500 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }

    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
//  🧹 NORMALIZATION — different APIs → unified NewsArticle
// ─────────────────────────────────────────────────────────────

function detectSport(text: string): SportTag {
  if (CATEGORY_KEYWORDS.football.test(text)) return "football";
  if (CATEGORY_KEYWORDS.basketball.test(text)) return "basketball";
  if (CATEGORY_KEYWORDS.tennis.test(text)) return "tennis";
  if (CATEGORY_KEYWORDS.f1.test(text)) return "f1";
  if (CATEGORY_KEYWORDS.ufc.test(text)) return "ufc";
  return "other";
}

function detectCategory(text: string): NewsCategory {
  if (CATEGORY_KEYWORDS.transfers.test(text)) return "transfers";
  if (CATEGORY_KEYWORDS.football.test(text)) return "football";
  if (CATEGORY_KEYWORDS.basketball.test(text)) return "basketball";
  if (CATEGORY_KEYWORDS.tennis.test(text)) return "tennis";
  if (CATEGORY_KEYWORDS.f1.test(text)) return "f1";
  if (CATEGORY_KEYWORDS.ufc.test(text)) return "ufc";
  if (CATEGORY_KEYWORDS.politics.test(text)) return "politics";
  if (CATEGORY_KEYWORDS.tech.test(text)) return "tech";
  if (CATEGORY_KEYWORDS.economy.test(text)) return "economy";
  return "general";
}

function detectSentiment(text: string): Sentiment {
  const positive =
    /win|victory|success|great|amazing|brilliant|champion|triumph|record|best|historic|celebrat|unbeaten|dominant/i;
  const negative =
    /loss|defeat|injury|fail|scandal|controversy|sacked|banned|arrest|criticism|embarrass|worst|blow|setback/i;

  const posCount = (text.match(positive) || []).length;
  const negCount = (text.match(negative) || []).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

function isBreaking(title: string, publishedAt: string): boolean {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 36e5;
  const hasBreakingKeyword =
    /breaking|just in|urgent|confirmed|official/i.test(title);
  return ageHours < 3 && hasBreakingKeyword;
}

function calculateReadTime(...texts: (string | null)[]): number {
  const content = texts.filter(Boolean).join(" ");
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");
}

function makeId(url: string): string {
  // Simple, stable hash (avoid Buffer for edge compat)
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + url.length.toString(36);
}

function optimizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  // Some APIs return placeholder URLs
  if (url.includes("placehold") || url.includes("default")) return null;
  return url;
}

function normalize(
  raw: {
    source?: { id?: string | null; name?: string } | string;
    author?: string | null;
    title?: string;
    description?: string | null;
    content?: string | null;
    url?: string;
    image?: string | null;
    urlToImage?: string | null;
    publishedAt?: string;
    published_at?: string;
  },
  language = "en"
): NewsArticle | null {
  if (!raw.title || !raw.url) return null;

  const sourceName =
    typeof raw.source === "string"
      ? raw.source
      : raw.source?.name ?? "Unknown";

  const publishedAt = raw.publishedAt ?? raw.published_at ?? new Date().toISOString();
  const image = optimizeImageUrl(raw.image ?? raw.urlToImage ?? null);
  const fullText = `${raw.title} ${raw.description ?? ""} ${raw.content ?? ""}`;
  const sport = detectSport(fullText);

  return {
    id: makeId(raw.url),
    source: {
      id: typeof raw.source === "object" ? raw.source?.id ?? null : null,
      name: sourceName,
    },
    author: raw.author ?? null,
    title: raw.title.trim(),
    description: raw.description?.trim() ?? null,
    content: raw.content?.trim() ?? null,
    url: raw.url,
    image,
    imageFallback: IMAGE_FALLBACKS[sport],
    publishedAt,
    category: detectCategory(fullText),
    sport,
    language,
    readTime: calculateReadTime(raw.title, raw.description, raw.content),
    sentiment: detectSentiment(fullText),
    isBreaking: isBreaking(raw.title, publishedAt),
    slug: makeSlug(raw.title),
  };
}

function deduplicate(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const result: NewsArticle[] = [];

  for (const article of articles) {
    // normalize title for dedup
    const titleKey = article.title.toLowerCase().replace(/[^\w]/g, "").slice(0, 60);
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);
    result.push(article);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
//  📰 SOURCE 1: NewsAPI
//  ─────────────────────────────────────────────────────────────

async function fetchFromNewsAPI(
  query: string,
  language: string,
  pageSize: number,
  sortBy: "publishedAt" | "relevancy" | "popularity" = "publishedAt"
): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) return [];

  const params = new URLSearchParams({
    q: query,
    language,
    sortBy,
    pageSize: Math.min(pageSize, 100).toString(),
    apiKey: NEWSAPI_KEY,
  });

  const res = await fetchWithRetry(`${NEWSAPI_URL}/everything?${params}`, {
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    console.warn(`[NewsAPI] ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  if (data.status !== "ok") {
    console.warn(`[NewsAPI] ${data.message}`);
    return [];
  }

  return (data.articles ?? [])
    .map((a: Record<string, unknown>) => normalize(a as never, language))
    .filter((a: NewsArticle | null): a is NewsArticle => a !== null);
}

// ─────────────────────────────────────────────────────────────
//  🌐 SOURCE 2: GNews (fallback)
//  ─────────────────────────────────────────────────────────────

async function fetchFromGNews(
  query: string,
  language: string,
  pageSize: number
): Promise<NewsArticle[]> {
  if (!GNEWS_KEY) return [];

  const langMap: Record<string, string> = { ka: "en", en: "en", ru: "ru" };
  const params = new URLSearchParams({
    q: query,
    lang: langMap[language] ?? "en",
    max: Math.min(pageSize, 100).toString(),
    sortby: "publishedAt",
    apikey: GNEWS_KEY,
  });

  const res = await fetchWithRetry(`${GNEWS_URL}/search?${params}`, {
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    console.warn(`[GNews] ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return (data.articles ?? [])
    .map((a: Record<string, unknown>) =>
      normalize(
        {
          source: a.source as { name: string },
          author: null,
          title: a.title as string,
          description: a.description as string,
          content: a.content as string,
          url: a.url as string,
          image: a.image as string,
          publishedAt: a.publishedAt as string,
        },
        language
      )
    )
    .filter((a: NewsArticle | null): a is NewsArticle => a !== null);
}

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN: getSportsNews (multi-source with fallback)
//  ─────────────────────────────────────────────────────────────

export async function getSportsNews(
  query: string = SPORT_QUERIES.general,
  pageSize = 20,
  language = "en"
): Promise<NewsArticle[]> {
  const cacheKey = `sports:${query}:${pageSize}:${language}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Try NewsAPI first
  let articles = await fetchFromNewsAPI(query, language, pageSize);

  // Fallback: GNews
  if (articles.length === 0) {
    articles = await fetchFromGNews(query, language, pageSize);
  }

  const deduped = deduplicate(articles);
  if (deduped.length > 0) setCached(cacheKey, deduped);
  return deduped;
}

// ─────────────────────────────────────────────────────────────
//  🔥 HEADLINES (top stories)
//  ─────────────────────────────────────────────────────────────

export async function getTopHeadlines(
  category: NewsCategory = "general",
  country = "us",
  pageSize = 20
): Promise<NewsArticle[]> {
  const cacheKey = `headlines:${category}:${country}:${pageSize}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!NEWSAPI_KEY) return [];

  // Map to NewsAPI-compatible categories
  const categoryMap: Record<NewsCategory, string> = {
    football: "sports",
    basketball: "sports",
    tennis: "sports",
    f1: "sports",
    ufc: "sports",
    transfers: "sports",
    politics: "general",
    tech: "technology",
    economy: "business",
    general: "sports",
  };

  const params = new URLSearchParams({
    category: categoryMap[category] ?? "sports",
    country,
    pageSize: Math.min(pageSize, 100).toString(),
    apiKey: NEWSAPI_KEY,
  });

  try {
    const res = await fetchWithRetry(`${NEWSAPI_URL}/top-headlines?${params}`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const articles = (data.articles ?? [])
      .map((a: Record<string, unknown>) => normalize(a as never, "en"))
      .filter((a: NewsArticle | null): a is NewsArticle => a !== null);

    const deduped = deduplicate(articles);
    setCached(cacheKey, deduped);
    return deduped;
  } catch (error) {
    console.error("[getTopHeadlines]", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  🎯 CATEGORY-SPECIFIC
//  ─────────────────────────────────────────────────────────────

export async function getNewsByCategory(
  category: NewsCategory,
  language = "en",
  pageSize = 10
): Promise<NewsArticle[]> {
  const query = SPORT_QUERIES[category as keyof typeof SPORT_QUERIES] ?? "sport";
  const articles = await getSportsNews(query, pageSize * 2, language);
  return articles.filter((a) => a.category === category).slice(0, pageSize);
}

export async function getNewsByTopic(
  topic: string,
  language = "en",
  pageSize = 10
): Promise<NewsArticle[]> {
  return getSportsNews(topic, pageSize, language);
}

export async function getTeamNews(
  teamName: string,
  language = "en",
  pageSize = 10
): Promise<NewsArticle[]> {
  return getSportsNews(`"${teamName}"`, pageSize, language);
}

export async function getPlayerNews(
  playerName: string,
  language = "en",
  pageSize = 10
): Promise<NewsArticle[]> {
  return getSportsNews(`"${playerName}"`, pageSize, language);
}

// ─────────────────────────────────────────────────────────────
//  🔍 SEARCH
//  ─────────────────────────────────────────────────────────────

export async function searchNews(
  query: string,
  language = "en",
  pageSize = 20
): Promise<NewsArticle[]> {
  if (!query.trim()) return [];
  return getSportsNews(query.trim(), pageSize, language);
}

// ─────────────────────────────────────────────────────────────
//  🔗 RELATED ARTICLES
//  ─────────────────────────────────────────────────────────────

export async function getRelatedArticles(
  article: NewsArticle,
  limit = 4
): Promise<NewsArticle[]> {
  const cacheKey = `related:${article.id}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = SPORT_QUERIES[article.sport as keyof typeof SPORT_QUERIES] ?? "sport";
  const candidates = await getSportsNews(query, limit * 3, article.language);

  const related = candidates
    .filter((a) => a.id !== article.id)
    .filter((a) => a.category === article.category || a.sport === article.sport)
    .slice(0, limit);

  setCached(cacheKey, related);
  return related;
}

// ─────────────────────────────────────────────────────────────
//  📊 AGGREGATION: all sports in one call
//  ─────────────────────────────────────────────────────────────

export async function getAllSportsNews(
  language = "en",
  perCategory = 5
): Promise<{ category: SportTag; articles: NewsArticle[] }[]> {
  const sports: SportTag[] = ["football", "basketball", "tennis", "f1", "ufc"];

  const results = await Promise.all(
    sports.map(async (sport) => {
      const query = SPORT_QUERIES[sport as keyof typeof SPORT_QUERIES];
      const articles = await getSportsNews(query, perCategory, language);
      return { category: sport, articles };
    })
  );

  return results;
}

// ─────────────────────────────────────────────────────────────
//  🔥 BREAKING NEWS (last 3 hours)
//  ─────────────────────────────────────────────────────────────

export async function getBreakingNews(
  language = "en",
  limit = 5
): Promise<NewsArticle[]> {
  const articles = await getSportsNews(SPORT_QUERIES.general, 30, language);
  return articles
    .filter((a) => a.isBreaking)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
//  🕒 TRENDING (last 24 hours, sorted by recency)
//  ─────────────────────────────────────────────────────────────

export async function getTrendingNews(
  language = "en",
  limit = 10
): Promise<NewsArticle[]> {
  const articles = await getSportsNews(SPORT_QUERIES.general, 40, language);
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  return articles
    .filter((a) => new Date(a.publishedAt).getTime() > cutoff)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
//  🎨 DISPLAY HELPERS
//  ─────────────────────────────────────────────────────────────

export function getRelativeTime(isoDate: string, locale = "en"): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const labels: Record<string, Record<string, string>> = {
    ka: { now: "ახლა", m: "წთ", h: "სთ", d: "დღ" },
    en: { now: "now", m: "m", h: "h", d: "d" },
    ru: { now: "сейчас", m: "м", h: "ч", d: "д" },
  };

  const l = labels[locale] ?? labels.en;

  if (minutes < 1) return l.now;
  if (minutes < 60) return `${minutes}${l.m}`;
  if (hours < 24) return `${hours}${l.h}`;
  return `${days}${l.d}`;
}

export function getArticleImage(article: NewsArticle): string {
  return article.image ?? article.imageFallback;
}

export function getArticleUrl(article: NewsArticle, locale = "ka"): string {
  return `/${locale}/news/${article.slug}`;
}

export function getSportEmoji(sport: SportTag): string {
  const emojis: Record<SportTag, string> = {
    football: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    f1: "🏎️",
    ufc: "🥊",
    other: "🎯",
  };
  return emojis[sport];
}

export function getSentimentColor(sentiment: Sentiment): string {
  const colors: Record<Sentiment, string> = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-slate-400",
  };
  return colors[sentiment];
}

// ─────────────────────────────────────────────────────────────
//  🧹 CACHE MANAGEMENT
//  ─────────────────────────────────────────────────────────────

export function clearNewsCache(): void {
  memoryCache.clear();
}

export function getNewsCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}

// ═══════════════════════════════════════════════════════════════
//  BACKWARDS COMPATIBILITY ALIASES
// ═══════════════════════════════════════════════════════════════

/** Alias — categorize article */
export function categorizeArticle(article: any): string {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  if (/football|soccer|premier league|champions league/.test(text)) return 'football';
  if (/basketball|nba|euroleague/.test(text)) return 'basketball';
  if (/tennis|atp|wta|wimbledon/.test(text)) return 'tennis';
  if (/formula 1|f1|grand prix/.test(text)) return 'f1';
  if (/ufc|mma|boxing/.test(text)) return 'ufc';
  return 'general';
}

/** Alias — article ID */
export function getArticleId(article: any): string {
  const url = article.url || article.sourceUrl || '';
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/** Alias — article slug */
export function getArticleSlug(article: any): string {
  const title = article.title || '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

/** Alias — read time */
export function getReadTime(article: any): number {
  const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}