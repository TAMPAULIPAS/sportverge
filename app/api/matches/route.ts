// ═══════════════════════════════════════════════════════════════
//  /api/matches — Matches API
//  ─────────────────────────────────────────────────────────────
//  GET /api/matches           — ყველა მატჩი
//  GET /api/matches?id=XXX    — კონკრეტული მატჩი
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import {
  getEventById,
  getTeamById,
  getLastTeamEvents,
  getTeamNextEvents,
  getPlayersByTeam,
} from '@/lib/api/sportsdb';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 წუთი

// ─────────────────────────────────────────────
// დამხმარე: გუნდის ფორმა ბოლო მატჩებიდან
// ─────────────────────────────────────────────
function calculateForm(
  matches: any[],
  teamId: string
): ('W' | 'D' | 'L')[] {
  if (!Array.isArray(matches)) return [];

  return matches.slice(0, 5).map((m) => {
    const isHome = m.idHomeTeam === teamId;
    const homeScore = parseInt(m.intHomeScore || '0', 10);
    const awayScore = parseInt(m.intAwayScore || '0', 10);
    const teamScore = isHome ? homeScore : awayScore;
    const oppScore = isHome ? awayScore : homeScore;

    if (teamScore > oppScore) return 'W';
    if (teamScore < oppScore) return 'L';
    return 'D';
  });
}

// ─────────────────────────────────────────────
// GET /api/matches
// ─────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    // ─── Get query params ───
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');

    // ─── თუ id არ მოვიდა — დავაბრუნოთ error ───
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'Match ID is required. Use ?id=XXX' },
        { status: 400 }
      );
    }

    // ─── 1. მატჩის ძირითადი მონაცემები ───
    const event = await getEventById(matchId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // ─── 2. გუნდების დეტალები + ბოლო მატჩები (პარალელურად) ───
    const [homeTeam, awayTeam, homeLast, awayLast] = await Promise.all([
      getTeamById(event.idHomeTeam).catch(() => null),
      getTeamById(event.idAwayTeam).catch(() => null),
      getLastTeamEvents(event.idHomeTeam).catch(() => []),
      getLastTeamEvents(event.idAwayTeam).catch(() => []),
    ]);

    // ─── 3. ფორმის გამოთვლა ───
    const homeForm = calculateForm(homeLast, event.idHomeTeam);
    const awayForm = calculateForm(awayLast, event.idAwayTeam);

    // ─── 4. მატჩის სტატუსი ───
    const status = (() => {
      if (
        event.strStatus === 'Match Finished' ||
        event.strStatus === 'FT' ||
        (event.intHomeScore !== null && event.strStatus !== 'Live')
      ) {
        return 'finished';
      }
      if (
        event.strStatus === 'Live' ||
        event.strStatus === '1H' ||
        event.strStatus === '2H' ||
        event.strStatus === 'HT'
      ) {
        return 'live';
      }
      return 'upcoming';
    })();

    // ─── 5. პასუხი ───
    return NextResponse.json(
      {
        success: true,
        match: {
          id: event.idEvent,
          league: event.strLeague,
          leagueId: event.idLeague,
          season: event.strSeason,
          round: event.intRound,
          status,
          date: event.dateEvent,
          time: event.strTime,
          timestamp: event.strTimestamp,
          venue: event.strVenue,
          city: event.strCity,
          country: event.strCountry,
          spectators: event.intSpectators ?? null,
          official: event.strOfficial ?? null,
          postponed: event.strPostponed === 'yes',

          homeTeam: {
            id: event.idHomeTeam,
            name: event.strHomeTeam,
            score:
              event.intHomeScore !== null ? parseInt(event.intHomeScore, 10) : null,
            logo: homeTeam?.strTeamBadge || homeTeam?.strTeamLogo || null,
            form: homeForm,
            stadium: homeTeam?.strStadium || null,
            country: homeTeam?.strCountry || null,
            founded: homeTeam?.intFormedYear || null,
            description: homeTeam?.strDescriptionEN || null,
          },

          awayTeam: {
            id: event.idAwayTeam,
            name: event.strAwayTeam,
            score:
              event.intAwayScore !== null ? parseInt(event.intAwayScore, 10) : null,
            logo: awayTeam?.strTeamBadge || awayTeam?.strTeamLogo || null,
            form: awayForm,
            stadium: awayTeam?.strStadium || null,
            country: awayTeam?.strCountry || null,
            founded: awayTeam?.intFormedYear || null,
            description: awayTeam?.strDescriptionEN || null,
          },

          thumbnail: event.strThumb || null,
          banner: event.strBanner || null,
          video: event.strVideo || null,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('[/api/matches] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch match details',
        match: null,
      },
      { status: 500 }
    );
  }
}