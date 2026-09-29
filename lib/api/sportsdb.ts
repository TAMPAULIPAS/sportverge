// ═══════════════════════════════════════════════════════════════
//  SportVerge — TheSportsDB Integration v2
//  ─────────────────────────────────────────────────────────────
//  🔗 Free v1 API — key "3" (test key)
//  📚 Docs: https://www.thesportsdb.com/free_sports_api
//
//  🎯 Coverage:
//     - Live scores (real-time)
//     - Fixtures (next / past / season)
//     - League tables & standings
//     - Team profiles + badges
//     - Player profiles + photos
//     - Event timeline (goals, cards, subs)
//     - Match statistics
//     - Lineups & formations
//     - Search (team / player / league / event)
//     - TV broadcasts
//     - Venue info
//     - Leagues, sports, countries
//
//  ✨ Features:
//     - In-memory cache (30s - 1h by endpoint)
//     - Retry with exponential backoff
//     - Deduplication across calls
//     - Badge/logo URL helpers with fallback
//     - Sport type mapping (Soccer → football)
//     - Georgian teams support
//     - Formatted standings (rank, points, GD)
//     - Live status normalization
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  ⚙️ CONFIG
// ─────────────────────────────────────────────────────────────

const API_KEY = process.env.THESPORTSDB_API_KEY ?? "3";
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 2;

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
//  ─────────────────────────────────────────────────────────────

export interface SportsDBEvent {
  idEvent: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intHomeScoreHT?: string | null;
  intAwayScoreHT?: string | null;
  strStatus: string | null;
  strProgress: string | null;
  strLeague: string;
  idLeague: string;
  strSport?: string;
  dateEvent: string;
  strTime: string | null;
  strTimestamp?: string | null;
  strVenue: string | null;
  strCity: string | null;
  strCountry?: string | null;
  strThumb?: string | null;
  strVideo?: string | null;
  intRound: string | null;
  strSeason?: string;
  strDescriptionEN?: string | null;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  strHomeTeamLogo?: string | null;
  strAwayTeamLogo?: string | null;
  strHomeFormation?: string | null;
  strAwayFormation?: string | null;
  strHomeGoalDetails?: string | null;
  strAwayGoalDetails?: string | null;
  strHomeLineupGoalkeeper?: string | null;
  strAwayLineupGoalkeeper?: string | null;
  strHomeLineupDefense?: string | null;
  strAwayLineupDefense?: string | null;
  strHomeLineupMidfield?: string | null;
  strAwayLineupMidfield?: string | null;
  strHomeLineupForward?: string | null;
  strAwayLineupForward?: string | null;
  strHomeLineupSubstitutes?: string | null;
  strAwayLineupSubstitutes?: string | null;
  strHomeYellowCards?: string | null;
  strAwayYellowCards?: string | null;
  strHomeRedCards?: string | null;
  strAwayRedCards?: string | null;
  intHomeShots?: string | null;
  intAwayShots?: string | null;
  intHomeShotsOnTarget?: string | null;
  intAwayShotsOnTarget?: string | null;
  intHomePossession?: string | null;
  intAwayPossession?: string | null;
  intHomeFouls?: string | null;
  intAwayFouls?: string | null;
  intHomeCorners?: string | null;
  intAwayCorners?: string | null;
  intHomeOffsides?: string | null;
  intAwayOffsides?: string | null;
  strHomeTeamScore?: string | null;
  strAwayTeamScore?: string | null;
  strTVStation?: string | null;
}

export interface SportsDBTeam {
  idTeam: string;
  idESPN?: string | null;
  idAPIfootball?: string | null;
  strTeam: string;
  strTeamShort?: string | null;
  strAlternate?: string | null;
  intFormedYear?: string | null;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strLeague2?: string | null;
  strLeague3?: string | null;
  strStadium: string | null;
  strStadiumThumb?: string | null;
  strStadiumDescription?: string | null;
  strStadiumLocation?: string | null;
  intStadiumCapacity?: string | null;
  strWebsite?: string | null;
  strFacebook?: string | null;
  strTwitter?: string | null;
  strInstagram?: string | null;
  strDescriptionEN?: string | null;
  strDescriptionKA?: string | null;
  strDescriptionRU?: string | null;
  strCountry: string;
  strTeamBadge: string | null;
  strTeamLogo: string | null;
  strTeamJersey?: string | null;
  strTeamBanner?: string | null;
  strTeamFanart1?: string | null;
  strTeamFanart2?: string | null;
  strTeamFanart3?: string | null;
  strTeamFanart4?: string | null;
  strYoutube?: string | null;
}

