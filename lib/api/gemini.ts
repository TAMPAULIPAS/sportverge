// ═══════════════════════════════════════════════════════════════
//  SportVerge — Google Gemini AI Integration v2
//  ─────────────────────────────────────────────────────────────
//  🔑 Free API: https://aistudio.google.com/apikey
//  🤖 Model:    gemini-flash-latest (fast + smart)
//  📚 Docs:     https://ai.google.dev/api/generate-content
//
//  🎯 Features:
//     - Match outcome prediction (win/draw/loss)
//     - Live next-event prediction
//     - Match summary generation
//     - Multi-language translation (ka/en/ru)
//     - Batch translation
//     - "Two Sides" comment analysis
//     - News summarization
//     - Health check
//
//  ✨ Enhancements:
//     - X-goog-api-key header (new API format)
//     - Retry with exponential backoff
//     - In-memory cache (5 min)
//     - JSON mode with auto-repair
//     - Timeout handling (25s)
//     - Graceful degradation
//     - Detailed error logging
//     - Full TypeScript types
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  ⚙️ CONFIG
//  ─────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DEFAULT_TIMEOUT = 25_000;
const MAX_RETRIES = 2;
const CACHE_TTL = 5 * 60 * 1000; // 5 წუთი

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
//  ─────────────────────────────────────────────────────────────

type Locale = "ka" | "en" | "ru";

interface GeminiRequest {
  contents: Array<{
    role?: "user" | "model";
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

interface CallOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  jsonMode?: boolean;
}

export interface WinPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  reason: string;
  confidence: "low" | "medium" | "high";
}

export interface NextEventPrediction {
  probability: number;
  eventType: "goal" | "corner" | "card" | "substitution";
  team: "home" | "away";
  reasoning: string;
}

export interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
}

export interface TwoSidesAnalysis {
  neutralSummary: string;
  homeSentiment: string;
  awaySentiment: string;
}

// ─────────────────────────────────────────────────────────────
//  💾 IN-MEMORY CACHE
//  ─────────────────────────────────────────────────────────────

interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function hashKey(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36) + ":" + input.length.toString(36);
}

function getCached(key: string): string | null | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached(key: string, value: string | null): void {
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
}

// ─────────────────────────────────────────────────────────────
//  🛠️ HELPERS
//  ─────────────────────────────────────────────────────────────

/** ამოიღებს სუფთა JSON-ს მოდელის პასუხიდან (```json ... ``` ბლოკების გარეშე) */
function extractJson(text: string): string {
  let s = text.trim();

  // Remove markdown code fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Find first { ... last }
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }

  return s.trim();
}

/** უსაფრთხო JSON parse — თუ ვერ მოხერხდა, null */
function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(extractJson(text)) as T;
  } catch (err) {
    console.error("[Gemini] JSON parse failed:", err);
    return null;
  }
}

function languageInstruction(locale: Locale): string {
  const map: Record<Locale, string> = {
    ka: "უპასუხე ქართულ ენაზე.",
    en: "Respond in English.",
    ru: "Отвечай на русском языке.",
  };
  return map[locale];
}

// ─────────────────────────────────────────────────────────────
//  🎯 CORE: callGemini()
//  ─────────────────────────────────────────────────────────────

async function callGeminiOnce(
  prompt: string,
  options: CallOptions
): Promise<{ text: string | null; retryable: boolean }> {
  if (!GEMINI_API_KEY) {
    console.warn("[Gemini] GEMINI_API_KEY not configured");
    return { text: null, retryable: false };
  }

  const body: GeminiRequest = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 1024,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      ...(options.jsonMode && { responseMimeType: "application/json" }),
    },
    ...(options.systemInstruction && {
      systemInstruction: { parts: [{ text: options.systemInstruction }] },
    }),
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY, // ✅ ახალი auth ფორმატი
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    // ─── Retryable errors (5xx, 429) ───
    if (res.status === 429 || res.status >= 500) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Gemini] Retryable error ${res.status}:`, errText.slice(0, 200));
      return { text: null, retryable: true };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Gemini] ${res.status} ${res.statusText}:`, errText.slice(0, 300));
      return { text: null, retryable: false };
    }

    const data: GeminiResponse = await res.json();

    if (data.error) {
      console.error("[Gemini] API error:", data.error);
      return { text: null, retryable: data.error.code === 429 || data.error.code >= 500 };
    }

    if (data.promptFeedback?.blockReason) {
      console.warn("[Gemini] Prompt blocked:", data.promptFeedback.blockReason);
      return { text: null, retryable: false };
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.warn("[Gemini] No candidates in response");
      return { text: null, retryable: false };
    }

    if (candidate.finishReason === "SAFETY") {
      console.warn("[Gemini] Response blocked by safety filter");
      return { text: null, retryable: false };
    }

    const text = candidate.content?.parts?.[0]?.text ?? null;
    return { text, retryable: false };
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.error(`[Gemini] ${isAbort ? "Timeout" : "Fetch error"}:`, err);
    return { text: null, retryable: isAbort };
  }
}

