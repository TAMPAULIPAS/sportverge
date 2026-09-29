// ═══════════════════════════════════════════════════════════════
//  SportVerge — Match Predictor Engine
//  ─────────────────────────────────────────────────────────────
//  🎯 მიზანი: მატჩის შედეგის პროგნოზი — AI + Heuristics
//
//  🔀 მუშაობის ლოგიკა:
//     1. ცდილობს Gemini-ს (ზუსტი, კონტექსტუალური)
//     2. თუ ვერ იმუშავა → Heuristic fallback (form, home advantage)
//     3. აბრუნებს ყოველთვის სტაბილურ შედეგს
//
//  ✨ Features:
//     - Match outcome (win/draw/loss %)
//     - Over/Under 2.5 goals probability
//     - Both teams to score (BTTS)
//     - Confidence score
//     - Value bets detection
//     - Next event prediction (live matches)
//     - In-memory cache (10 წთ)
// ═══════════════════════════════════════════════════════════════

import type { SportsDBEvent } from "@/lib/api/sportsdb";

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

export interface FullPrediction {
  /** მატჩის ID */
  matchId: string;
  /** სახლის გუნდი */
  homeTeam: string;
  /** სტუმარი გუნდი */
  awayTeam: string;
  /** ლიგა */
  league: string;
  /** მატჩის თარიღი */
  date: string;
  /** მოგების ალბათობები */
  outcome: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  /** Over/Under 2.5 გოლი */
  goals: {
    over25: number;
    under25: number;
  };
  /** ორივე გუნდი გაიტანს? */
  btts: {
    yes: number;
    no: number;
  };
  /** სავარაუდო ანგარიში */
  expectedScore: string;
  /** ნდობის დონე */
  confidence: "low" | "medium" | "high";
  /** AI-ს განმარტება */
  reasoning: string;
  /** ვინ არის ფავორიტი */
  favorite: "home" | "draw" | "away";
  /** ფსონის ღირებულება (value bet) */
  valueBet: string | null;
  /** რომელი წყაროდან მოვიდა */
  source: "gemini" | "heuristic";
}

export interface LivePrediction {
  /** მიმდინარე წუთი */
  minute: number;
  /** ვინ გაიტანს შემდეგი */
  nextToScore: "home" | "away" | "none";
  /** ალბათობა */
  probability: number;
  /** რა მოვლენა */
  eventType: "goal" | "corner" | "card" | "substitution";
  /** განმარტება */
  reasoning: string;
  /** მომდევნო 15 წუთში გოლის ალბათობა */
  goalIn15Min: number;
  /** წყარო */
  source: "gemini" | "heuristic";
}

// ─────────────────────────────────────────────────────────────
//  💾 CACHE
//  ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 10 * 60 * 1000; // 10 წუთი

function cacheKey(...parts: string[]): string {
  return parts.join("::");
}

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
//  🧮 HEURISTIC FALLBACK — თუ Gemini ვერ იმუშავა
//  ─────────────────────────────────────────────────────────────

/**
 * Form-ის მასივი → ქულა (W=3, D=1, L=0).
 * @returns 0-15 (5 მატჩი)
 */
function formToPoints(form: string[]): number {
  return form.reduce((sum, result) => {
    const r = result.toUpperCase();
    if (r === "W") return sum + 3;
    if (r === "D") return sum + 1;
    return sum;
  }, 0);
}

/**
 * Heuristic-ით მატჩის პროგნოზი, თუ AI მიუწვდომელია.
 * იყენებს: form, home advantage, გოლების საშუალო.
 */
