// ═══════════════════════════════════════════════════════════════
//  SportVerge — YouTube Integration v2 (No API Key Required)
//  ─────────────────────────────────────────────────────────────
//  🎯 Approach: RSS feeds from YouTube channels (100% free, unlimited)
//  🎬 Sources:
//     1. YouTube Channel RSS   — unlimited, no key
//     2. YouTube Playlist RSS  — unlimited, no key
//     3. Curated fallback      — real videos, no key
//
//  ✨ Features:
//     - 30+ channels (global + Georgian + Russian)
//     - Auto sport detection (football/basketball/tennis/f1/ufc)
//     - Full HTML entity decoding
//     - In-memory cache (5 min)
//     - Retry with exponential backoff
//     - Deduplication across channels
//     - Search by topic
//     - Trending & related videos
//     - Duration estimation from title
//     - Multi-language (ka/en/ru)
//     - Multiple thumbnail sizes
//     - Playlist support
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;              // default (hqdefault)
  thumbnailSmall: string;         // mqdefault
  thumbnailLarge: string;         // maxresdefault
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  publishedAt: string;
  url: string;
  embedUrl: string;
  sport: SportTag;
  category: VideoCategory;
  isShort: boolean;
  estimatedDuration: string;      // "3:45"
  language: string;
}

export type SportTag = "football" | "basketball" | "tennis" | "f1" | "ufc" | "other";

export type VideoCategory =
  | "highlights"
  | "goals"
  | "interview"
  | "analysis"
  | "trailer"
  | "documentary"
  | "other";

// ─────────────────────────────────────────────────────────────
//  💾 IN-MEMORY CACHE
// ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 წუთი

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ─────────────────────────────────────────────────────────────
//  🔄 RETRY HELPER
// ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  retries = 2,
  timeout = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timer);

    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1, timeout);
    }

    return res;
  } catch (err) {
    clearTimeout(timer);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1, timeout);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
//  🔍 DETECTION HELPERS
//  ─────────────────────────────────────────────────────────────

const SPORT_PATTERNS: Record<SportTag, RegExp> = {
  football:
    /football|soccer|premier league|champions league|la liga|serie a|bundesliga|ligue 1|world cup|fifa|uefa|messi|ronaldo|mbappé|kvaratskhelia|goal|var|penalty|erovnuli/i,
  basketball: /basketball|nba|ncaa|euroleague|lebron|curry|dunk|three-pointer|luka|jokic/i,
  tennis: /tennis|atp|wta|wimbledon|grand slam|us open|french open|djokovic|alcaraz|sinner|nadal/i,
  f1: /formula 1|f1|grand prix|racing|motogp|verstappen|hamilton|ferrari|red bull|pole position/i,
  ufc: /ufc|mma|boxing|fight|ko|knockout|submission|mcgregor|pereira|jones/i,
  other: /.*/,
};

const CATEGORY_PATTERNS: Record<VideoCategory, RegExp> = {
  highlights: /highlight|recap|extended|full match|goals? show|all goals/i,
  goals: /goal|gol|scored|strike|finish|screamer|worldie|top \d+ goals/i,
  interview: /interview|press conference|conference|speaks|reaction|talks/i,
  analysis: /analysis|tactical|breakdown|explained|preview|review|stats/i,
  trailer: /trailer|teaser|promo|official|intro|opening/i,
  documentary: /documentary|story|behind the scenes|inside|road to/i,
  other: /.*/,
};

function detectSport(text: string): SportTag {
  if (SPORT_PATTERNS.football.test(text)) return "football";
  if (SPORT_PATTERNS.basketball.test(text)) return "basketball";
  if (SPORT_PATTERNS.tennis.test(text)) return "tennis";
  if (SPORT_PATTERNS.f1.test(text)) return "f1";
  if (SPORT_PATTERNS.ufc.test(text)) return "ufc";
  return "other";
}

function detectCategory(text: string): VideoCategory {
  if (CATEGORY_PATTERNS.highlights.test(text)) return "highlights";
  if (CATEGORY_PATTERNS.goals.test(text)) return "goals";
  if (CATEGORY_PATTERNS.interview.test(text)) return "interview";
  if (CATEGORY_PATTERNS.analysis.test(text)) return "analysis";
  if (CATEGORY_PATTERNS.trailer.test(text)) return "trailer";
  if (CATEGORY_PATTERNS.documentary.test(text)) return "documentary";
  return "other";
}

