// ═══════════════════════════════════════════════════════════════
//  /api/news — სიახლეების API (NewsAPI.org)
//  GET /api/news?category=football&locale=en&limit=20&q=query
//  აბრუნებს: ნორმალიზებულ სიახლეებს 3 ენის მხარდაჭერით
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import {
  getSportsNews,
  getTopHeadlines,
  getNewsByTopic,
  categorizeArticle,
  getReadTime,
  getArticleId,
  getArticleSlug,
  SPORT_QUERIES,
  type NewsArticle,
  type NewsCategory,
} from '@/lib/api/news';

export const revalidate = 900; // 15 წუთი ქეში

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// NewsAPI-ის ვალიდური ენები
// ─────────────────────────────────────────────
const NEWSAPI_LANGS: Record<string, string> = {
  ka: 'en', // ქართულს NewsAPI არ უჭერს მხარს → ინგლისური
  en: 'en',
  ru: 'ru',
};

// ─────────────────────────────────────────────
// სტატიის ნორმალიზაცია ჩვენს ფორმატში
// ─────────────────────────────────────────────
function normalizeArticle(article: NewsArticle) {
  return {
    id: getArticleId(article),
    slug: getArticleSlug(article),
    title: article.title,
    description: article.description,
    image: article.urlToImage,
    source: article.source.name,
    sourceId: article.source.id,
    sourceUrl: article.url,
    author: article.author,
    publishedAt: article.publishedAt,
    category: categorizeArticle(article),
    readTime: getReadTime(article),
    hasAISummary: false,
    hasImage: !!article.urlToImage,
  };
}

// ─────────────────────────────────────────────
// დუბლიკატების წაშლა
// ─────────────────────────────────────────────
function removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

// ─────────────────────────────────────────────
// ცარიელი სტატიების გაფილტვრა
// ─────────────────────────────────────────────
function filterValid(articles: NewsArticle[]): NewsArticle[] {
  return articles.filter(
    (a) =>
      a.title &&
      a.title !== '[Removed]' &&
      a.url &&
      !a.title.toLowerCase().includes('removed')
  );
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/news
// ═══════════════════════════════════════════════════════════════
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ─── პარამეტრები ───
    const category = searchParams.get('category') || 'all';
    const locale = (searchParams.get('locale') || 'ka') as
      | 'ka'
      | 'en'
      | 'ru';
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    );
    const query = searchParams.get('q');

    // ─── NewsAPI ენა ───
    const newsLang = NEWSAPI_LANGS[locale] || 'en';

    // ═══════════════════════════════════════════════════════════
    //  მონაცემების ჩატვირთვა
    // ═══════════════════════════════════════════════════════════
    let articles: NewsArticle[] = [];

    // ─── CASE 1: კონკრეტული query ───
    if (query) {
      articles = await getNewsByTopic(query, newsLang, limit);
    }

    // ─── CASE 2: კატეგორია ───
    else if (category in SPORT_QUERIES) {
      const sportQuery = SPORT_QUERIES[category as keyof typeof SPORT_QUERIES];
      articles = await getSportsNews(sportQuery, limit, newsLang);
    }

    // ─── CASE 3: ყველა სპორტული ───
    else if (category === 'sports') {
      articles = await getSportsNews('sport', limit, newsLang);
    }

    // ─── CASE 4: ტოპ headlines ───
    else if (category === 'all') {
      articles = await getTopHeadlines('sports', 'us', limit);
    }

    // ─── CASE 5: სხვა კატეგორია ───
    else {
      articles = await getSportsNews(category, limit, newsLang);
    }

    // ─── გაფილტვრა + დუბლიკატები ───
    articles = filterValid(articles);
    articles = removeDuplicates(articles);

    // ─── ნორმალიზაცია ───
    const normalized = articles.slice(0, limit).map(normalizeArticle);

    // ─── კატეგორიის სტატისტიკა ───
    const categoryCount = normalized.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ═══════════════════════════════════════════════════════════
    //  პასუხი
    // ═══════════════════════════════════════════════════════════
    return NextResponse.json(
      {
        success: true,
        category,
        locale,
        query: query || null,
        count: normalized.length,
        categoryCount,
        articles: normalized,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error) {
    console.error('[/api/news] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        articles: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/news — სტატიის თარგმნა (სურვილისამებრ)
//  Body: { title: string, description: string, targetLocale: 'en' | 'ru' | 'ka' }
// ═══════════════════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, targetLocale = 'en' } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }

    // ─── Gemini translation ───
    const { translateBatch } = await import('@/lib/api/gemini');

    const items: Record<string, string> = { title };
    if (description) items.description = description;

    const translated = await translateBatch(items, targetLocale);

    if (!translated) {
      return NextResponse.json(
        { success: false, error: 'Translation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      original: items,
      translated,
      targetLocale,
    });
  } catch (error) {
    console.error('[/api/news POST] Error:', error);

    return NextResponse.json(
      { success: false, error: 'News translation error' },
      { status: 500 }
    );
  }
}