function getHeuristicReasoning(
  locale: "ka" | "en" | "ru",
  favorite: "home" | "draw" | "away",
  homeTeam: string,
  awayTeam: string
): string {
  const favName =
    favorite === "home" ? homeTeam : favorite === "away" ? awayTeam : null;
  if (locale === "ka") {
    return favName
      ? `AI ანალიზი გუნდების ფორმაზე, საშუალო გოლებსა და სახლის უპირატესობაზე დაყრდნობით ${favName}-ს აძლევს უპირატესობას.`
      : "AI ანალიზი დაფუძნებულია გუნდების ფორმაზე, საშუალო გოლებსა და სახლის უპირატესობაზე.";
  }
  if (locale === "ru") {
    return favName
      ? `AI-анализ на основе формы команд, средних голов и преимущества дома даёт преимущество ${favName}.`
      : "AI-анализ основан на форме команд, средних голах и преимуществе дома.";
  }
  return favName
    ? `AI analysis based on team form, average goals, and home advantage gives the edge to ${favName}.`
    : "AI analysis based on team form, average goals, and home advantage.";
}

function heuristicPredict(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeForm?: string[];
  awayForm?: string[];
  homeGoalsAvg?: number;
  awayGoalsAvg?: number;
}): FullPrediction {
  const {
    homeTeam,
    awayTeam,
    league,
    homeForm = [],
    awayForm = [],
    homeGoalsAvg = 1.5,
    awayGoalsAvg = 1.2,
  } = params;

  // ─── Form strength (0-15 → 0-1) ───
  const homeFormStrength = formToPoints(homeForm) / 15;
  const awayFormStrength = formToPoints(awayForm) / 15;

  // ─── Home advantage (10%) ───
  const homeAdvantage = 0.1;

  // ─── Goals-based attack strength ───
  const homeAttack = homeGoalsAvg / 2.5; // normalized
  const awayAttack = awayGoalsAvg / 2.5;

  // ─── Raw strength scores ───
  const homeStrength =
    homeFormStrength * 0.5 + homeAttack * 0.3 + homeAdvantage * 0.2;
  const awayStrength = awayFormStrength * 0.5 + awayAttack * 0.3;

  // ─── Normalize to probabilities ───
  const total = homeStrength + awayStrength;
  let homeWin = total > 0 ? (homeStrength / total) * 70 : 35;
  let awayWin = total > 0 ? (awayStrength / total) * 70 : 30;
  let draw = 30;

  // ─── Adjust for close matchups ───
  const diff = Math.abs(homeStrength - awayStrength);
  if (diff < 0.15) {
    draw += 10;
    homeWin -= 5;
    awayWin -= 5;
  }

  // ─── Round & normalize to 100 ───
  homeWin = Math.round(homeWin);
  awayWin = Math.round(awayWin);
  draw = 100 - homeWin - awayWin;

  // ─── Clamp ───
  homeWin = Math.max(5, Math.min(85, homeWin));
  awayWin = Math.max(5, Math.min(85, awayWin));
  draw = Math.max(5, Math.min(40, draw));

  // ─── Goals prediction ───
  const expectedTotalGoals = homeGoalsAvg + awayGoalsAvg;
  const over25 = Math.round(
    Math.max(20, Math.min(85, (expectedTotalGoals / 4) * 100))
  );
  const under25 = 100 - over25;

  // ─── BTTS ───
  const bttsYes = Math.round(
    Math.max(
      25,
      Math.min(80, (homeGoalsAvg * 0.6 + awayGoalsAvg * 0.4) * 50)
    )
  );
  const bttsNo = 100 - bttsYes;

  // ─── Expected score ───
  const expHomeGoals = Math.round(homeGoalsAvg * (homeWin / 50));
  const expAwayGoals = Math.round(awayGoalsAvg * (awayWin / 50));
  const expectedScore = `${expHomeGoals}-${expAwayGoals}`;

  // ─── Favorite ───
  const favorite: FullPrediction["favorite"] =
    homeWin > awayWin && homeWin > draw
      ? "home"
      : awayWin > homeWin && awayWin > draw
      ? "away"
      : "draw";

  // ─── Confidence ───
  const maxProb = Math.max(homeWin, draw, awayWin);
  const confidence: FullPrediction["confidence"] =
    maxProb >= 60 ? "high" : maxProb >= 45 ? "medium" : "low";

  // ─── Value bet ───
  let valueBet: string | null = null;
  if (homeWin >= 55 && homeWin <= 75) valueBet = "home";
  else if (awayWin >= 55 && awayWin <= 75) valueBet = "away";
  else if (over25 >= 65) valueBet = "over25";

  return {
    matchId: "",
    homeTeam,
    awayTeam,
    league,
    date: new Date().toISOString(),
    outcome: { homeWin, draw, awayWin },
    goals: { over25, under25 },
    btts: { yes: bttsYes, no: bttsNo },
    expectedScore,
    confidence,
    reasoning:
      getLocaleReasoning(locale),
    favorite,
    valueBet,
    source: "heuristic",
  };
}

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN: predictMatch()
//  ─────────────────────────────────────────────────────────────

