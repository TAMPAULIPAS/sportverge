// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Context Builder
//  ─────────────────────────────────────────────────────────────
//  🎯 აგროვებს კონტექსტს AI assistant-ისთვის:
//     - საიტის ფუნქციები და გვერდები
//     - Live მატჩები (TheSportsDB)
//     - მომავალი მატჩები (Premier League, La Liga, ...)
//     - ლიგების სია
//     - ბრენდის ინფო
//
//  ✨ Features:
//     - In-memory cache (60 წმ live, 5 წთ upcoming)
//     - Graceful degradation (თუ API ვერ იმუშავა, ცარიელი)
//     - Multi-language (ka/en/ru)
//     - Compact format (ტოკენების დაზოგვა)
// ═══════════════════════════════════════════════════════════════

import { LEAGUES, ROUTES, SPORTS, LOCALE_LABELS } from "@/lib/constants";
import { getLiveScores, getNextLeagueEvents } from "@/lib/api/sportsdb";

// ─────────────────────────────────────────────────────────────
//  💾 CACHE
// ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

export interface AIContext {
  /** საიტის ძირითადი ინფო */
  site: {
    name: string;
    tagline: string;
    features: string[];
    pages: Array<{ name: string; path: string; description: string }>;
    languages: string[];
  };
  /** მიმდინარე live მატჩები */
  liveMatches: Array<{
    home: string;
    away: string;
    score: string;
    league: string;
    minute: string;
  }>;
  /** მომავალი მატჩები */
  upcomingMatches: Array<{
    home: string;
    away: string;
    league: string;
    date: string;
    time: string;
  }>;
  /** ლიგები რომლებსაც ვაფარებთ */
  leagues: string[];
  /** სპორტის სახეობები */
  sports: string[];
  /** მიმდინარე დრო */
  currentTime: string;
}

// ─────────────────────────────────────────────────────────────
//  📊 STATIC: საიტის ინფო (მუდმივი)
// ─────────────────────────────────────────────────────────────

