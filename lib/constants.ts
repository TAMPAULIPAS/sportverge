// ═══════════════════════════════════════════════════════════════
//  SportVerge — Global Constants
//  ─────────────────────────────────────────────────────────────
//  🎯 ყველა კონსტანტა ერთ ადგილას. თუ სადმე ცვლილება გჭირდება,
//     აქ შეცვალე და მთელ პროექტში აისახება.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  📱 APP INFO
// ─────────────────────────────────────────────────────────────

export const APP = {
  name: "SportVerge",
  tagline: {
    ka: "სადაც სპორტი კიდეს ხვდება",
    en: "Where sport meets the edge",
    ru: "Там, где спорт встречает край",
  },
  description: {
    ka: "AI-ზე დაფუძნებული სპორტის სიახლეები, ლაივ ანგარიშები და პროგნოზები.",
    en: "AI-powered sports news, live scores, and predictions.",
    ru: "Спортивные новости, лайв-счета и прогнозы на базе ИИ.",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  twitter: "@sportverge",
  version: "1.0.0",
} as const;

// ─────────────────────────────────────────────────────────────
//  🌍 LANGUAGES / LOCALES
// ─────────────────────────────────────────────────────────────

export const LOCALES = ["ka", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ka";

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string; short: string }> = {
  ka: { name: "ქართული", flag: "🇬🇪", short: "KA" },
  en: { name: "English", flag: "🇬🇧", short: "EN" },
  ru: { name: "Русский", flag: "🇷🇺", short: "RU" },
};

// ─────────────────────────────────────────────────────────────
//  ⚽ SPORTS CATEGORIES
// ─────────────────────────────────────────────────────────────

export const SPORTS = [
  { id: "football", emoji: "⚽", name: { ka: "ფეხბურთი", en: "Football", ru: "Футбол" } },
  { id: "basketball", emoji: "🏀", name: { ka: "კალათბურთი", en: "Basketball", ru: "Баскетбол" } },
  { id: "tennis", emoji: "🎾", name: { ka: "ტენისი", en: "Tennis", ru: "Теннис" } },
  { id: "f1", emoji: "🏎️", name: { ka: "ფორმულა 1", en: "Formula 1", ru: "Формула 1" } },
  { id: "ufc", emoji: "🥊", name: { ka: "UFC", en: "UFC", ru: "UFC" } },
  { id: "other", emoji: "🎯", name: { ka: "სხვა", en: "Other", ru: "Другое" } },
] as const;

export type SportId = (typeof SPORTS)[number]["id"];

// ─────────────────────────────────────────────────────────────
//  🏆 LEAGUES (TheSportsDB IDs)
// ─────────────────────────────────────────────────────────────

export const LEAGUES = {
  // Football
  PREMIER_LEAGUE: { id: "4328", name: "Premier League", country: "England" },
  LA_LIGA: { id: "4335", name: "La Liga", country: "Spain" },
  SERIE_A: { id: "4332", name: "Serie A", country: "Italy" },
  BUNDESLIGA: { id: "4331", name: "Bundesliga", country: "Germany" },
  LIGUE_1: { id: "4334", name: "Ligue 1", country: "France" },
  CHAMPIONS_LEAGUE: { id: "4480", name: "UEFA Champions League", country: "Europe" },
  EUROPA_LEAGUE: { id: "4481", name: "UEFA Europa League", country: "Europe" },
  EROVNULI_LIGA: { id: "4667", name: "Erovnuli Liga", country: "Georgia" },
  // Basketball
  NBA: { id: "4387", name: "NBA", country: "USA" },
  EUROLEAGUE: { id: "4546", name: "EuroLeague", country: "Europe" },
} as const;

/**
 * Alias lowercase key-ებით — ძველი კოდის თავსებადობისთვის.
 * მაგ: POPULAR_LEAGUES.premierLeague.id → "4328"
 */
export const POPULAR_LEAGUES = {
  // Football
  premierLeague: LEAGUES.PREMIER_LEAGUE,
  laLiga: LEAGUES.LA_LIGA,
  serieA: LEAGUES.SERIE_A,
  bundesliga: LEAGUES.BUNDESLIGA,
  ligue1: LEAGUES.LIGUE_1,
  championsLeague: LEAGUES.CHAMPIONS_LEAGUE,
  europaLeague: LEAGUES.EUROPA_LEAGUE,
  erovnuliLiga: LEAGUES.EROVNULI_LIGA,
  // Basketball
  nba: LEAGUES.NBA,
  euroleague: LEAGUES.EUROLEAGUE,
} as const;

// ─────────────────────────────────────────────────────────────
//  🎯 MATCH STATUS
// ─────────────────────────────────────────────────────────────

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  HALF_TIME: "halftime",
  FINISHED: "finished",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
} as const;

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export const MATCH_STATUS_LABELS: Record<
  MatchStatus,
  { ka: string; en: string; ru: string; color: string }
