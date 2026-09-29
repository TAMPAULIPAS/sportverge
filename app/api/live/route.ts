// ═══════════════════════════════════════════════════════════════
//  /api/live — Live მატჩების API
//  TheSportsDB-დან რეალური ცოცხალი მატჩები
//  GET /api/live?sport=Soccer
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getLiveScores } from '@/lib/api/sportsdb';

export const revalidate = 30; // 30 წამი ქეში

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || 'Soccer';

    const events = await getLiveScores(sport);

    return NextResponse.json(
      {
        success: true,
        sport,
        count: events.length,
        events,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[/api/live] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live scores',
        events: [],
      },
      { status: 500 }
    );
  }
}