function buildSiteInfo(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    name: "SportVerge",
    tagline: isKa
      ? "სადაც სპორტი კიდეს ხვდება"
      : isRu
      ? "Там, где спорт встречает край"
      : "Where sport meets the edge",
    features: [
      isKa ? "AI პროგნოზები მატჩებზე (მოგების %)" : isRu ? "AI прогнозы матчей (% победы)" : "AI match predictions (win %)",
      isKa ? "Live ანგარიშები რეალურ დროში" : isRu ? "Live счета в реальном времени" : "Live scores in real-time",
      isKa ? "სპორტული სიახლეები (RSS)" : isRu ? "Спортивные новости (RSS)" : "Sports news (RSS)",
      isKa ? "ვიდეო highlight-ები (YouTube)" : isRu ? "Видео-хайлайты (YouTube)" : "Video highlights (YouTube)",
      isKa ? "ორი მხარის კომენტარები" : isRu ? "Комментарии двух сторон" : "Two-sided comments",
      isKa ? "ლიდერბორდი და ბეჯები" : isRu ? "Таблица лидеров и значки" : "Leaderboard and badges",
      isKa ? "3 ენა: ქართული, ინგლისური, რუსული" : isRu ? "3 языка: грузинский, английский, русский" : "3 languages: Georgian, English, Russian",
    ],
    pages: [
      {
        name: isKa ? "მთავარი" : isRu ? "Главная" : "Home",
        path: "/",
        description: isKa ? "Live მატჩები, სიახლეები, AI პროგნოზები" : isRu ? "Live матчи, новости, AI прогнозы" : "Live matches, news, AI predictions",
      },
      {
        name: isKa ? "მატჩები" : isRu ? "Матчи" : "Matches",
        path: "/matches",
        description: isKa ? "ყველა მატჩი — live, დღევანდელი, მომავალი" : isRu ? "Все матчи — live, сегодня, будущие" : "All matches — live, today, upcoming",
      },
      {
        name: isKa ? "სიახლეები" : isRu ? "Новости" : "News",
        path: "/news",
        description: isKa ? "სპორტული სიახლეები ESPN, BBC, Sky Sports" : isRu ? "Спортивные новости ESPN, BBC, Sky Sports" : "Sports news from ESPN, BBC, Sky Sports",
      },
      {
        name: isKa ? "ვიდეო" : isRu ? "Видео" : "Videos",
        path: "/videos",
        description: isKa ? "Highlight-ები, გოლები, მიმოხილვები" : isRu ? "Хайлайты, голы, обзоры" : "Highlights, goals, reviews",
      },
      {
        name: isKa ? "პროგნოზები" : isRu ? "Прогнозы" : "Predictions",
        path: "/predictions",
        description: isKa ? "AI პროგნოზები ყველა მატჩზე + შენი პროგნოზი" : isRu ? "AI прогнозы на все матчи + твой прогноз" : "AI predictions for all matches + your prediction",
      },
      {
        name: isKa ? "ლიდერბორდი" : isRu ? "Лидеры" : "Leaderboard",
        path: "/leaderboard",
        description: isKa ? "ტოპ პროგნოზიორები და ბეჯები" : isRu ? "Топ прогнозистов и значки" : "Top predictors and badges",
      },
      {
        name: isKa ? "გუნდები" : isRu ? "Команды" : "Teams",
        path: "/teams",
        description: isKa ? "გუნდების პროფილები, ფორმა, მატჩები" : isRu ? "Профили команд, форма, матчи" : "Team profiles, form, matches",
      },
      {
        name: isKa ? "მოთამაშეები" : isRu ? "Игроки" : "Players",
        path: "/players",
        description: isKa ? "მოთამაშეების სტატისტიკა და ბიოგრაფია" : isRu ? "Статистика и биография игроков" : "Player stats and biography",
      },
      {
        name: isKa ? "პროფილი" : isRu ? "Профиль" : "Profile",
        path: "/profile",
        description: isKa ? "შენი პროგნოზები, ბეჯები, სტატისტიკა" : isRu ? "Твои прогнозы, значки, статистика" : "Your predictions, badges, stats",
      },
    ],
    languages: Object.values(LOCALE_LABELS).map((l) => l.name),
  };
}

// ─────────────────────────────────────────────────────────────
//  🔴 LIVE MATCHES
// ─────────────────────────────────────────────────────────────