> = {
  scheduled: { ka: "დაგეგმილი", en: "Scheduled", ru: "Запланирован", color: "text-slate-400" },
  live: { ka: "ლაივი", en: "LIVE", ru: "ЛАЙВ", color: "text-red-500" },
  halftime: { ka: "შესვენება", en: "HT", ru: "ПЕРЕРЫВ", color: "text-amber-500" },
  finished: { ka: "დასრულდა", en: "FT", ru: "ЗАВЕРШЁН", color: "text-slate-500" },
  postponed: { ka: "გადავადდა", en: "Postponed", ru: "Отложен", color: "text-orange-500" },
  cancelled: { ka: "გაუქმდა", en: "Cancelled", ru: "Отменён", color: "text-red-700" },
};

// ─────────────────────────────────────────────────────────────
//  🔮 PREDICTION
//  ─────────────────────────────────────────────────────────────

export const PREDICTION = {
  HOME_WIN: "home",
  DRAW: "draw",
  AWAY_WIN: "away",
} as const;

export type PredictionChoice = (typeof PREDICTION)[keyof typeof PREDICTION];

export const PREDICTION_LABELS: Record<
  PredictionChoice,
  { ka: string; en: string; ru: string; emoji: string }
> = {
  home: { ka: "მასპინძელი იმარჯვებს", en: "Home Win", ru: "Победа хозяев", emoji: "🏠" },
  draw: { ka: "ფრე", en: "Draw", ru: "Ничья", emoji: "🤝" },
  away: { ka: "სტუმარი იმარჯვებს", en: "Away Win", ru: "Победа гостей", emoji: "✈️" },
};

// ─────────────────────────────────────────────────────────────
//  🏅 ACHIEVEMENT BADGES
// ─────────────────────────────────────────────────────────────

export const BADGES = {
  PROPHET: {
    id: "prophet",
    emoji: "🔮",
    name: { ka: "წინასწარმეტყველი", en: "Prophet", ru: "Пророк" },
    description: { ka: "5 ზედიზედ სწორი პროგნოზი", en: "5 correct predictions in a row", ru: "5 верных прогнозов подряд" },
    color: "#D9F99D",
  },
  SNIPER: {
    id: "sniper",
    emoji: "🎯",
    name: { ka: "სნაიპერი", en: "Sniper", ru: "Снайпер" },
    description: { ka: "20 სწორი პროგნოზი სულ", en: "20 total correct predictions", ru: "20 верных прогнозов всего" },
    color: "#14B8A6",
  },
  STREAK_MASTER: {
    id: "streak-master",
    emoji: "🔥",
    name: { ka: "სტრიქის მაესტრო", en: "Streak Master", ru: "Мастер серии" },
    description: { ka: "10 ზედიზედ სწორი", en: "10 in a row correct", ru: "10 подряд верных" },
    color: "#EF4444",
  },
  LEGEND: {
    id: "legend",
    emoji: "👑",
    name: { ka: "ლეგენდა", en: "Legend", ru: "Легенда" },
    description: { ka: "50 სწორი პროგნოზი", en: "50 correct predictions", ru: "50 верных прогнозов" },
    color: "#FBBF24",
  },
  ROOKIE: {
    id: "rookie",
    emoji: "🌱",
    name: { ka: "ახალბედა", en: "Rookie", ru: "Новичок" },
    description: { ka: "პირველი პროგნოზი", en: "First prediction", ru: "Первый прогноз" },
    color: "#22C55E",
  },
} as const;

export type BadgeId = keyof typeof BADGES;

// ─────────────────────────────────────────────────────────────
//  🧭 ROUTES
// ─────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  MATCHES: "/matches",
  NEWS: "/news",
  VIDEOS: "/videos",
  TEAMS: "/teams",
  PLAYERS: "/players",
  PREDICTIONS: "/predictions",
  LEADERBOARD: "/leaderboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ANALYTICS: "/analytics",
  AUTHORIZATION: "/authorization",
} as const;

/** Protected routes — user უნდა იყოს ავტორიზებული */
export const PROTECTED_ROUTES: string[] = [
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
];

/** Auth routes — ავტორიზებული user აქ არ უნდა მოხვდეს */
export const AUTH_ROUTES: string[] = [ROUTES.AUTHORIZATION];

// ─────────────────────────────────────────────────────────────
//  📰 NEWS CATEGORIES
//  ─────────────────────────────────────────────────────────────