export interface SportsDBPlayer {
  idPlayer: string;
  idTeam: string;
  strPlayer: string;
  strTeam: string;
  strSport: string;
  strThumb: string | null;
  strCutout: string | null;
  strRender?: string | null;
  strBanner?: string | null;
  strNationality: string;
  dateBorn: string | null;
  strBirthLocation?: string | null;
  strStatus?: string | null;
  strDescriptionEN: string | null;
  strGender: string | null;
  strSide?: string | null;
  strPosition: string | null;
  strNumber?: string | null;
  strHeight?: string | null;
  strWeight?: string | null;
  intLoved?: string | null;
  strWage?: string | null;
  strOutfitter?: string | null;
  strAgent?: string | null;
  strSigning?: string | null;
  strFormerTeams?: string | null;
  strInstagram?: string | null;
  strTwitter?: string | null;
  strYoutube?: string | null;
}

export interface SportsDBLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate?: string | null;
  intDivision?: string | null;
  idCup?: string | null;
  strCurrentSeason?: string | null;
  intFormedYear?: string | null;
  dateFirstEvent?: string | null;
  strGender?: string | null;
  strCountry?: string | null;
  strWebsite?: string | null;
  strFacebook?: string | null;
  strTwitter?: string | null;
  strYoutube?: string | null;
  strDescriptionEN?: string | null;
  strBadge?: string | null;
  strLogo?: string | null;
  strBanner?: string | null;
  strTrophy?: string | null;
}

export interface SportsDBTableRow {
  intRank: string;
  idTeam: string;
  strTeam: string;
  strTeamBadge?: string | null;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm?: string | null;
  strDescription?: string | null;
  strGroup?: string | null;
}

export interface SportsDBSeason {
  strSeason: string;
  strBadge?: string | null;
}

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number | null;
  progress: string | null;
  league: string;
  leagueId: string;
  sport: SportTag;
  date: string;
  time: string | null;
  venue: string | null;
  city: string | null;
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled"
  | "unknown";

export type SportTag =
  | "football"
  | "basketball"
  | "tennis"
  | "f1"
  | "ufc"
  | "other";