async function fetchLiveMatches(): Promise<AIContext["liveMatches"]> {
  const cacheKey = "ai-context:live";
  const cached = getCached<AIContext["liveMatches"]>(cacheKey);
  if (cached) return cached;

  try {
    const events = await getLiveScores("Soccer");

    const matches = events.slice(0, 10).map((e) => ({
      home: e.strHomeTeam,
      away: e.strAwayTeam,
      score: `${e.intHomeScore ?? "0"}-${e.intAwayScore ?? "0"}`,
      league: e.strLeague,
      minute: e.strProgress || e.strStatus || "",
    }));

    setCached(cacheKey, matches, 60_000); // 60 წამი
    return matches;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  📅 UPCOMING MATCHES
// ─────────────────────────────────────────────────────────────

async function fetchUpcomingMatches(): Promise<AIContext["upcomingMatches"]> {
  const cacheKey = "ai-context:upcoming";
  const cached = getCached<AIContext["upcomingMatches"]>(cacheKey);
  if (cached) return cached;

  try {
    const leagueIds = [
      LEAGUES.PREMIER_LEAGUE.id,
      LEAGUES.LA_LIGA.id,
      LEAGUES.CHAMPIONS_LEAGUE.id,
    ];

    const results = await Promise.all(
      leagueIds.map((id) => getNextLeagueEvents(id).catch(() => []))
    );

    const all = results.flat();
    const unique = new Map<string, (typeof all)[0]>();
    all.forEach((e) => {
      if (e?.idEvent) unique.set(e.idEvent, e);
    });

    const matches = Array.from(unique.values())
      .sort((a, b) => {
        const ta = new Date(`${a.dateEvent}T${a.strTime ?? "00:00:00"}`).getTime();
        const tb = new Date(`${b.dateEvent}T${b.strTime ?? "00:00:00"}`).getTime();
        return ta - tb;
      })
      .slice(0, 15)
      .map((e) => ({
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        league: e.strLeague,
        date: e.dateEvent,
        time: e.strTime ?? "",
      }));

    setCached(cacheKey, matches, 5 * 60_000); // 5 წუთი
    return matches;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN: buildAIContext()
// ─────────────────────────────────────────────────────────────

/**
 * აგროვებს სრულ კონტექსტს AI-სთვის.
 * გამოიძახე chat API route-ში.
 *
 * @example
 * const ctx = await buildAIContext("ka");
 * const prompt = formatContextForPrompt(ctx);
 */
export async function buildAIContext(locale: string): Promise<AIContext> {
  const [liveMatches, upcomingMatches] = await Promise.all([
    fetchLiveMatches(),
    fetchUpcomingMatches(),
  ]);

  return {
    site: buildSiteInfo(locale),
    liveMatches,
    upcomingMatches,
    leagues: Object.values(LEAGUES).map((l) => l.name),
    sports: SPORTS.map((s) => s.id),
    currentTime: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
//  📝 FORMATTER — კონტექსტი → ტექსტი AI-სთვის
// ─────────────────────────────────────────────────────────────

/**
 * აფორმატებს კონტექსტს მოკლე ტექსტად, რომელიც system prompt-ში
 * ჩაიდება. ინახავს ტოკენებს.
 */
export function formatContextForPrompt(ctx: AIContext): string {
  const lines: string[] = [];

  // ─── Site info ───
  lines.push("═══ SITE INFO ═══");
  lines.push(`Name: ${ctx.site.name}`);
  lines.push(`Tagline: ${ctx.site.tagline}`);
  lines.push("");
  lines.push("Features:");
  ctx.site.features.forEach((f) => lines.push(`  • ${f}`));
  lines.push("");
  lines.push("Pages:");
  ctx.site.pages.forEach((p) => {
    lines.push(`  • ${p.name} (${p.path}) — ${p.description}`);
  });
  lines.push("");
  lines.push(`Languages: ${ctx.site.languages.join(", ")}`);
  lines.push("");

  // ─── Live matches ───
  lines.push("═══ LIVE MATCHES (real-time) ═══");
  if (ctx.liveMatches.length === 0) {
    lines.push("  (no live matches right now)");
  } else {
    ctx.liveMatches.forEach((m) => {
      lines.push(`  ⚽ ${m.home} ${m.score} ${m.away} | ${m.league} | ${m.minute}`);
    });
  }
  lines.push("");

  // ─── Upcoming ───
  lines.push("═══ UPCOMING MATCHES (next 5) ═══");
  if (ctx.upcomingMatches.length === 0) {
    lines.push("  (no upcoming matches found)");
  } else {
    ctx.upcomingMatches.slice(0, 5).forEach((m) => {
      lines.push(`  📅 ${m.home} vs ${m.away} | ${m.league} | ${m.date} ${m.time}`);
    });
  }
  lines.push("");

  // ─── Leagues ───
  lines.push("═══ COVERED LEAGUES ═══");
  lines.push(`  ${ctx.leagues.join(", ")}`);
  lines.push("");

  // ─── Sports ───
  lines.push("═══ SPORTS ═══");
  lines.push(`  ${ctx.sports.join(", ")}`);
  lines.push("");

  // ─── Time ───
  lines.push(`Current time (ISO): ${ctx.currentTime}`);

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────
//  🧹 CACHE MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function clearAIContextCache(): void {
  cache.clear();
}

export function getAIContextCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}