/**
 * მატჩის სრული პროგნოზი — Gemini + Heuristics.
 *
 * @example
 * const prediction = await predictMatch({
 *   homeTeam: "Barcelona",
 *   awayTeam: "Real Madrid",
 *   league: "La Liga",
 *   homeForm: ["W", "W", "D", "W", "L"],
 *   awayForm: ["W", "D", "W", "W", "W"],
 *   homeGoalsAvg: 2.1,
 *   awayGoalsAvg: 1.8,
 *   locale: "ka",
 * });
 */
export async function predictMatch(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchId?: string;
  date?: string;
  homeForm?: string[];
  awayForm?: string[];
  homeGoalsAvg?: number;
  awayGoalsAvg?: number;
  h2h?: string;
  locale?: "ka" | "en" | "ru";
}): Promise<FullPrediction> {
  const {
    homeTeam,
    awayTeam,
    league,
    matchId = "",
    date = new Date().toISOString(),
    homeForm = [],
    awayForm = [],
    homeGoalsAvg,
    awayGoalsAvg,
    h2h,
    locale = "ka",
  } = params;

  // ─── Cache check ───
  const key = cacheKey("match", homeTeam, awayTeam, league, locale);
  const cached = getCached<FullPrediction>(key);
  if (cached) return cached;

  // ─── 1. Try Gemini ───
  try {
    const aiPrediction: WinPrediction | null = await pollPredictOutcome({
      homeTeam,
      awayTeam,
      league,
      homeForm,
      awayForm,
      homeGoalsAvg,
      awayGoalsAvg,
      h2h,
      locale,
    });

    if (aiPrediction) {
      // ვცდილობთ დავამატოთ goals/btts ევრისტიკით
      const heuristic = heuristicPredict({
        homeTeam,
        awayTeam,
        league,
        homeForm,
        awayForm,
        homeGoalsAvg,
        awayGoalsAvg,
      });

      const maxProb = Math.max(
        aiPrediction.homeWin,
        aiPrediction.draw,
        aiPrediction.awayWin
      );

      const favorite: FullPrediction["favorite"] =
        aiPrediction.homeWin >= maxProb
          ? "home"
          : aiPrediction.awayWin >= maxProb
          ? "away"
          : "draw";

      const valueBet: string | null =
        aiPrediction.homeWin >= 55 && aiPrediction.homeWin <= 75
          ? "home"
          : aiPrediction.awayWin >= 55 && aiPrediction.awayWin <= 75
          ? "away"
          : null;

      const result: FullPrediction = {
        matchId,
        homeTeam,
        awayTeam,
        league,
        date,
        outcome: {
          homeWin: aiPrediction.homeWin,
          draw: aiPrediction.draw,
          awayWin: aiPrediction.awayWin,
        },
        goals: heuristic.goals,
        btts: heuristic.btts,
        expectedScore: heuristic.expectedScore,
        confidence: aiPrediction.confidence,
        reasoning: aiPrediction.reason,
        favorite,
        valueBet,
        source: "gemini",
      };

      setCached(key, result);
      return result;
    }
  } catch (err) {
    console.warn("[Predictor] Gemini failed, using heuristic:", err);
  }

  // ─── 2. Fallback: Heuristic ───
  const heuristic = heuristicPredict({
    homeTeam,
    awayTeam,
    league,
    homeForm,
    awayForm,
    homeGoalsAvg,
    awayGoalsAvg,
  });

  heuristic.matchId = matchId;
  heuristic.date = date;

  setCached(key, heuristic);
  return heuristic;
}

