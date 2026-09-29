// TODO: lib\api\index.ts
// ═══════════════════════════════════════════════════════════════
//  SportVerge — API Barrel Export
//  ყველა API ფუნქცია ერთი ადგილიდან
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// TheSportsDB — მატჩები, გუნდები, მოთამაშეები
// ─────────────────────────────────────────────
export {
  getAllLeagues,
  getPastLeagueEvents,
  getNextLeagueEvents,
  getLiveScores,
  getEventById,
  searchTeam,
  getTeamById,
  getLeagueTable,
  getTeamLastEvents,
  getTeamNextEvents,
  getTeamPlayers,
  getPlayerById,
  getLeagueSeasonEvents,
  getMatchStatus,
  formatEventDate,
  formatScore,
  getTeamLogo,
  getEventBanner,
  POPULAR_LEAGUES,
  GEORGIAN_TEAMS,
  type SportsDBTeam,
  type SportsDBEvent,
  type SportsDBLeague,
  type SportsDBPlayer,
} from './sportsdb';

// ─────────────────────────────────────────────
// NewsAPI — სიახლეები
// ─────────────────────────────────────────────
export {
  getSportsNews,
  getTopHeadlines,
  getNewsByTopic,
  getTeamNews,
  getPlayerNews,
  categorizeArticle,
  getArticleImage,
  getReadTime,
  getArticleId,
  getArticleSlug,
  getAllSportsNews,
  SPORT_QUERIES,
  type NewsArticle,
  type NewsResponse,
  type NewsCategory,
} from './news';

// ─────────────────────────────────────────────
// YouTube — ვიდეოები
// ─────────────────────────────────────────────
export {
  getChannelVideos,
  searchVideos,
  getVideoById,
  getMatchHighlights,
  getTeamHighlights,
  getTrendingSportsVideos,
  parseISODuration,
  formatDuration,
  formatViewCount,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  type YouTubeVideo,
  type YouTubeSearchResult,
} from './youtube';

// ─────────────────────────────────────────────
// Google Gemini — AI ფუნქციები
// ─────────────────────────────────────────────
export {
  predictMatchOutcome,
  predictNextEvent,
  summarizeMatch,
  translateText,
  translateBatch,
  summarizeTwoSides,
  summarizeNews,
  checkGeminiHealth,
  type WinPrediction,
  type NextEventPrediction,
  type AISummaryResponse,
} from './gemini';