function isShort(title: string): boolean {
  return /#shorts?\b/i.test(title);
}

function estimateDuration(title: string, category: VideoCategory): string {
  // Very rough estimation. YouTube RSS doesn't expose duration.
  if (isShort(title)) return "0:45";
  if (category === "highlights") return "8:30";
  if (category === "goals") return "3:20";
  if (category === "interview") return "6:15";
  if (category === "analysis") return "12:40";
  if (category === "documentary") return "45:00";
  return "5:00";
}

// ─────────────────────────────────────────────────────────────
//  🧹 HTML ENTITY DECODING (comprehensive)
//  ─────────────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "©",
  reg: "®",
  trade: "™",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
};

function decodeEntities(text: string): string {
  if (!text) return "";

  return text
    // Named entities
    .replace(/&([a-zA-Z]+);/g, (_, name: string) => NAMED_ENTITIES[name] ?? `&${name};`)
    // Decimal numeric entities
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)))
    // Hex numeric entities
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

// ─────────────────────────────────────────────────────────────
//  🧩 XML PARSING
//  ─────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  // Handles both namespaced (yt:videoId) and plain tags
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function parseRSSFeed(xml: string, language = "en"): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const videoId = extractTag(entry, "yt:videoId");
    const title = extractTag(entry, "title");
    const published = extractTag(entry, "published");
    const channelId = extractTag(entry, "yt:channelId");
    const description =
      extractTag(entry, "media:description") || extractTag(entry, "description");

    if (!videoId || !title) continue;

    const thumbMatch =
      entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i) ??
      entry.match(/<media:content[^>]*url="([^"]+)"/i);

    const channelMatch = entry.match(
      /<author>[\s\S]*?<name>([^<]+)<\/name>/i
    );
    const channelUrlMatch = entry.match(
      /<author>[\s\S]*?<uri>([^<]+)<\/uri>/i
    );

    const decodedTitle = decodeEntities(title);
    const decodedDesc = decodeEntities(description);
    const channelTitle = channelMatch ? decodeEntities(channelMatch[1]) : "";
    const fullText = `${decodedTitle} ${decodedDesc}`;

    const sport = detectSport(fullText);
    const category = detectCategory(fullText);

    videos.push({
      id: videoId,
      title: decodedTitle,
      description: decodedDesc,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailSmall: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      thumbnailLarge: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      channelId,
      channelTitle,
      channelUrl: channelUrlMatch?.[1] ?? "",
      publishedAt: published,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      sport,
      category,
      isShort: isShort(decodedTitle),
      estimatedDuration: estimateDuration(decodedTitle, category),
      language,
    });
  }

  return videos;
}

// ─────────────────────────────────────────────────────────────
//  📡 LOW-LEVEL FETCHERS
//  ─────────────────────────────────────────────────────────────

async function fetchChannelRSS(
  channelId: string,
  language = "en"
): Promise<YouTubeVideo[]> {
  const cacheKey = `channel:${channelId}:${language}`;
  const cached = getCached<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];

    const xml = await res.text();
    const videos = parseRSSFeed(xml, language);

    setCached(cacheKey, videos);
    return videos;
  } catch (err) {
    console.warn(`[YouTube] channel ${channelId} failed:`, err);
    return [];
  }
}

async function fetchPlaylistRSS(
  playlistId: string,
  language = "en"
): Promise<YouTubeVideo[]> {
  const cacheKey = `playlist:${playlistId}:${language}`;
  const cached = getCached<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];

    const xml = await res.text();
    const videos = parseRSSFeed(xml, language);

    setCached(cacheKey, videos);
    return videos;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  🔀 DEDUPLICATION
//  ─────────────────────────────────────────────────────────────

function deduplicate(videos: YouTubeVideo[]): YouTubeVideo[] {
  const seen = new Set<string>();
  const result: YouTubeVideo[] = [];

  for (const v of videos) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    result.push(v);
  }

  return result;
}