// ─────────────────────────────────────────────────────────────
//  💾 IN-MEMORY CACHE
//  ─────────────────────────────────────────────────────────────

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
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─────────────────────────────────────────────────────────────
//  🔄 RETRY HELPER
//  ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SportVerge/1.0 (+https://sportverge.app)",
        Accept: "application/json",
      },
    });
    clearTimeout(timer);

    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1);
    }

    return res;
  } catch (err) {
    clearTimeout(timer);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 400 * (3 - retries)));
      return fetchWithRetry(url, retries - 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
//  🔀 DETECTION & NORMALIZATION HELPERS
//  ─────────────────────────────────────────────────────────────

export function detectSport(strSport: string | null | undefined): SportTag {
  if (!strSport) return "other";
  const s = strSport.toLowerCase();
  if (s === "soccer" || s === "football") return "football";
  if (s === "basketball") return "basketball";
  if (s === "tennis") return "tennis";
  if (s === "motorsport" || s === "formula 1" || s === "f1") return "f1";
  if (s === "fighting" || s === "mma" || s === "boxing" || s === "ufc") return "ufc";
  return "other";
}

export function sportToApiParam(sport: SportTag): string {
  const map: Record<SportTag, string> = {
    football: "Soccer",
    basketball: "Basketball",
    tennis: "Tennis",
    f1: "Motorsport",
    ufc: "Fighting",
    other: "Soccer",
  };
  return map[sport];
}

function normalizeStatus(
  strStatus: string | null | undefined,
  progress: string | null | undefined
): MatchStatus {
  const s = (strStatus ?? "").toLowerCase();
  const p = (progress ?? "").toLowerCase();

  if (p.includes("ht") || p.includes("half")) return "halftime";
  if (p.includes("'") || p.includes("min")) return "live";
  if (s.includes("match finished") || s.includes("finished") || s === "ft") return "finished";
  if (s.includes("not started") || s.includes("scheduled") || s === "ns") return "scheduled";
  if (s.includes("postponed")) return "postponed";
  if (s.includes("cancelled") || s.includes("canceled")) return "cancelled";
  if (s.includes("live")) return "live";
  return "unknown";
}

function parseMinute(progress: string | null | undefined): number | null {
  if (!progress) return null;
  const match = progress.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function extractForm(last5: string | null | undefined): string[] {
  if (!last5) return [];
  return last5.split("").filter((c) => /[WDL]/i.test(c));
}

// ─────────────────────────────────────────────────────────────
//  🖼️ IMAGE HELPERS
//  ─────────────────────────────────────────────────────────────

export function getTeamBadge(teamId: string): string {
  if (!teamId) return "";
  return `https://www.thesportsdb.com/images/media/team/badge/${teamId}.png`;
}

export function getTeamLogo(teamId: string): string {
  if (!teamId) return "";
  return `https://www.thesportsdb.com/images/media/team/logo/${teamId}.png`;
}

export function getTeamBanner(teamId: string): string {
  if (!teamId) return "";
  return `https://www.thesportsdb.com/images/media/team/banner/${teamId}.jpg`;
}

export function getLeagueBadge(leagueId: string): string {
  if (!leagueId) return "";
  return `https://www.thesportsdb.com/images/media/league/badge/${leagueId}.png`;
}

export function getPlayerPhoto(playerId: string): string {
  if (!playerId) return "";
  return `https://www.thesportsdb.com/images/media/player/thumb/${playerId}.jpg`;
}

export function getPlayerCutout(playerId: string): string {
  if (!playerId) return "";
  return `https://www.thesportsdb.com/images/media/player/cutout/${playerId}.png`;
}

export function getEventThumb(eventId: string): string {
  if (!eventId) return "";
  return `https://www.thesportsdb.com/images/media/event/thumb/${eventId}.jpg`;
}

/**
 * Fallback chain for team badge.
 * Uses API-returned badge first, then derived URL.
 */
export function resolveTeamBadge(event: SportsDBEvent, side: "home" | "away"): string {
  const direct = side === "home" ? event.strHomeTeamBadge : event.strAwayTeamBadge;
  if (direct) return direct;
  const id = side === "home" ? event.idHomeTeam : event.idAwayTeam;
  return getTeamBadge(id);
}

// ─────────────────────────────────────────────────────────────
//  📡 LOW-LEVEL: raw fetch + cache wrapper
//  ─────────────────────────────────────────────────────────────

async function fetchJson<T>(
  endpoint: string,
  cacheTtlMs: number,
  cacheKey?: string
): Promise<T | null> {
  const key = cacheKey ?? endpoint;
  const cached = getCached<T>(key);
  if (cached) return cached;

  try {
    const res = await fetchWithRetry(`${BASE_URL}/${endpoint}`);
    if (!res.ok) {
      console.warn(`[TheSportsDB] ${endpoint} → ${res.status}`);
      return null;
    }

    const data = (await res.json()) as T;
    setCached(key, data, cacheTtlMs);
    return data;
  } catch (err) {
    console.error(`[TheSportsDB] ${endpoint} error:`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  ⚽ 1. LIVE SCORES
//  ─────────────────────────────────────────────────────────────

export async function getLiveScores(sport = "Soccer"): Promise<SportsDBEvent[]> {
  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `livescore.php?s=${encodeURIComponent(sport)}`,
    30_000, // 30 წმ
    `live:${sport}`
  );
  return data?.events ?? [];
}

/**
 * Live matches with normalized status and parsed minute.
 */
export async function getLiveMatches(sport: SportTag = "football"): Promise<LiveMatch[]> {
  const events = await getLiveScores(sportToApiParam(sport));
  return events.map(normalizeLiveEvent);
}

function normalizeLiveEvent(event: SportsDBEvent): LiveMatch {
  return {
    id: event.idEvent,
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeTeamId: event.idHomeTeam,
    awayTeamId: event.idAwayTeam,
    homeScore: parseInt(event.intHomeScore ?? "0", 10) || 0,
    awayScore: parseInt(event.intAwayScore ?? "0", 10) || 0,
    status: normalizeStatus(event.strStatus, event.strProgress),
    minute: parseMinute(event.strProgress),
    progress: event.strProgress,
    league: event.strLeague,
    leagueId: event.idLeague,
    sport: detectSport(event.strSport),
    date: event.dateEvent,
    time: event.strTime,
    venue: event.strVenue,
    city: event.strCity,
  };
}

// ─────────────────────────────────────────────────────────────
//  📅 2. NEXT LEAGUE EVENTS
//  ─────────────────────────────────────────────────────────────

export async function getNextLeagueEvents(
  leagueId: string
): Promise<SportsDBEvent[]> {
  if (!leagueId || leagueId === "undefined") return [];

  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `eventsnextleague.php?id=${leagueId}`,
    30 * 60_000,
    `next-league:${leagueId}`
  );
  return data?.events ?? [];
}

/**
 * Next 15 events for a specific team.
 */
export async function getNextTeamEvents(teamId: string): Promise<SportsDBEvent[]> {
  if (!teamId) return [];

  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `eventsnext.php?id=${teamId}`,
    30 * 60_000,
    `next-team:${teamId}`
  );
  return data?.events ?? [];
}

// ─────────────────────────────────────────────────────────────
//  🕰️ 3. PAST LEAGUE EVENTS
//  ─────────────────────────────────────────────────────────────

export async function getPastLeagueEvents(
  leagueId: string
): Promise<SportsDBEvent[]> {
  if (!leagueId || leagueId === "undefined") return [];

  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `eventspastleague.php?id=${leagueId}`,
    60 * 60_000,
    `past-league:${leagueId}`
  );
  return data?.events ?? [];
}

/**
 * Last 5 events for a team.
 */
export async function getLastTeamEvents(teamId: string): Promise<SportsDBEvent[]> {
  if (!teamId) return [];

  const data = await fetchJson<{ results: SportsDBEvent[] | null }>(
    `eventslast.php?id=${teamId}`,
    30 * 60_000,
    `last-team:${teamId}`
  );
  return data?.results ?? [];
}

// ─────────────────────────────────────────────────────────────
//  📆 4. SEASON EVENTS
//  ─────────────────────────────────────────────────────────────

export function getCurrentSeason(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11
  // Football season starts ~July
  return m >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export async function getSeasonEvents(
  leagueId: string,
  season?: string
): Promise<SportsDBEvent[]> {
  if (!leagueId || leagueId === "undefined") return [];

  const s = season ?? getCurrentSeason();
  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `eventsseason.php?id=${leagueId}&s=${s}`,
    60 * 60_000,
    `season:${leagueId}:${s}`
  );
  return data?.events ?? [];
}

// ─────────────────────────────────────────────────────────────
//  🔀 5. ALL UPCOMING (multi-league)
//  ─────────────────────────────────────────────────────────────

export async function getAllUpcomingEvents(
  leagueIds: string[],
  limit?: number
): Promise<SportsDBEvent[]> {
  const results = await Promise.all(leagueIds.map(getNextLeagueEvents));

  const map = new Map<string, SportsDBEvent>();
  results.flat().forEach((e) => {
    if (e?.idEvent) map.set(e.idEvent, e);
  });

  const sorted = Array.from(map.values()).sort((a, b) => {
    const ta = new Date(`${a.dateEvent}T${a.strTime ?? "00:00:00"}`).getTime();
    const tb = new Date(`${b.dateEvent}T${b.strTime ?? "00:00:00"}`).getTime();
    return ta - tb;
  });

  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Today's matches across multiple leagues.
 */
export async function getTodayEvents(
  leagueIds: string[]
): Promise<SportsDBEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  const all = await getAllUpcomingEvents(leagueIds);
  return all.filter((e) => e.dateEvent === today);
}

// ─────────────────────────────────────────────────────────────
//  🔍 6. EVENT BY ID
//  ─────────────────────────────────────────────────────────────

export async function getEventById(
  eventId: string
): Promise<SportsDBEvent | null> {
  if (!eventId) return null;

  const data = await fetchJson<{ events: SportsDBEvent[] | null }>(
    `lookupevent.php?id=${eventId}`,
    5 * 60_000,
    `event:${eventId}`
  );
  return data?.events?.[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
//  📊 7. LEAGUE TABLE / STANDINGS
//  ─────────────────────────────────────────────────────────────

export async function getLeagueTable(
  leagueId: string,
  season?: string
): Promise<SportsDBTableRow[]> {
  if (!leagueId || leagueId === "undefined") return [];

  const s = season ?? getCurrentSeason();
  const data = await fetchJson<{ table: SportsDBTableRow[] | null }>(
    `lookuptable.php?l=${leagueId}&s=${s}`,
    60 * 60_000,
    `table:${leagueId}:${s}`
  );
  return data?.table ?? [];
}

/**
 * Formatted standings with computed points per game and goal diff.
 */
export interface FormattedStanding extends SportsDBTableRow {
  goalDiff: number;
  pointsPerGame: number;
  isTopFour: boolean;
  isRelegation: boolean;
}

export async function getFormattedStandings(
  leagueId: string,
  season?: string
): Promise<FormattedStanding[]> {
  const table = await getLeagueTable(leagueId, season);
  const total = table.length;

  return table.map((row, idx) => {
    const gd = parseInt(row.intGoalDifference ?? "0", 10) || 0;
    const played = parseInt(row.intPlayed ?? "1", 10) || 1;
    const points = parseInt(row.intPoints ?? "0", 10) || 0;

    return {
      ...row,
      goalDiff: gd,
      pointsPerGame: +(points / played).toFixed(2),
      isTopFour: idx < 4 && total > 6,
      isRelegation: idx >= total - 3 && total > 6,
    };
  });
}

// ─────────────────────────────────────────────────────────────
//  🏆 8. LEAGUE LOOKUP
//  ─────────────────────────────────────────────────────────────

export async function getLeagueById(
  leagueId: string
): Promise<SportsDBLeague | null> {
  if (!leagueId) return null;

  const data = await fetchJson<{ leagues: SportsDBLeague[] | null }>(
    `lookupleague.php?id=${leagueId}`,
    24 * 60 * 60_000,
    `league:${leagueId}`
  );
  return data?.leagues?.[0] ?? null;
}

export async function getLeagueSeasons(
  leagueId: string
): Promise<SportsDBSeason[]> {
  if (!leagueId) return [];

  const data = await fetchJson<{ seasons: SportsDBSeason[] | null }>(
    `lookupseason.php?id=${leagueId}`,
    24 * 60 * 60_000,
    `seasons:${leagueId}`
  );
  return data?.seasons ?? [];
}

export async function getAllLeagues(): Promise<SportsDBLeague[]> {
  const data = await fetchJson<{ leagues: SportsDBLeague[] | null }>(
    `all_leagues.php`,
    24 * 60 * 60_000,
    "all-leagues"
  );
  return data?.leagues ?? [];
}

export async function getLeaguesByCountry(
  country: string,
  sport = "Soccer"
): Promise<SportsDBLeague[]> {
  const data = await fetchJson<{ countries: SportsDBLeague[] | null }>(
    `search_all_leagues.php?c=${encodeURIComponent(country)}&s=${encodeURIComponent(sport)}`,
    24 * 60 * 60_000,
    `leagues-country:${country}:${sport}`
  );
  return data?.countries ?? [];
}

// ─────────────────────────────────────────────────────────────
//  👥 9. TEAM LOOKUP
//  ─────────────────────────────────────────────────────────────

export async function getTeamById(teamId: string): Promise<SportsDBTeam | null> {
  if (!teamId) return null;

  const data = await fetchJson<{ teams: SportsDBTeam[] | null }>(
    `lookupteam.php?id=${teamId}`,
    6 * 60 * 60_000,
    `team:${teamId}`
  );
  return data?.teams?.[0] ?? null;
}

export async function searchTeamsByName(
  name: string
): Promise<SportsDBTeam[]> {
  if (!name.trim()) return [];

  const data = await fetchJson<{ teams: SportsDBTeam[] | null }>(
    `searchteams.php?t=${encodeURIComponent(name)}`,
    6 * 60 * 60_000,
    `team-search:${name.toLowerCase()}`
  );
  return data?.teams ?? [];
}

export async function getAllTeamsInLeague(
  leagueName: string
): Promise<SportsDBTeam[]> {
  const data = await fetchJson<{ teams: SportsDBTeam[] | null }>(
    `search_all_teams.php?l=${encodeURIComponent(leagueName)}`,
    6 * 60 * 60_000,
    `teams-league:${leagueName}`
  );
  return data?.teams ?? [];
}

export async function getTeamsByCountry(
  country: string,
  sport = "Soccer"
): Promise<SportsDBTeam[]> {
  const data = await fetchJson<{ teams: SportsDBTeam[] | null }>(
    `search_all_teams.php?c=${encodeURIComponent(country)}&s=${encodeURIComponent(sport)}`,
    6 * 60 * 60_000,
    `teams-country:${country}:${sport}`
  );
  return data?.teams ?? [];
}

// ─────────────────────────────────────────────────────────────
//  👤 10. PLAYER LOOKUP
//  ─────────────────────────────────────────────────────────────

export async function getPlayerById(
  playerId: string
): Promise<SportsDBPlayer | null> {
  if (!playerId) return null;

  const data = await fetchJson<{ players: SportsDBPlayer[] | null }>(
    `lookupplayer.php?id=${playerId}`,
    6 * 60 * 60_000,
    `player:${playerId}`
  );
  return data?.players?.[0] ?? null;
}

export async function searchPlayersByName(
  name: string
): Promise<SportsDBPlayer[]> {
  if (!name.trim()) return [];

  const data = await fetchJson<{ player: SportsDBPlayer[] | null }>(
    `searchplayers.php?p=${encodeURIComponent(name)}`,
    6 * 60 * 60_000,
    `player-search:${name.toLowerCase()}`
  );
  return data?.player ?? [];
}

export async function getPlayersByTeam(
  teamId: string
): Promise<SportsDBPlayer[]> {
  if (!teamId) return [];

  const data = await fetchJson<{ player: SportsDBPlayer[] | null }>(
    `lookup_all_players.php?id=${teamId}`,
    6 * 60 * 60_000,
    `players-team:${teamId}`
  );
  return data?.player ?? [];
}

// ─────────────────────────────────────────────────────────────
//  🎯 11. SEARCH (universal)
//  ─────────────────────────────────────────────────────────────

export interface SearchResults {
  teams: SportsDBTeam[];
  players: SportsDBPlayer[];
  events: SportsDBEvent[];
  leagues: SportsDBLeague[];
}

export async function searchEverything(query: string): Promise<SearchResults> {
  if (!query.trim()) {
    return { teams: [], players: [], events: [], leagues: [] };
  }

  const [teams, players] = await Promise.all([
    searchTeamsByName(query),
    searchPlayersByName(query),
  ]);

  return {
    teams: teams.slice(0, 5),
    players: players.slice(0, 5),
    events: [],
    leagues: [],
  };
}

// ─────────────────────────────────────────────────────────────
//  📺 12. TV BROADCASTS
//  ─────────────────────────────────────────────────────────────

export interface TVBroadcast {
  idEvent: string;
  strEvent: string;
  strCountry: string;
  strTVStation: string;
}

export async function getTVBroadcasts(eventId: string): Promise<TVBroadcast[]> {
  if (!eventId) return [];

  const data = await fetchJson<{ tvevents: TVBroadcast[] | null }>(
    `lookuptv.php?id=${eventId}`,
    6 * 60 * 60_000,
    `tv:${eventId}`
  );
  return data?.tvevents ?? [];
}

// ─────────────────────────────────────────────────────────────
//  🏟️ 13. VENUE LOOKUP
//  ─────────────────────────────────────────────────────────────

export interface SportsDBVenue {
  idVenue: string;
  strVenue: string;
  strLocation: string | null;
  intCapacity: string | null;
  strCountry: string | null;
  strDescriptionEN?: string | null;
  strThumb?: string | null;
  strBanner?: string | null;
}

export async function getVenueById(venueId: string): Promise<SportsDBVenue | null> {
  if (!venueId) return null;

  const data = await fetchJson<{ venues: SportsDBVenue[] | null }>(
    `lookupvenue.php?id=${venueId}`,
    24 * 60 * 60_000,
    `venue:${venueId}`
  );
  return data?.venues?.[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
//  🌍 14. COUNTRIES & SPORTS
//  ─────────────────────────────────────────────────────────────

export async function getAllCountries(): Promise<
  { name_en: string }[]
> {
  const data = await fetchJson<{ countries: { name_en: string }[] | null }>(
    `all_countries.php`,
    24 * 60 * 60_000,
    "all-countries"
  );
  return data?.countries ?? [];
}

export async function getAllSports(): Promise<
  { strSport: string; strFormat: string }[]
> {
  const data = await fetchJson<{
    sports: { strSport: string; strFormat: string }[] | null;
  }>(`all_sports.php`, 24 * 60 * 60_000, "all-sports");
  return data?.sports ?? [];
}

// ─────────────────────────────────────────────────────────────
//  🎯 15. TIMELINE PARSING
//  ─────────────────────────────────────────────────────────────

export interface TimelineEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "sub" | "other";
  team: "home" | "away";
  player: string | null;
  description: string;
}

/**
 * Parse goal details like "23': Messi; 45+2': Suarez" into structured events.
 */
export function parseGoalDetails(
  homeGoals: string | null | undefined,
  awayGoals: string | null | undefined
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const parse = (str: string | null | undefined, team: "home" | "away") => {
    if (!str) return;
    const parts = str.split(";").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const m = part.match(/^(\d+)(?:\+(\d+))?'?[:\s-]+(.+)$/);
      if (!m) continue;
      const minute = parseInt(m[1], 10);
      const player = m[3]?.trim() ?? null;
      events.push({
        minute,
        type: "goal",
        team,
        player,
        description: part,
      });
    }
  };

  parse(homeGoals, "home");
  parse(awayGoals, "away");

  return events.sort((a, b) => a.minute - b.minute);
}

/**
 * Parse card strings ("34': Player Name").
 */
export function parseCards(
  homeCards: string | null | undefined,
  awayCards: string | null | undefined,
  type: "yellow" | "red"
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const parse = (str: string | null | undefined, team: "home" | "away") => {
    if (!str) return;
    const parts = str.split(";").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const m = part.match(/^(\d+)'?[:\s-]+(.+)$/);
      if (!m) continue;
      events.push({
        minute: parseInt(m[1], 10),
        type,
        team,
        player: m[2]?.trim() ?? null,
        description: part,
      });
    }
  };

  parse(homeCards, "home");
  parse(awayCards, "away");

  return events.sort((a, b) => a.minute - b.minute);
}

/**
 * Full timeline combining goals + cards.
 */
export function buildEventTimeline(event: SportsDBEvent): TimelineEvent[] {
  return [
    ...parseGoalDetails(event.strHomeGoalDetails, event.strAwayGoalDetails),
    ...parseCards(event.strHomeYellowCards, event.strAwayYellowCards, "yellow"),
    ...parseCards(event.strHomeRedCards, event.strAwayRedCards, "red"),
  ].sort((a, b) => a.minute - b.minute);
}

// ─────────────────────────────────────────────────────────────
//  📊 16. MATCH STATS
//  ─────────────────────────────────────────────────────────────

export interface MatchStats {
  possession: { home: number; away: number } | null;
  shots: { home: number; away: number } | null;
  shotsOnTarget: { home: number; away: number } | null;
  fouls: { home: number; away: number } | null;
  corners: { home: number; away: number } | null;
  offsides: { home: number; away: number } | null;
}

export function extractMatchStats(event: SportsDBEvent): MatchStats {
  const num = (v: string | null | undefined) => {
    const n = parseInt(v ?? "", 10);
    return isNaN(n) ? null : n;
  };

  const pair = (h: string | null | undefined, a: string | null | undefined) => {
    const hn = num(h);
    const an = num(a);
    if (hn === null && an === null) return null;
    return { home: hn ?? 0, away: an ?? 0 };
  };

  return {
    possession: pair(event.intHomePossession, event.intAwayPossession),
    shots: pair(event.intHomeShots, event.intAwayShots),
    shotsOnTarget: pair(event.intHomeShotsOnTarget, event.intAwayShotsOnTarget),
    fouls: pair(event.intHomeFouls, event.intAwayFouls),
    corners: pair(event.intHomeCorners, event.intAwayCorners),
    offsides: pair(event.intHomeOffsides, event.intAwayOffsides),
  };
}

// ─────────────────────────────────────────────────────────────
//  🧹 17. CACHE MANAGEMENT
//  ─────────────────────────────────────────────────────────────

export function clearSportsDBCache(): void {
  cache.clear();
}

export function getSportsDBCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}

// ─────────────────────────────────────────────────────────────
//  📤 RE-EXPORT from constants (backwards compat)
//  ─────────────────────────────────────────────────────────────

export { LEAGUES as POPULAR_LEAGUES } from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
//  BACKWARDS COMPATIBILITY ALIASES
// ═══════════════════════════════════════════════════════════════

/** Alias for getPlayersByTeam */
export const getTeamPlayers = getPlayersByTeam;

/** Alias for getNextTeamEvents */
export const getTeamNextEvents = getNextTeamEvents;

/** Alias for getLastTeamEvents */
export const getTeamLastEvents = getLastTeamEvents;

/** Georgian teams */
export const GEORGIAN_TEAMS = {
  dinamoTbilisi: '135259',
  dinamoBatumi: '135289',
  torpedoKutaisi: '135290',
  saburtalo: '135292',
  lokomotivi: '135288',
  samgurali: '135875',
} as const;