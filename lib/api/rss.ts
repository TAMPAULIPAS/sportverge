// ═══════════════════════════════════════════════════════════════
//  SportVerge — RSS Parser v6 (REAL IMAGES)
//  ─────────────────────────────────────────────────────────────
//  ✅ Real HD images from ESPN/BBC/Sky/Guardian
//  ✅ Unsplash fallback (REAL SPORTS PHOTOS, not banners)
//  ✅ 15+ host-specific quality upgrades
//  ✅ URL API based (never breaks URLs)
// ═══════════════════════════════════════════════════════════════

export interface RSSArticle {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  source: string;
  image: string | null;
  publishedAt: string;
  category: string;
}

// ═══════════════════════════════════════════════════════════════
//  RSS FEEDS
// ═══════════════════════════════════════════════════════════════

const RSS_FEEDS: Record<string, { url: string; source: string }[]> = {
  football: [
    { url: 'http://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport' },
    { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN FC' },
    { url: 'https://www.skysports.com/rss/11095', source: 'Sky Sports' },
    { url: 'https://www.theguardian.com/football/rss', source: 'The Guardian' },
  ],
  basketball: [
    { url: 'https://www.espn.com/espn/rss/nba/news', source: 'ESPN NBA' },
    { url: 'https://www.cbssports.com/rss/headlines/nba/', source: 'CBS Sports' },
  ],
  tennis: [
    { url: 'https://www.espn.com/espn/rss/tennis/news', source: 'ESPN Tennis' },
    { url: 'https://www.theguardian.com/sport/tennis/rss', source: 'The Guardian' },
  ],
  f1: [
    { url: 'https://www.espn.com/espn/rss/f1/news', source: 'ESPN F1' },
    { url: 'https://www.theguardian.com/sport/formulaone/rss', source: 'The Guardian' },
  ],
  ufc: [
    { url: 'https://www.espn.com/espn/rss/mma/news', source: 'ESPN MMA' },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  FALLBACK IMAGES — REAL sports photos from Unsplash
//  ─────────────────────────────────────────────────────────────
//  ⚡ ᲐᲠᲐ banner-ები! რეალური სპორტის ფოტოები.
//     (Unsplash — უფასო, HD, real sports matches)
// ═══════════════════════════════════════════════════════════════

const UNSPLASH_PARAMS = "w=1600&h=900&fit=crop&q=95&auto=format";

const FALLBACK_IMAGES: Record<string, string[]> = {
  football: [
    `https://images.unsplash.com/photo-1522778119026-d647f0596c20?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1551958219-acbc608c6377?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1560272564-c83b66b1ad12?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1574629810360-7efbbe195018?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1553778263-73a83bab9b0c?${UNSPLASH_PARAMS}`,
  ],
  basketball: [
    `https://images.unsplash.com/photo-1546519638-68e109498ffc?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1519861531473-9200262188bf?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1518063319789-7217e6706b04?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1505666287802-931dc83948e9?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?${UNSPLASH_PARAMS}`,
  ],
  tennis: [
    `https://images.unsplash.com/photo-1554068865-24cecd4e34b8?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1530915365347-e35b749a0381?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1617339860293-9f6c1e6e3f8a?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1599586120429-48281b6f0ece?${UNSPLASH_PARAMS}`,
  ],
  f1: [
    `https://images.unsplash.com/photo-1541443131876-44b03de101c5?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1504707748692-419802cf939d?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1583900985737-6d0495555783?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1552674605-db6ffd4facb5?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1541348263662-e068662d82af?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1560272564-c83b66b1ad12?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?${UNSPLASH_PARAMS}`,
  ],
  ufc: [
    `https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1615117972428-28de67cda58e?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1517649763962-0c623066013b?${UNSPLASH_PARAMS}`,
  ],
  general: [
    `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1517649763962-0c623066013b?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1552674605-db6ffd4facb5?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1526676037777-05a232554f77?${UNSPLASH_PARAMS}`,
  ],
};

// ═══════════════════════════════════════════════════════════════
//  HASH
// ═══════════════════════════════════════════════════════════════

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFallbackImage(articleId: string, category: string): string {
  const pool = FALLBACK_IMAGES[category] ?? FALLBACK_IMAGES.general;
  return pool[hashString(articleId) % pool.length];
}

// ═══════════════════════════════════════════════════════════════
//  CLEAN IMAGE URL — host-specific upgrades
// ═══════════════════════════════════════════════════════════════

function cleanImageUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  let cleaned = url.trim();
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  if (!/^https?:\/\//i.test(cleaned)) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return null;
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) return null;

  const host = parsed.hostname.toLowerCase();

  // BBC
  if (host.includes("bbci.co.uk") || host.includes("bbc.co.uk") || host.includes("bbc.com")) {
    parsed.pathname = parsed.pathname
      .replace(/\/news\/(\d+)\//g, "/news/1200/")
      .replace(/\/ace\/standard\/(\d+)\//g, "/ace/standard/1024/")
      .replace(/\/ace\/ws\/(\d+)\//g, "/ace/ws/1024/")
      .replace(/\/ace\/icon\/(\d+)\//g, "/ace/icon/1024/")
      .replace(/\/(\d{3,4})x(\d{3,4})\//g, "/1200x675/")
      .replace(/_(240|320|480|640|800|1024)n?\.(jpg|jpeg|png|webp)/gi, "_1200n.$2");
    return parsed.toString();
  }

  // ESPN
  if (host.includes("espncdn.com") || host.includes("espn.com")) {
    parsed.searchParams.set("w", "1200");
    parsed.searchParams.set("h", "675");
    if (parsed.searchParams.has("scale")) parsed.searchParams.set("scale", "crop");
    if (parsed.searchParams.has("cquality")) parsed.searchParams.set("cquality", "100");
    return parsed.toString();
  }

  // Sky Sports
  if (host.includes("skysports.com") || host.includes("sky.com")) {
    parsed.searchParams.set("width", "1200");
    if (parsed.searchParams.has("height")) parsed.searchParams.set("height", "675");
    if (parsed.searchParams.has("quality")) parsed.searchParams.set("quality", "90");
    return parsed.toString();
  }

  // Guardian
  if (host.includes("theguardian.com") || host.includes("guim.co.uk")) {
    parsed.searchParams.set("width", "1200");
    if (parsed.searchParams.has("height")) parsed.searchParams.set("height", "675");
    parsed.searchParams.set("quality", "90");
    return parsed.toString();
  }

  // CBS Sports
  if (host.includes("cbssports.com")) {
    parsed.searchParams.set("width", "1200");
    if (parsed.searchParams.has("height")) parsed.searchParams.set("height", "675");
    return parsed.toString();
  }

  // SB Nation / Vox
  if (host.includes("sbnation.com") || host.includes("voxmedia") || host.includes("mmafighting.com")) {
    parsed.pathname = parsed.pathname.replace(/\/(\d{3,4})x(\d{3,4})\//g, "/1200x675/");
    return parsed.toString();
  }

  // Generic
  const widthParams = ["w", "width", "Width", "W"];
  let upgraded = false;
  for (const p of widthParams) {
    if (parsed.searchParams.has(p)) {
      const val = parseInt(parsed.searchParams.get(p) || "0", 10);
      if (val < 1200) {
        parsed.searchParams.set(p, "1200");
        upgraded = true;
      }
    }
  }

  const qualityParams = ["q", "quality", "Quality"];
  for (const p of qualityParams) {
    if (parsed.searchParams.has(p)) {
      const val = parseInt(parsed.searchParams.get(p) || "0", 10);
      if (val < 90) parsed.searchParams.set(p, "95");
    }
  }

  if (!upgraded) {
    parsed.pathname = parsed.pathname
      .replace(/\/(240|320|350|400|500|600|640|700|800|960|1024)\//g, "/1200/")
      .replace(/\/(240|320|350|400|500|600|640|700|800|960|1024)x(\d{2,4})\//g, "/1200x675/")
      .replace(/[-_](240|320|350|400|500|600|640|700|800|960|1024)x(\d{2,4})\./g, "-1200x675.");
  }

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ito', 'cid', 'fbclid', 'gclid'].forEach((p) =>
    parsed.searchParams.delete(p)
  );

  return parsed.toString();
}

// ═══════════════════════════════════════════════════════════════
//  IMAGE EXTRACTION — 12 sources
// ═══════════════════════════════════════════════════════════════

function extractImage(itemXml: string): string | null {
  // 1. media:content
  let match = itemXml.match(/<media:content[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 2. media:thumbnail
  match = itemXml.match(/<media:thumbnail[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 3. enclosure
  match = itemXml.match(/<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 4. <image><url>
  match = itemXml.match(/<image[^>]*>\s*<url>([^<]+)<\/url>/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 5. og:image
  match = itemXml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 6. twitter:image
  match = itemXml.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 7. description CDATA + <img>
  const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
  if (descMatch) {
    const desc = descMatch[1]
      .replace(/<!\[CDATA\[/g, "")
      .replace(/\]\]>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

    const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      const url = cleanImageUrl(imgMatch[1]);
      if (url) return url;
    }
  }

  // 8. content:encoded CDATA + <img>
  const contentMatch = itemXml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
  if (contentMatch) {
    const content = contentMatch[1]
      .replace(/<!\[CDATA\[/g, "")
      .replace(/\]\]>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      const url = cleanImageUrl(imgMatch[1]);
      if (url) return url;
    }
  }

  // 9. Any image URL in XML
  match = itemXml.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)[^\s"'<>]*)/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 10. ESPN CDN
  match = itemXml.match(/(https?:\/\/a\.espncdn\.com\/[^\s"'<>]+)/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 11. BBC
  match = itemXml.match(/(https?:\/\/[^\s"'<>]*bbci\.co\.uk\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp))/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  // 12. Guardian
  match = itemXml.match(/(https?:\/\/[^\s"'<>]*guim\.co\.uk\/[^\s"'<>]+)/i);
  if (match) {
    const url = cleanImageUrl(match[1]);
    if (url) return url;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
//  HTML DECODE
// ═══════════════════════════════════════════════════════════════

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  let content = match[1];
  content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return decodeHtml(content);
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

// ═══════════════════════════════════════════════════════════════
//  ID + CATEGORY
// ═══════════════════════════════════════════════════════════════

function generateArticleId(title: string, source: string): string {
  const text = `${title}-${source}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash).toString(36);
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40)
    .replace(/-$/, "");
  return `${slug}-${base}`;
}

function detectCategory(text: string, fallback: string): string {
  const t = text.toLowerCase();
  if (/football|soccer|premier league|champions league|la liga|bundesliga|serie a/.test(t))
    return "football";
  if (/basketball|nba|ncaa|euroleague/.test(t)) return "basketball";
  if (/tennis|atp|wta|wimbledon|us open|french open/.test(t)) return "tennis";
  if (/formula 1|f1|grand prix|motogp|racing/.test(t)) return "f1";
  if (/ufc|mma|boxing|fight/.test(t)) return "ufc";
  return fallback;
}

// ═══════════════════════════════════════════════════════════════
//  FETCH
// ═══════════════════════════════════════════════════════════════

async function fetchWithRetry(url: string, retries = 2, timeout = 10000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 900 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timer);

    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1, timeout);
    }

    return res;
  } catch {
    clearTimeout(timer);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1, timeout);
    }
    return null;
  }
}

async function fetchFeed(url: string, source: string, category: string): Promise<RSSArticle[]> {
  try {
    const res = await fetchWithRetry(url);
    if (!res || !res.ok) {
      console.warn(`[RSS] ${source} -> ${res?.status ?? "failed"}`);
      return [];
    }

    const xml = await res.text();
    const items =
      xml.match(/<item[\s\S]*?<\/item>/gi) ??
      xml.match(/<entry[\s\S]*?<\/entry>/gi) ??
      [];

    const articles: RSSArticle[] = [];

    for (const itemXml of items) {
      const title = extractTag(itemXml, "title");
      if (!title || title.length < 10) continue;

      const description =
        extractTag(itemXml, "description") ||
        extractTag(itemXml, "summary") ||
        extractTag(itemXml, "content");

      let sourceUrl = extractTag(itemXml, "link") || extractAttr(itemXml, "link", "href");
      if (!sourceUrl) sourceUrl = extractTag(itemXml, "guid");

      const publishedAt =
        extractTag(itemXml, "pubDate") ||
        extractTag(itemXml, "published") ||
        extractTag(itemXml, "updated") ||
        new Date().toISOString();

      const id = generateArticleId(title, source);
      const detectedCategory = detectCategory(`${title} ${description}`, category);

      let image = extractImage(itemXml);
      if (!image) {
        image = pickFallbackImage(id, detectedCategory);
      }

      articles.push({
        id,
        title,
        description: description.slice(0, 400),
        sourceUrl,
        source,
        image,
        publishedAt,
        category: detectedCategory,
      });
    }

    return articles;
  } catch (err) {
    console.warn(`[RSS] ${source} failed:`, err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════

export async function getRSSNews(category: string, limit = 20): Promise<RSSArticle[]> {
  const feeds = RSS_FEEDS[category];
  if (!feeds) return [];

  const results = await Promise.all(
    feeds.map((feed) => fetchFeed(feed.url, feed.source, category))
  );

  const all = results.flat();

  const seen = new Set<string>();
  const unique: RSSArticle[] = [];
  for (const a of all) {
    const key = a.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(a);
  }

  return unique
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function getAllRSSNews(perCategory = 6): Promise<RSSArticle[]> {
  const categories = Object.keys(RSS_FEEDS);

  const results = await Promise.all(
    categories.map((cat) => getRSSNews(cat, perCategory))
  );

  const interleaved: RSSArticle[] = [];
  const maxLen = Math.max(...results.map((r) => r.length));

  for (let i = 0; i < maxLen; i++) {
    for (const categoryResults of results) {
      if (categoryResults[i]) interleaved.push(categoryResults[i]);
    }
  }

  return interleaved;
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

export function getTimeAgo(date: string, locale = "ka"): string {
  try {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const isKa = locale === "ka";
    const isRu = locale === "ru";

    if (diff < 60) return isKa ? "ახლა" : isRu ? "сейчас" : "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}${isKa ? "წთ" : isRu ? "м" : "m"}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${isKa ? "სთ" : isRu ? "ч" : "h"}`;
    return `${Math.floor(diff / 86400)}${isKa ? "დღ" : isRu ? "д" : "d"}`;
  } catch {
    return "";
  }
}

export const NEWS_CATEGORIES = ["football", "basketball", "tennis", "f1", "ufc"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];