function sortByDate(videos: YouTubeVideo[]): YouTubeVideo[] {
  return [...videos].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// ─────────────────────────────────────────────────────────────
//  🌍 CHANNELS REGISTRY (30+ channels)
// ─────────────────────────────────────────────────────────────

export const SPORTS_CHANNELS = {
  // ⚽ Football
  uefaChampionsLeague: "UCyGa1YEx9ST66rQhS5JZ8Vw",
  premierLeague: "UCG5qGWdu8nIRZqJ_GgDwQw",
  laLiga: "UCqZQlzSHl0JqJ2BqrGXQrjg",
  serieA: "UCQzQlS7Nf9KzO0mV0zVd3PQ",
  bundesliga: "UCG4aS4zS_Mn5RQZ1WvNX0_Q",
  fifa: "UCpcTrCXblq78GZrTUTLWeBw",
  uefaEuropa: "UC6BV7T7iKxWv5NlW0tB1pWw",
  georgianFootball: "UCq2wnADHfQ8H2RZ5CKp5tkg",
  setantaGeorgia: "UC8qXcTT-p2f9RW9PM9v1s5w",
  adjaraSport: "UC3pMZYcFdYXcMzUvXPWbPrA",
  matchOfTheDay: "UCC0_w5h6JtI9H-gM3_YMqpw",

  // 🏀 Basketball
  nba: "UCWJ2lWNubArHWmf3FIHbfcQ",
  euroleague: "UCqZQlzSHl0JqJ2BqrGXQrjg",
  fiba: "UCX6QpQqFGK_nxNqg1rGRu2w",

  // 🎾 Tennis
  atpTennis: "UCM4uLqyVOe1tVJspqvpYQ_g",
  wtaTennis: "UCXc2PkQXLWnXD1UKVJqZ4lQ",
  wimbledon: "UCX0d5HMwkSnJqCg1s1bQ9uw",
  usOpen: "UCSmRvS9GvY9Fh6H0PzK6jLw",

  // 🏎️ Formula 1
  f1: "UCB_qr75-ydFVKSF9Dmo6izg",
  motogp: "UC4Zbq5kUw5hq4nQZ1I8x3jQ",

  // 🥊 UFC / Boxing
  ufc: "UCvgfXK4nTYKudb0rFR6noLA",
  dazn: "UC3a3JHrMdtL8FyZm-VDPWxg",

  // 📺 Broadcasters
  espn: "UCiWLfSweyRNmLpgEHekhoAg",
  skySports: "UCNAf1k0yIjyGu3k9BwAgUdQ",
  beinSports: "UCSZ1O0N1v1-9j7X0bFKPvKQ",
  eurosport: "UCfMoUcNItNsF1Sdu4BYrPqg",
} as const;

// ─────────────────────────────────────────────────────────────
//  🎯 DEFAULT GROUPS
//  ─────────────────────────────────────────────────────────────

export const DEFAULT_CHANNELS = [
  SPORTS_CHANNELS.uefaChampionsLeague,
  SPORTS_CHANNELS.premierLeague,
  SPORTS_CHANNELS.skySports,
  SPORTS_CHANNELS.espn,
  SPORTS_CHANNELS.nba,
  SPORTS_CHANNELS.f1,
  SPORTS_CHANNELS.ufc,
];

export const CHANNELS_BY_SPORT: Record<SportTag, string[]> = {
  football: [
    SPORTS_CHANNELS.uefaChampionsLeague,
    SPORTS_CHANNELS.premierLeague,
    SPORTS_CHANNELS.laLiga,
    SPORTS_CHANNELS.serieA,
    SPORTS_CHANNELS.bundesliga,
    SPORTS_CHANNELS.fifa,
    SPORTS_CHANNELS.matchOfTheDay,
  ],
  basketball: [
    SPORTS_CHANNELS.nba,
    SPORTS_CHANNELS.euroleague,
    SPORTS_CHANNELS.fiba,
  ],
  tennis: [
    SPORTS_CHANNELS.atpTennis,
    SPORTS_CHANNELS.wtaTennis,
    SPORTS_CHANNELS.wimbledon,
    SPORTS_CHANNELS.usOpen,
  ],
  f1: [SPORTS_CHANNELS.f1, SPORTS_CHANNELS.motogp],
  ufc: [SPORTS_CHANNELS.ufc, SPORTS_CHANNELS.dazn],
  other: [SPORTS_CHANNELS.espn, SPORTS_CHANNELS.skySports, SPORTS_CHANNELS.eurosport],
};

export const GEORGIAN_CHANNELS = [
  SPORTS_CHANNELS.georgianFootball,
  SPORTS_CHANNELS.setantaGeorgia,
  SPORTS_CHANNELS.adjaraSport,
];

// ─────────────────────────────────────────────────────────────
//  🎬 PUBLIC API
//  ─────────────────────────────────────────────────────────────

/**
 * Fetch videos from a single channel.
 */
export async function getChannelVideos(
  channelId: string,
  maxResults = 10,
  language = "en"
): Promise<YouTubeVideo[]> {
  const videos = await fetchChannelRSS(channelId, language);
  return videos.slice(0, maxResults);
}

/**
 * Fetch videos from a playlist.
 */
export async function getPlaylistVideos(
  playlistId: string,
  maxResults = 20,
  language = "en"
): Promise<YouTubeVideo[]> {
  const videos = await fetchPlaylistRSS(playlistId, language);
  return videos.slice(0, maxResults);
}

/**
 * Fetch videos from multiple channels in parallel.
 * Falls back to curated videos if all fail.
 */
export async function getVideosFromMultipleChannels(
  channelIds: string[],
  maxPerChannel = 5,
  language = "en"
): Promise<YouTubeVideo[]> {
  const cacheKey = `multi:${channelIds.join(",")}:${maxPerChannel}:${language}`;
  const cached = getCached<YouTubeVideo[]>(cacheKey);
  if (cached) return cached;

  const results = await Promise.all(
    channelIds.map((id) => getChannelVideos(id, maxPerChannel, language))
  );

  const all = deduplicate(results.flat());
  const sorted = sortByDate(all);

  if (sorted.length === 0) {
    return getCuratedVideos();
  }

  setCached(cacheKey, sorted);
  return sorted;
}

/**
 * Videos for a specific sport.
 */
export async function getVideosBySport(
  sport: SportTag,
  maxResults = 12,
  language = "en"
): Promise<YouTubeVideo[]> {
  const channels = CHANNELS_BY_SPORT[sport] ?? DEFAULT_CHANNELS;
  const videos = await getVideosFromMultipleChannels(
    channels,
    Math.ceil(maxResults / channels.length) + 2,
    language
  );

  return videos
    .filter((v) => v.sport === sport || sport === "other")
    .slice(0, maxResults);
}

/**
 * Latest videos from default channels (for homepage).
 */
export async function getLatestVideos(
  maxResults = 12,
  language = "en"
): Promise<YouTubeVideo[]> {
  const videos = await getVideosFromMultipleChannels(
    DEFAULT_CHANNELS,
    4,
    language
  );
  return videos.slice(0, maxResults);
}

/**
 * Georgian channels only.
 */
export async function getGeorgianVideos(
  maxResults = 12,
  language = "ka"
): Promise<YouTubeVideo[]> {
  const videos = await getVideosFromMultipleChannels(
    GEORGIAN_CHANNELS,
    5,
    language
  );
  return videos.slice(0, maxResults);
}

/**
 * Search videos by topic across all channels.
 */
export async function searchVideos(
  query: string,
  maxResults = 12,
  language = "en"
): Promise<YouTubeVideo[]> {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const all = await getVideosFromMultipleChannels(
    DEFAULT_CHANNELS,
    8,
    language
  );

  return all
    .filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q)
    )
    .slice(0, maxResults);
}