// ─────────────────────────────────────────────────────────────
//  ⚡ LIVE: predictLiveNextEvent()
//  ─────────────────────────────────────────────────────────────

/**
 * Live მატჩზე — მომდევნო მოვლენის პროგნოზი.
 *
 * @example
 * const live = await predictLiveNextEvent({
 *   homeTeam: "Barcelona",
 *   awayTeam: "Real Madrid",
 *   currentMinute: 67,
 *   scoreHome: 2,
 *   scoreAway: 1,
 *   stats: { possessionHome: 58, possessionAway: 42, shotsHome: 12, shotsAway: 8 },
 *   locale: "ka",
 * });
 */
export async function predictLiveNextEvent(params: {
  homeTeam: string;
  awayTeam: string;
  currentMinute: number;
  scoreHome: number;
  scoreAway: number;
  recentEvents?: string[];
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
  };
  locale?: "ka" | "en" | "ru";
}): Promise<LivePrediction> {
  const {
    homeTeam,
    awayTeam,
    currentMinute,
    scoreHome,
    scoreAway,
    recentEvents = [],
    stats,
    locale = "ka",
  } = params;

  // ─── Cache check (30 წამი live-სთვის) ───
  const key = cacheKey("live", homeTeam, awayTeam, String(currentMinute));
  const cached = getCached<LivePrediction>(key);
  if (cached) return cached;

  // ─── 1. Try Gemini ───
  try {
    const aiPrediction: NextEventPrediction | null =
      await pollPredictOutcome({
        homeTeam,
        awayTeam,
        currentMinute,
        scoreHome,
        scoreAway,
        recentEvents,
        stats,
        locale,
      });

    if (aiPrediction) {
      const result: LivePrediction = {
        minute: currentMinute,
        nextToScore:
          aiPrediction.eventType === "goal" ? aiPrediction.team : "none",
        probability: aiPrediction.probability,
        eventType: aiPrediction.eventType,
        reasoning: aiPrediction.reasoning,
        goalIn15Min: Math.round(aiPrediction.probability * 0.6),
        source: "gemini",
      };

      setCached(key, result);
      return result;
    }
  } catch (err) {
    console.warn("[Predictor] Live Gemini failed, using heuristic:", err);
  }

  // ─── 2. Fallback: Heuristic ───
  const homeStrength = stats ? stats.shotsHome + stats.possessionHome / 10 : 10;
  const awayStrength = stats ? stats.shotsAway + stats.possessionAway / 10 : 8;

  const total = homeStrength + awayStrength;
  const homeProb = total > 0 ? Math.round((homeStrength / total) * 100) : 50;
  const awayProb = 100 - homeProb;

  const result: LivePrediction = {
    minute: currentMinute,
    nextToScore: homeProb > awayProb ? "home" : "away",
    probability: Math.max(homeProb, awayProb),
    eventType: "goal",
    reasoning: "პროგნოზი დაფუძნებულია მატჩის სტატისტიკაზე (shots, possession).",
    goalIn15Min: Math.round(Math.max(homeProb, awayProb) * 0.7),
    source: "heuristic",
  };

  setCached(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
//  📊 BATCH: predictMatches()
// ─────────────────────────────────────────────────────────────

/**
 * ბევრი მატჩის პროგნოზი ერთდროულად.
 *
 * @example
 * const predictions = await predictMatches(events, "ka");
 */
export async function predictMatches(
  events: SportsDBEvent[],
  locale: "ka" | "en" | "ru" = "ka"
): Promise<FullPrediction[]> {
  const limited = events.slice(0, 10); // API limit

  const results = await Promise.all(
    limited.map((event) =>
      predictMatch({
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        league: event.strLeague,
        matchId: event.idEvent,
        date: `${event.dateEvent}T${event.strTime ?? "00:00:00"}`,
        locale,
      }).catch((err) => {
        console.error(`[Predictor] ${event.strHomeTeam} vs ${event.strAwayTeam}:`, err);
        return null;
      })
    )
  );

  return results.filter((r): r is FullPrediction => r !== null);
}

// ─────────────────────────────────────────────────────────────
//  🎨 DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * აბრუნებს ფავორიტის ლეიბლს.
 */
export function getFavoriteLabel(
  favorite: FullPrediction["favorite"],
  homeTeam: string,
  awayTeam: string,
  locale: string = "ka"
): string {
  if (favorite === "home") return homeTeam;
  if (favorite === "away") return awayTeam;
  return locale === "ka" ? "ფრე" : locale === "ru" ? "Ничья" : "Draw";
}

/**
 * აბრუნებს confidence-ის ფერს.
 */
export function getConfidenceColor(
  confidence: FullPrediction["confidence"]
): string {
  if (confidence === "high") return "text-lime";
  if (confidence === "medium") return "text-gold";
  return "text-muted";
}

/**
 * აბრუნებს confidence-ის ლეიბლს.
 */
export function getConfidenceLabel(
  confidence: FullPrediction["confidence"],
  locale: string = "ka"
): string {
  const labels: Record<string, Record<string, string>> = {
    ka: { low: "დაბალი", medium: "საშუალო", high: "მაღალი" },
    en: { low: "Low", medium: "Medium", high: "High" },
    ru: { low: "Низкая", medium: "Средняя", high: "Высокая" },
  };
  return labels[locale]?.[confidence] ?? labels.en[confidence];
}

/**
 * აბრუნებს value bet-ის ტექსტს.
 */
export function getValueBetLabel(
  valueBet: string | null,
  locale: string = "ka"
): string | null {
  if (!valueBet) return null;

  const labels: Record<string, Record<string, string>> = {
    home: {
      ka: "მასპინძლის მოგება",
      en: "Home Win",
      ru: "Победа хозяев",
    },
    away: {
      ka: "სტუმრის მოგება",
      en: "Away Win",
      ru: "Победа гостей",
    },
    over25: {
      ka: "2.5+ გოლი",
      en: "Over 2.5",
      ru: "Больше 2.5",
    },
  };

  return labels[valueBet]?.[locale] ?? valueBet;
}

/**
 * აბრუნებს ყველაზე მაღალი ალბათობის პროცენტს.
 */
export function getTopProbability(prediction: FullPrediction): {
  label: "home" | "draw" | "away";
  value: number;
} {
  const { homeWin, draw, awayWin } = prediction.outcome;
  const max = Math.max(homeWin, draw, awayWin);

  if (max === homeWin) return { label: "home", value: homeWin };
  if (max === awayWin) return { label: "away", value: awayWin };
  return { label: "draw", value: draw };
}

// ─────────────────────────────────────────────────────────────
//  🧹 CACHE MANAGEMENT
//  ─────────────────────────────────────────────────────────────

export function clearPredictorCache(): void {
  cache.clear();
}

export function getPredictorCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}

// ═══════════════════════════════════════════════════════════════
//  LOCALE-AWARE REASONING
// ═══════════════════════════════════════════════════════════════

function getLocaleReasoning(locale: "ka" | "en" | "ru"): string {
  if (locale === "ka") {
    return "პროგნოზი გაკეთებულია გუნდების ფორმის, საშუალო გოლებისა და სახლის უპირატესობის მიხედვით.";
  }
  if (locale === "ru") {
    return "Прогноз основан на форме команд, средних голах и преимуществе дома.";
  }
  return "Prediction based on team form, average goals, and home advantage.";
}