async function callGemini(
  prompt: string,
  options: CallOptions = {}
): Promise<string | null> {
  // Cache check (only if not JSON mode — JSON responses may vary)
  const key = !options.jsonMode ? hashKey(prompt + JSON.stringify(options)) : "";
  if (key) {
    const cached = getCached(key);
    if (cached !== undefined) return cached;
  }

  let attempt = 0;
  let lastResult: string | null = null;

  while (attempt <= MAX_RETRIES) {
    const { text, retryable } = await callGeminiOnce(prompt, options);

    if (text !== null) {
      lastResult = text;
      break;
    }

    if (!retryable) break;

    attempt++;
    if (attempt <= MAX_RETRIES) {
      const delay = 500 * Math.pow(2, attempt - 1);
      console.log(`[Gemini] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  if (key && lastResult !== null) setCached(key, lastResult);
  return lastResult;
}

// ─────────────────────────────────────────────────────────────
//  ⚽ 1. MATCH OUTCOME PREDICTION
//  ─────────────────────────────────────────────────────────────

export async function predictMatchOutcome(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeForm?: string[];
  awayForm?: string[];
  homeGoalsAvg?: number;
  awayGoalsAvg?: number;
  h2h?: string;
  locale?: Locale;
}): Promise<WinPrediction | null> {
  const {
    homeTeam,
    awayTeam,
    league,
    homeForm = [],
    awayForm = [],
    homeGoalsAvg,
    awayGoalsAvg,
    h2h,
    locale = "ka",
  } = params;

  const prompt = `You are a professional sports analytics AI. Analyze the following football match and predict outcome probabilities.

MATCH: ${homeTeam} vs ${awayTeam}
LEAGUE: ${league}
HOME FORM (last 5): ${homeForm.join(", ") || "unknown"}
AWAY FORM (last 5): ${awayForm.join(", ") || "unknown"}
HOME GOALS AVG: ${homeGoalsAvg ?? "unknown"}
AWAY GOALS AVG: ${awayGoalsAvg ?? "unknown"}
HEAD-TO-HEAD: ${h2h || "no data"}

INSTRUCTIONS:
1. Predict win probabilities as integers summing exactly to 100
2. Provide 2-3 sentences of reasoning
3. Rate confidence: low, medium, or high
${languageInstruction(locale)}

Return ONLY valid JSON:
{
  "homeWin": 45,
  "draw": 30,
  "awayWin": 25,
  "reason": "explanation here",
  "confidence": "medium"
}`;

  const result = await callGemini(prompt, {
    systemInstruction:
      "You are a professional sports analytics AI. Always respond with valid JSON only, no markdown.",
    temperature: 0.4,
    maxOutputTokens: 500,
    jsonMode: true,
  });

  if (!result) return null;

  const parsed = safeJsonParse<WinPrediction>(result);
  if (!parsed) return null;

  // Validation
  if (
    typeof parsed.homeWin !== "number" ||
    typeof parsed.draw !== "number" ||
    typeof parsed.awayWin !== "number"
  ) {
    return null;
  }

  // Normalize to sum 100
  const total = parsed.homeWin + parsed.draw + parsed.awayWin;
  if (total !== 100 && total > 0) {
    parsed.homeWin = Math.round((parsed.homeWin / total) * 100);
    parsed.draw = Math.round((parsed.draw / total) * 100);
    parsed.awayWin = 100 - parsed.homeWin - parsed.draw;
  }

  // Clamp
  parsed.homeWin = Math.max(0, Math.min(100, parsed.homeWin));
  parsed.draw = Math.max(0, Math.min(100, parsed.draw));
  parsed.awayWin = Math.max(0, Math.min(100, parsed.awayWin));

  // Confidence fallback
  if (!["low", "medium", "high"].includes(parsed.confidence)) {
    parsed.confidence = "medium";
  }

  return parsed;
}

// ─────────────────────────────────────────────────────────────
//  ⚡ 2. NEXT EVENT PREDICTION (LIVE)
//  ─────────────────────────────────────────────────────────────

export async function predictNextEvent(params: {
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
  locale?: Locale;
}): Promise<NextEventPrediction | null> {
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

  const prompt = `You are a live sports analytics AI. Predict the next significant event.

MATCH: ${homeTeam} ${scoreHome} - ${scoreAway} ${awayTeam}
CURRENT MINUTE: ${currentMinute}'
RECENT EVENTS: ${recentEvents.join(" | ") || "none"}
STATS: ${
    stats
      ? `Possession ${stats.possessionHome}%-${stats.possessionAway}%, Shots ${stats.shotsHome}-${stats.shotsAway}`
      : "no data"
  }

INSTRUCTIONS:
1. Predict which team triggers the next event in the next 15 minutes
2. Give probability (0-100)
3. Event type: goal, corner, card, or substitution
4. Short reasoning (1-2 sentences)
${languageInstruction(locale)}

Return ONLY valid JSON:
{
  "probability": 78,
  "eventType": "goal",
  "team": "home",
  "reasoning": "short explanation"
}`;

  const result = await callGemini(prompt, {
    systemInstruction:
      "You are a live sports analytics AI. Always respond with valid JSON only.",
    temperature: 0.5,
    maxOutputTokens: 300,
    jsonMode: true,
  });

  if (!result) return null;

  const parsed = safeJsonParse<NextEventPrediction>(result);
  if (!parsed) return null;

  // Validate
  if (!["goal", "corner", "card", "substitution"].includes(parsed.eventType)) {
    parsed.eventType = "goal";
  }
  if (!["home", "away"].includes(parsed.team)) {
    parsed.team = "home";
  }
  parsed.probability = Math.max(0, Math.min(100, parsed.probability || 50));

  return parsed;
}

// ─────────────────────────────────────────────────────────────
//  📰 3. MATCH SUMMARY
//  ─────────────────────────────────────────────────────────────

export async function summarizeMatch(params: {
  homeTeam: string;
  awayTeam: string;
  scoreHome: number;
  scoreAway: number;
  events?: string[];
  stats?: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
  };
  locale?: Locale;
}): Promise<AISummaryResponse | null> {
  const {
    homeTeam,
    awayTeam,
    scoreHome,
    scoreAway,
    events = [],
    stats,
    locale = "ka",
  } = params;

  const prompt = `You are a sports journalist AI. Write a concise match summary.

FINAL SCORE: ${homeTeam} ${scoreHome} - ${scoreAway} ${awayTeam}
KEY EVENTS: ${events.join(" | ") || "no events"}
STATS: ${
    stats
      ? `Possession ${stats.possession.home}%-${stats.possession.away}%, Shots ${stats.shots.home}-${stats.shots.away}`
      : "no data"
  }

INSTRUCTIONS:
1. Write 2-3 sentence summary
2. List 3 key takeaways as bullet points
${languageInstruction(locale)}

Return ONLY valid JSON:
{
  "summary": "text here",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

  const result = await callGemini(prompt, {
    systemInstruction:
      "You are a sports journalist AI. Always respond with valid JSON only.",
    temperature: 0.6,
    maxOutputTokens: 500,
    jsonMode: true,
  });

  if (!result) return null;

  const parsed = safeJsonParse<AISummaryResponse>(result);
  if (!parsed || !parsed.summary) return null;

  if (!Array.isArray(parsed.keyPoints)) parsed.keyPoints = [];
  parsed.keyPoints = parsed.keyPoints.slice(0, 5);

  return parsed;
}

// ─────────────────────────────────────────────────────────────
//  🌐 4. TRANSLATE SINGLE TEXT
//  ─────────────────────────────────────────────────────────────

export async function translateText(
  text: string,
  targetLocale: Locale
): Promise<string | null> {
  const languageName = { ka: "Georgian", en: "English", ru: "Russian" }[targetLocale];

  const prompt = `Translate the following sports text to ${languageName}. Keep sports terminology accurate and natural.

Return ONLY the translated text, no explanations, no quotes.

TEXT:
${text}`;

  const result = await callGemini(prompt, {
    temperature: 0.2,
    maxOutputTokens: 1200,
  });

  if (!result) return null;

  // Strip any accidental wrapping quotes
  return result.trim().replace(/^["']|["']$/g, "");
}

// ─────────────────────────────────────────────────────────────
//  🌐 5. BATCH TRANSLATION
//  ─────────────────────────────────────────────────────────────

export async function translateBatch(
  items: Record<string, string>,
  targetLocale: Locale
): Promise<Record<string, string> | null> {
  const languageName = { ka: "Georgian", en: "English", ru: "Russian" }[targetLocale];

  const prompt = `Translate the following JSON values to ${languageName}. Keep the same JSON keys and structure. Return ONLY valid JSON, no explanations.

INPUT JSON:
${JSON.stringify(items, null, 2)}`;

  const result = await callGemini(prompt, {
    systemInstruction:
      "You are a professional translator. Always respond with valid JSON only, preserving keys exactly.",
    temperature: 0.2,
    maxOutputTokens: 2500,
    jsonMode: true,
  });

  if (!result) return null;

  return safeJsonParse<Record<string, string>>(result);
}

// ─────────────────────────────────────────────────────────────
//  🥊 6. TWO SIDES ANALYSIS
//  ─────────────────────────────────────────────────────────────

export async function summarizeTwoSides(params: {
  homeTeam: string;
  awayTeam: string;
  homeComments: string[];
  awayComments: string[];
  locale?: Locale;
}): Promise<TwoSidesAnalysis | null> {
  const { homeTeam, awayTeam, homeComments, awayComments, locale = "ka" } = params;

  const prompt = `You are a neutral sports analyst. Analyze fan comments from both sides.

MATCH: ${homeTeam} vs ${awayTeam}

${homeTeam.toUpperCase()} FANS:
${homeComments.slice(0, 15).join("\n") || "(no comments)"}

${awayTeam.toUpperCase()} FANS:
${awayComments.slice(0, 15).join("\n") || "(no comments)"}

INSTRUCTIONS:
1. Write neutral summary of the fan discussion (2-3 sentences)
2. Describe each side's sentiment in 1 short sentence
${languageInstruction(locale)}

Return ONLY valid JSON:
{
  "neutralSummary": "text",
  "homeSentiment": "text",
  "awaySentiment": "text"
}`;

  const result = await callGemini(prompt, {
    systemInstruction:
      "You are a neutral sports analyst. Always respond with valid JSON only.",
    temperature: 0.6,
    maxOutputTokens: 500,
    jsonMode: true,
  });

  if (!result) return null;

  return safeJsonParse<TwoSidesAnalysis>(result);
}

// ─────────────────────────────────────────────────────────────
//  📰 7. NEWS SUMMARIZATION
//  ─────────────────────────────────────────────────────────────

export async function summarizeNews(
  articleText: string,
  locale: Locale = "ka"
): Promise<string | null> {
  const prompt = `Summarize the following sports news article in 3-4 sentences. Focus on key facts, names, numbers, and outcomes.

ARTICLE:
${articleText.slice(0, 3000)}

${languageInstruction(locale)}`;

  const result = await callGemini(prompt, {
    temperature: 0.5,
    maxOutputTokens: 400,
  });

  return result?.trim() || null;
}

// ─────────────────────────────────────────────────────────────
//  👤 8. PLAYER / TEAM BIOGRAPHY
//  ─────────────────────────────────────────────────────────────

export async function generateBiography(params: {
  name: string;
  type: "player" | "team";
  facts?: string[];
  locale?: Locale;
}): Promise<string | null> {
  const { name, type, facts = [], locale = "ka" } = params;

  const prompt = `Write a short, engaging biography (4-5 sentences) about this sports ${type}.

NAME: ${name}
KNOWN FACTS: ${facts.join("; ") || "use your knowledge"}

${languageInstruction(locale)}`;

  const result = await callGemini(prompt, {
    temperature: 0.7,
    maxOutputTokens: 400,
  });

  return result?.trim() || null;
}

// ─────────────────────────────────────────────────────────────
//  🏥 9. HEALTH CHECK
//  ─────────────────────────────────────────────────────────────

export async function checkGeminiHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();

  if (!GEMINI_API_KEY) {
    return { ok: false, latencyMs: 0, error: "GEMINI_API_KEY not set" };
  }

  try {
    const result = await callGemini("Reply with only the word: OK", {
      maxOutputTokens: 10,
      temperature: 0,
    });

    const ok = !!result && result.toUpperCase().includes("OK");
    return {
      ok,
      latencyMs: Date.now() - start,
      error: ok ? undefined : "Unexpected response",
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  🧹 10. CACHE MANAGEMENT
//  ─────────────────────────────────────────────────────────────

export function clearGeminiCache(): void {
  cache.clear();
}

export function getGeminiCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}