export const NEWS_CATEGORIES = [
  { id: "football", name: { ka: "ფეხბურთი", en: "Football", ru: "Футбол" } },
  { id: "basketball", name: { ka: "კალათბურთი", en: "Basketball", ru: "Баскетбол" } },
  { id: "tennis", name: { ka: "ტენისი", en: "Tennis", ru: "Теннис" } },
  { id: "f1", name: { ka: "F1", en: "F1", ru: "F1" } },
  { id: "ufc", name: { ka: "UFC", en: "UFC", ru: "UFC" } },
  { id: "transfers", name: { ka: "ტრანსფერები", en: "Transfers", ru: "Трансферы" } },
  { id: "other", name: { ka: "სხვა", en: "Other", ru: "Другое" } },
] as const;

export type NewsCategoryId = (typeof NEWS_CATEGORIES)[number]["id"];

// ─────────────────────────────────────────────────────────────
//  ⏱️ CACHE / REVALIDATE (seconds)
//  ─────────────────────────────────────────────────────────────

export const CACHE_TIME = {
  LIVE_SCORES: 30,        // 30 წამი — live მატჩები
  MATCHES: 60 * 5,        // 5 წუთი
  NEWS: 60 * 15,          // 15 წუთი
  VIDEOS: 60 * 60,        // 1 საათი
  TEAMS: 60 * 60 * 6,     // 6 საათი
  PLAYERS: 60 * 60 * 6,   // 6 საათი
  PREDICTIONS: 60 * 30,   // 30 წუთი
  STATIC: 60 * 60 * 24,   // 24 საათი
} as const;

// ─────────────────────────────────────────────────────────────
//  📊 PAGINATION
//  ─────────────────────────────────────────────────────────────

export const PAGINATION = {
  NEWS_PER_PAGE: 12,
  MATCHES_PER_PAGE: 20,
  VIDEOS_PER_PAGE: 12,
  LEADERBOARD_PER_PAGE: 50,
  COMMENTS_PER_PAGE: 20,
  MAX_COMMENT_LENGTH: 500,
} as const;

// ─────────────────────────────────────────────────────────────
//  🎨 THEME / BRAND COLORS
//  ─────────────────────────────────────────────────────────────

export const COLORS = {
  bgPrimary: "#0A0F1C",
  bgCard: "#111827",
  bgCardHover: "#1E293B",
  border: "#1F2937",
  lime: "#D9F99D",
  teal: "#14B8A6",
  red: "#EF4444",
  gold: "#FBBF24",
  textPrimary: "#F8FAFC",
  textMuted: "#94A3B8",
  textDisabled: "#475569",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

// ─────────────────────────────────────────────────────────────
//  🔗 EXTERNAL APIs
//  ─────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  THESPORTSDB: "https://www.thesportsdb.com/api/v1/json",
  NEWSAPI: "https://newsapi.org/v2",
  GEMINI: "https://generativelanguage.googleapis.com/v1beta",
  YOUTUBE: "https://www.googleapis.com/youtube/v3",
} as const;

// ─────────────────────────────────────────────────────────────
//  🚦 API STATUS CODES
//  ─────────────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
} as const;

// ─────────────────────────────────────────────────────────────
//  🎬 ANIMATION TIMING (ms)
//  ─────────────────────────────────────────────────────────────

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  STAGGER: 50,
  PULSE: 2000,
} as const;

// ─────────────────────────────────────────────────────────────
//  📱 BREAKPOINTS (px) — Tailwind-ის დეფოლტებთან თანხვედრილი
//  ─────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

// ─────────────────────────────────────────────────────────────
//  🔧 HELPER FUNCTIONS
//  ─────────────────────────────────────────────────────────────

/** აბრუნებს სპორტის სახელს ID-ის მიხედვით */
export function getSportName(id: string, locale: Locale): string {
  const sport = SPORTS.find((s) => s.id === id);
  return sport?.name[locale] ?? id;
}

/** აბრუნებს badge-ის ობიექტს ID-ის მიხედვით */
export function getBadge(id: BadgeId) {
  return BADGES[id];
}

/** აბრუნებს match status-ის ლეიბლს */
export function getMatchStatusLabel(status: MatchStatus, locale: Locale): string {
  return MATCH_STATUS_LABELS[status]?.[locale] ?? status;
}

/** ამოწმებს route დაცულია თუ არა */
export function isProtectedRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(ka|en|ru)/, "");
  return PROTECTED_ROUTES.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
}

/** ამოწმებს route auth გვერდია თუ არა */
export function isAuthRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(ka|en|ru)/, "");
  return AUTH_ROUTES.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
}