// ═══════════════════════════════════════════════════════════════
//  SportVerge — Full Article Content Fetcher
//  ─────────────────────────────────────────────────────────────
//  📖 სტატიის სრული ტექსტის ამოღება source URL-იდან
// ═══════════════════════════════════════════════════════════════

export interface ArticleContent {
  paragraphs: string[];
  wordCount: number;
  readTime: number;
}

export async function fetchFullArticle(url: string): Promise<ArticleContent | null> {
  if (!url || !url.startsWith('http')) return null;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const paragraphs = extractParagraphs(html);

    if (paragraphs.length === 0) return null;

    const text = paragraphs.join(' ');
    const wordCount = text.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return { paragraphs, wordCount, readTime };
  } catch (err) {
    console.warn('[Article] fetch failed:', err);
    return null;
  }
}

function extractParagraphs(html: string): string[] {
  // Remove junk
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '');

  // Try article containers
  const patterns = [
    /<div[^>]+class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]+class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+data-component="text-block"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];

  let articleHtml = '';
  for (const pattern of patterns) {
    const matches = cleaned.match(pattern);
    if (matches && matches.length > 0) {
      articleHtml = Array.isArray(matches) ? matches.join('\n') : matches[0];
      break;
    }
  }

  if (!articleHtml) articleHtml = cleaned;

  // Extract <p> paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = pRegex.exec(articleHtml)) !== null) {
    const text = stripHtml(match[1]);
    if (text.length >= 40 && text.length <= 3000) {
      paragraphs.push(text);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of paragraphs) {
    const key = p.slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }

  return unique.slice(0, 25);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}