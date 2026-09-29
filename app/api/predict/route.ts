// ═══════════════════════════════════════════════════════════════
//  /api/predict — AI პროგნოზის API (Google Gemini)
//  GET /api/predict?matchId=xxx&locale=ka
//  აბრუნებს: Win Probability + Next Event Prediction
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  getEventById,
  getLastTeamEvents,
  type SportsDBEvent,
} from '@/lib/api/sportsdb';
import {
  predictMatchOutcome,
  predictNextEvent,
  type WinPrediction,
  type NextEventPrediction,
} from '@/lib/api/gemini';

export const revalidate = 300; // 5 წუთი ქეში

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// ფორმის გამოთვლა ბოლო მატჩებიდან (W/D/L)
// ─────────────────────────────────────────────
function calculateForm(
  matches: SportsDBEvent[],
  teamId: string
): ('W' | 'D' | 'L')[] {
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
// საშუალო გოლების გამოთვლა
// ─────────────────────────────────────────────
function calculateGoalsAvg(
  matches: SportsDBEvent[],
  teamId: string
): number {
  if (matches.length === 0) return 0;

  const total = matches.reduce((sum, m) => {
    const isHome = m.idHomeTeam === teamId;
    const homeScore = parseInt(m.intHomeScore || '0', 10);
    const awayScore = parseInt(m.intAwayScore || '0', 10);
    const teamScore = isHome ? homeScore : awayScore;
    return sum + teamScore;
  }, 0);

  return Math.round((total / matches.length) * 100) / 100;
}

// ─────────────────────────────────────────────
// H2H (Head-to-Head) შეჯამება
// ─────────────────────────────────────────────
function buildH2H(
  homeLast: SportsDBEvent[],
  awayLast: SportsDBEvent[],
  homeTeamId: string,
  awayTeamId: string
): string {
  // მოვძებნოთ მატჩები, სადაც ორივე გუნდი მონაწილეობდა
  const allMatches = [...homeLast, ...awayLast];
  const h2h = allMatches.filter(
    (m) =>
      (m.idHomeTeam === homeTeamId && m.idAwayTeam === awayTeamId) ||
      (m.idHomeTeam === awayTeamId && m.idAwayTeam === homeTeamId)
  );

  if (h2h.length === 0) return 'No recent H2H data';

  const uniqueMatches = h2h.slice(0, 5);
  const results = uniqueMatches.map((m) => {
    const homeScore = parseInt(m.intHomeScore || '0', 10);
    const awayScore = parseInt(m.intAwayScore || '0', 10);
    return `${m.strHomeTeam} ${homeScore}-${awayScore} ${m.strAwayTeam}`;
  });

  return results.join(' | ');
}

// ─────────────────────────────────────────────
// მატჩის სტატუსი
// ─────────────────────────────────────────────
function getMatchStatus(
  event: SportsDBEvent
): 'upcoming' | 'live' | 'finished' {
  if (
    event.strStatus === 'Match Finished' ||
    event.strStatus === 'FT' ||
    (event.intHomeScore !== null &&
      event.strStatus !== 'Live' &&
      event.strStatus !== '1H' &&
      event.strStatus !== '2H')
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
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/predict
// ═══════════════════════════════════════════════════════════════
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const locale = (searchParams.get('locale') || 'ka') as
      | 'ka'
      | 'en'
      | 'ru';

    // ─── ვალიდაცია ───
    if (!matchId) {
      return NextResponse.json(
        {
          success: false,
          error: 'matchId is required',
          prediction: null,
          nextEvent: null,
        },
        { status: 400 }
      );
    }

    // ─── 1. მატჩის მონაცემები ───
    const event = await getEventById(matchId);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Match not found',
          prediction: null,
          nextEvent: null,
        },
        { status: 404 }
      );
    }

    // ─── 2. გუნდების ბოლო მატჩები (პარალელურად) ───
    const [homeLast, awayLast] = await Promise.all([
      getLastTeamEvents(event.idHomeTeam).catch(() => []),
      getLastTeamEvents(event.idAwayTeam).catch(() => []),
    ]);

    // ─── 3. ფორმისა და სტატისტიკის გამოთვლა ───
    const homeForm = calculateForm(homeLast, event.idHomeTeam);
    const awayForm = calculateForm(awayLast, event.idAwayTeam);
    const homeGoalsAvg = calculateGoalsAvg(homeLast, event.idHomeTeam);
    const awayGoalsAvg = calculateGoalsAvg(awayLast, event.idAwayTeam);
    const h2h = buildH2H(
      homeLast,
      awayLast,
      event.idHomeTeam,
      event.idAwayTeam
    );

    // ─── 4. AI პროგნოზი (Gemini) ───
    let prediction: WinPrediction | null = null;

    try {
      prediction = await predictMatchOutcome({
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        league: event.strLeague,
        homeForm,
        awayForm,
        homeGoalsAvg,
        awayGoalsAvg,
        h2h,
        locale,
      });
    } catch (err) {
      console.error('[/api/predict] AI prediction error:', err);
    }

    // ─── Fallback: თუ AI ვერ იმუშავა, მარტივი ალგორითმი ───
    if (!prediction) {
      prediction = generateFallbackPrediction(
        homeForm,
        awayForm,
        homeGoalsAvg,
        awayGoalsAvg
      );
    }

    // ─── 5. Next Event პროგნოზი (მხოლოდ live მატჩებისთვის) ───
    let nextEvent: NextEventPrediction | null = null;
    const status = getMatchStatus(event);

    if (status === 'live') {
      try {
        nextEvent = await predictNextEvent({
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,
          currentMinute: 45,
          scoreHome: parseInt(event.intHomeScore || '0', 10),
          scoreAway: parseInt(event.intAwayScore || '0', 10),
          locale,
        });
      } catch (err) {
        console.error('[/api/predict] Next event error:', err);
      }
    }

    // ─── 6. პასუხი ───
    return NextResponse.json(
      {
        success: true,
        matchId,
        status,
        match: {
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,
          league: event.strLeague,
          homeScore:
            event.intHomeScore !== null
              ? parseInt(event.intHomeScore, 10)
              : null,
          awayScore:
            event.intAwayScore !== null
              ? parseInt(event.intAwayScore, 10)
              : null,
        },
        prediction,
        nextEvent,
        metadata: {
          homeForm,
          awayForm,
          homeGoalsAvg,
          awayGoalsAvg,
          h2h,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[/api/predict] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate prediction',
        prediction: null,
        nextEvent: null,
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  FALLBACK PREDICTION — თუ AI ვერ იმუშავა
//  მარტივი ალგორითმი ფორმისა და გოლების მიხედვით
// ═══════════════════════════════════════════════════════════════
function generateFallbackPrediction(
  homeForm: ('W' | 'D' | 'L')[],
  awayForm: ('W' | 'D' | 'L')[],
  homeGoalsAvg: number,
  awayGoalsAvg: number
): WinPrediction {
  // ─── ფორმის ქულები ───
  const formPoints = (form: ('W' | 'D' | 'L')[]) =>
    form.reduce((sum, r) => sum + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);

  const homeFormPts = formPoints(homeForm);
  const awayFormPts = formPoints(awayForm);

  // ─── სახლის უპირატესობა ───
  const homeAdvantage = 1.2;

  // ─── საბაზისო ქულები ───
  const homeStrength =
    (homeFormPts + homeGoalsAvg * 5) * homeAdvantage + 5;
  const awayStrength = awayFormPts + awayGoalsAvg * 5 + 5;

  // ─── სულ ───
  const total = homeStrength + awayStrength;
  const homeWin = Math.round((homeStrength / total) * 100);
  const awayWin = Math.round((awayStrength / total) * 100);
  const draw = Math.max(100 - homeWin - awayWin, 5);

  // ─── ნორმალიზაცია ───
  const sum = homeWin + draw + awayWin;
  const finalHome = Math.round((homeWin / sum) * 100);
  const finalDraw = Math.round((draw / sum) * 100);
  const finalAway = 100 - finalHome - finalDraw;

  return {
    homeWin: finalHome,
    draw: finalDraw,
    awayWin: finalAway,
    reason: 'Based on recent form and goals average (AI unavailable)',
    confidence: 'low',
  };
}