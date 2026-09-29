// ═══════════════════════════════════════════════════════════════
//  /api/predict/user — მომხმარებლის პროგნოზის შენახვა
//  POST /api/predict/user
//  Body: { matchId: string, choice: 'home' | 'draw' | 'away' }
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getEventById } from '@/lib/api/sportsdb';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────
// ვალიდური არჩევანი
// ─────────────────────────────────────────────
const VALID_CHOICES = ['home', 'draw', 'away'] as const;
type Choice = (typeof VALID_CHOICES)[number];

// ─────────────────────────────────────────────
// POST /api/predict/user
// ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, choice } = body;

    // ─── ვალიდაცია ───
    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'matchId is required' },
        { status: 400 }
      );
    }

    if (!choice || !VALID_CHOICES.includes(choice as Choice)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid choice. Must be one of: ${VALID_CHOICES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ─── მატჩის შემოწმება ───
    const event = await getEventById(matchId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // ─── Supabase ───
    const supabase = createServerClient();

    // TODO: დაემატოს real user auth
    // ახლა ვიყენებთ anonymous მომხმარებელს
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // ─── უკვე არსებული პროგნოზის შემოწმება ───
    const { data: existing } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (existing) {
      // ─── განახლება ───
      const { data, error } = await supabase
        .from('predictions')
        .update({
          choice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[/api/predict/user] Update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update prediction' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        updated: true,
        prediction: data,
      });
    }

    // ─── ახალი პროგნოზის შექმნა ───
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: userId,
        match_id: matchId,
        choice,
        created_at: new Date().toISOString(),
        is_correct: null,
      })
      .select()
      .single();

    if (error) {
      console.error('[/api/predict/user] Insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save prediction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: false,
      prediction: data,
    });
  } catch (error) {
    console.error('[/api/predict/user] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Prediction service error',
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// GET /api/predict/user?matchId=xxx
// ─────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'matchId is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const userId = request.headers.get('x-user-id') || 'anonymous';

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[/api/predict/user] Fetch error:', error);
    }

    return NextResponse.json({
      success: true,
      prediction: data || null,
    });
  } catch (error) {
    console.error('[/api/predict/user] GET Error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch prediction', prediction: null },
      { status: 500 }
    );
  }
}