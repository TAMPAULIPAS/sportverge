// ═══════════════════════════════════════════════════════════════
//  /api/cron/update — ავტომატური განახლება (Vercel Cron)
//  GET /api/cron/update
//  გამოიძახება Vercel-ის მიერ ყოველ 3 საათში
//  აგროვებს: live მატჩები, მომავალი მატჩები, სიახლეები, ვიდეოები
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import {
  getLiveScores,
  getNextLeagueEvents,
  getPastLeagueEvents,
} from '@/lib/api/sportsdb';
import { POPULAR_LEAGUES } from '@/lib/constants';
import {
  getTopHeadlines,
  getSportsNews,
  SPORT_QUERIES,
} from '@/lib/api/news';
import {
  searchVideos,
  getTrendingSportsVideos,
} from '@/lib/api/youtube';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 წამი მაქსიმუმი

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
interface CronResult {
  liveMatches: number;
  upcomingMatches: number;
  pastMatches: number;
  news: number;
  videos: number;
  errors: string[];
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// უსაფრთხოების შემოწმება
// ─────────────────────────────────────────────
function verifyCron(request: Request): boolean {
  // Development-ში ყველა ნებადართულია
  if (process.env.NODE_ENV === 'development') return true;

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // თუ CRON_SECRET არ არის კონფიგურირებული, დავუშვათ
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not set. Skipping auth check.');
    return true;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// ─────────────────────────────────────────────
// დროის ჩამწერი
// ─────────────────────────────────────────────
function now(): string {
  return new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/update
// ═══════════════════════════════════════════════════════════════
export async function GET(request: Request) {
  const startTime = Date.now();

  // ─── უსაფრთხოების შემოწმება ───
  if (!verifyCron(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Invalid CRON_SECRET',
      },
      { status: 401 }
    );
  }

  const results: CronResult = {
    liveMatches: 0,
    upcomingMatches: 0,
    pastMatches: 0,
    news: 0,
    videos: 0,
    errors: [],
  };

  console.log('[Cron] ⏰ Update started at', now());

  // ═══════════════════════════════════════════════════════════════
  //  1. LIVE მატჩები
  // ═══════════════════════════════════════════════════════════════
  try {
    const live = await getLiveScores('Soccer');
    results.liveMatches = live.length;
    console.log(`[Cron] ✅ Live matches: ${live.length}`);
  } catch (err) {
    const msg = `Live matches: ${err instanceof Error ? err.message : err}`;
    results.errors.push(msg);
    console.error('[Cron] ❌', msg);
  }

  // ═══════════════════════════════════════════════════════════════
  //  2. მომავალი მატჩები (პოპულარული ლიგები)
  // ═══════════════════════════════════════════════════════════════
  const leagues = [
    POPULAR_LEAGUES.premierLeague.id.laLiga.id.serieA.id.bundesliga.id.championsLeague.id,
  ];

  for (const leagueId of leagues) {
    try {
      const upcoming = await getNextLeagueEvents(leagueId);
      results.upcomingMatches += upcoming.length;
    } catch (err) {
      results.errors.push(`Upcoming (${leagueId}): ${err}`);
    }
  }
  console.log(`[Cron] ✅ Upcoming matches: ${results.upcomingMatches}`);

  // ═══════════════════════════════════════════════════════════════
  //  3. წარსული მატჩები (ბოლო შედეგები)
  // ═══════════════════════════════════════════════════════════════
  try {
    const past = await getPastLeagueEvents(POPULAR_LEAGUES.premierLeague.id);
    results.pastMatches = past.length;
    console.log(`[Cron] ✅ Past matches: ${past.length}`);
  } catch (err) {
    const msg = `Past matches: ${err instanceof Error ? err.message : err}`;
    results.errors.push(msg);
  }

  // ═══════════════════════════════════════════════════════════════
  //  4. სიახლეები (ტოპ headlines)
  // ═══════════════════════════════════════════════════════════════
  try {
    const headlines = await getTopHeadlines('sports', 'us', 20);
    results.news += headlines.length;
    console.log(`[Cron] ✅ Headlines: ${headlines.length}`);
  } catch (err) {
    const msg = `Headlines: ${err instanceof Error ? err.message : err}`;
    results.errors.push(msg);
  }

  // ═══════════════════════════════════════════════════════════════
  //  5. სიახლეები კატეგორიებით
  // ═══════════════════════════════════════════════════════════════
  const categories = ['football', 'basketball', 'tennis', 'f1', 'ufc'];

  for (const cat of categories) {
    try {
      const query = SPORT_QUERIES[cat as keyof typeof SPORT_QUERIES];
      const articles = await getSportsNews(query, 5, 'en');
      results.news += articles.length;
    } catch (err) {
      results.errors.push(`${cat} news: ${err}`);
    }
  }
  console.log(`[Cron] ✅ Total news: ${results.news}`);

  // ═══════════════════════════════════════════════════════════════
  //  6. ვიდეოები
  // ═══════════════════════════════════════════════════════════════
  try {
    const videos = await getTrendingSportsVideos(10);
    results.videos = videos.length;
    console.log(`[Cron] ✅ Videos: ${videos.length}`);
  } catch (err) {
    const msg = `Videos: ${err instanceof Error ? err.message : err}`;
    results.errors.push(msg);
  }

  // ═══════════════════════════════════════════════════════════════
  //  7. Supabase-ში შენახვა (თუ კონფიგურირებულია)
  // ═══════════════════════════════════════════════════════════════
  let savedToDb = false;

  try {
    const supabase = createServerClient();

    // ─── ცარიელი ჩანაწერის შექმნა (log) ───
    const { error } = await supabase
      .from('cron_logs')
      .insert({
        ran_at: now(),
        duration_ms: Date.now() - startTime,
        results: results,
      });

    if (!error) {
      savedToDb = true;
      console.log('[Cron] ✅ Saved to database');
    } else if (error.code === '42P01') {
      // ცხრილი არ არსებობს — ნორმალურია, თუ ჯერ არ შექმენი
      console.log('[Cron] ⚠️ cron_logs table not found (skip)');
    } else {
      console.warn('[Cron] ⚠️ DB save failed:', error.message);
    }
  } catch (err) {
    // Supabase არ არის კონფიგურირებული
    console.log('[Cron] ⚠️ Supabase not configured (skip DB)');
  }

  // ═══════════════════════════════════════════════════════════════
  //  პასუხი
  // ═══════════════════════════════════════════════════════════════
  const duration = Date.now() - startTime;

  console.log(`[Cron] 🎉 Finished in ${duration}ms`);
  console.log(`[Cron] Errors: ${results.errors.length}`);

  return NextResponse.json(
    {
      success: true,
      duration: `${duration}ms`,
      savedToDb,
      results,
      errorsCount: results.errors.length,
      timestamp: now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}