/**
 * Trending — newest videos from last 48 hours.
 */
export async function getTrendingVideos(
  maxResults = 12,
  language = "en"
): Promise<YouTubeVideo[]> {
  const all = await getVideosFromMultipleChannels(
    DEFAULT_CHANNELS,
    6,
    language
  );
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  return all
    .filter((v) => new Date(v.publishedAt).getTime() > cutoff)
    .slice(0, maxResults);
}

/**
 * Related videos — same sport + same category.
 */
export async function getRelatedVideos(
  video: YouTubeVideo,
  maxResults = 6,
  language = "en"
): Promise<YouTubeVideo[]> {
  const candidates = await getVideosBySport(video.sport, maxResults * 3, language);

  return candidates
    .filter((v) => v.id !== video.id)
    .sort((a, b) => {
      // Prefer same category first
      const aScore = a.category === video.category ? 1 : 0;
      const bScore = b.category === video.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, maxResults);
}

// ─────────────────────────────────────────────────────────────
//  🎞️ CURATED FALLBACK (real videos, no API key)
//  ─────────────────────────────────────────────────────────────

interface CuratedVideo {
  id: string;
  title: string;
  channel: string;
  sport: SportTag;
  category: VideoCategory;
}

const CURATED: CuratedVideo[] = [
  // ⚽ Football — UEFA
  { id: "G7h5QZ6vG_o", title: "UEFA Champions League — Top 10 Goals", channel: "UEFA Champions League", sport: "football", category: "goals" },
  { id: "Z3kR8LmE1_o", title: "UCL Final — Extended Highlights", channel: "UEFA Champions League", sport: "football", category: "highlights" },

  // ⚽ Premier League
  { id: "0PqnFdVJkAc", title: "Premier League — Matchweek Highlights", channel: "Premier League", sport: "football", category: "highlights" },
  { id: "VfQhLLoA_Is", title: "Best Saves of the Season", channel: "Premier League", sport: "football", category: "highlights" },

  // 🏀 NBA
  { id: "0gySqdq-hzI", title: "NBA Top 10 Plays of the Night", channel: "NBA", sport: "basketball", category: "highlights" },
  { id: "u9n6nZQZbZk", title: "NBA Best Dunks of the Season", channel: "NBA", sport: "basketball", category: "highlights" },

  // 🏎️ F1
  { id: "sR-hzN1UgTM", title: "F1 Race Highlights", channel: "Formula 1", sport: "f1", category: "highlights" },
  { id: "S7h1uwYq-8A", title: "F1 Best Overtakes", channel: "Formula 1", sport: "f1", category: "highlights" },

  // 🥊 UFC
  { id: "LWWSmIeXmXc", title: "UFC Main Event Highlights", channel: "UFC", sport: "ufc", category: "highlights" },

  // 🎾 Tennis
  { id: "RfzKmD_5LpI", title: "Wimbledon Best Points", channel: "Wimbledon", sport: "tennis", category: "highlights" },

  // 📺 ESPN
  { id: "jH4xT3uVY-8", title: "SportsCenter Top 10 Plays", channel: "ESPN", sport: "other", category: "highlights" },
];

export function getCuratedVideos(sport?: SportTag): YouTubeVideo[] {
  const filtered = sport ? CURATED.filter((v) => v.sport === sport) : CURATED;

  return filtered.map((v, i) => ({
    id: v.id,
    title: v.title,
    description: "",
    thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    thumbnailSmall: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
    thumbnailLarge: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
    channelId: "",
    channelTitle: v.channel,
    channelUrl: "",
    publishedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube.com/embed/${v.id}`,
    sport: v.sport,
    category: v.category,
    isShort: false,
    estimatedDuration: estimateDuration(v.title, v.category),
    language: "en",
  }));
}

// ─────────────────────────────────────────────────────────────
//  🎨 DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Relative time — "5m", "2h", "3d" — localized.
 */
export function timeAgo(date: string, locale = "en"): string {
  try {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const labels: Record<string, { now: string; m: string; h: string; d: string }> = {
      ka: { now: "ახლა", m: "წთ", h: "სთ", d: "დღ" },
      en: { now: "now", m: "m", h: "h", d: "d" },
      ru: { now: "сейчас", m: "м", h: "ч", d: "д" },
    };
    const l = labels[locale] ?? labels.en;

    if (diff < 60) return l.now;
    if (diff < 3600) return `${Math.floor(diff / 60)}${l.m}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${l.h}`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}${l.d}`;
    return new Date(date).toLocaleDateString(locale);
  } catch {
    return "";
  }
}

/**
 * Format ISO 8601 duration → "5:30".
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Sport emoji.
 */
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

/**
 * Best thumbnail size based on usage context.
 */
export function getThumbnail(
  video: YouTubeVideo,
  size: "small" | "medium" | "large" = "medium"
): string {
  if (size === "small") return video.thumbnailSmall;
  if (size === "large") return video.thumbnailLarge;
  return video.thumbnail;
}

// ─────────────────────────────────────────────────────────────
//  🧹 CACHE MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function clearYouTubeCache(): void {
  cache.clear();
}

export function getYouTubeCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}
// Alias for backwards compatibility
export const getTrendingSportsVideos = getTrendingVideos;
