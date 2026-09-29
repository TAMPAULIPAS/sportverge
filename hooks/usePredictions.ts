// TODO: usePredictions
// ═══════════════════════════════════════════════════════════════
//  usePredictions — AI + მომხმარებლის პროგნოზების მართვა
//  აბრუნებს: AI პროგნოზს, მომხმარებლის პროგნოზს, სტატისტიკას
// ═══════════════════════════════════════════════════════════════

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { WinPrediction, NextEventPrediction } from '@/lib/api/gemini';

// ─────────────────────────────────────────────
// ტიპები
// ─────────────────────────────────────────────
export type PredictionChoice = 'home' | 'draw' | 'away';

export interface UserPrediction {
  id?: string;
  matchId: string;
  choice: PredictionChoice;
  createdAt: string;
  isCorrect?: boolean;
}

export interface PredictionStats {
  total: number;
  correct: number;
  accuracy: number;
  streak: number;
  points: number;
}

interface UsePredictionsOptions {
  /** მატჩის ID */
  matchId?: string;
  /** ავტომატური ჩატვირთვა mount-ის დროს */
  autoLoad?: boolean;
  /** ენა (AI პასუხისთვის) */
  locale?: 'ka' | 'en' | 'ru';
}

interface UsePredictionsReturn {
  /** AI-ის პროგნოზი */
  aiPrediction: WinPrediction | null;
  /** AI-ის next event პროგნოზი (live მატჩებისთვის) */
  nextEvent: NextEventPrediction | null;
  /** მომხმარებლის პროგნოზი */
  userPrediction: UserPrediction | null;
  /** მომხმარებლის სტატისტიკა */
  stats: PredictionStats | null;
  /** Loading მდგომარეობა */
  loading: boolean;
  /** შეცდომა */
  error: string | null;
  /** მომხმარებლის პროგნოზის გაგზავნა */
  submitPrediction: (choice: PredictionChoice) => Promise<boolean>;
  /** AI პროგნოზის ხელახლა ჩატვირთვა */
  refreshAI: () => Promise<void>;
  /** სტატისტიკის განახლება */
  refreshStats: () => Promise<void>;
  /** მომხმარებლის პროგნოზის გაუქმება */
  clearUserPrediction: () => void;
}

// ─────────────────────────────────────────────
// მთავარი hook
// ─────────────────────────────────────────────
export function usePredictions({
  matchId,
  autoLoad = true,
  locale = 'ka',
}: UsePredictionsOptions = {}): UsePredictionsReturn {
  const [aiPrediction, setAiPrediction] = useState<WinPrediction | null>(null);
  const [nextEvent, setNextEvent] = useState<NextEventPrediction | null>(null);
  const [userPrediction, setUserPrediction] = useState<UserPrediction | null>(null);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // AI პროგნოზის ჩატვირთვა
  // ─────────────────────────────────────────────
  const loadAIPrediction = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/predict?matchId=${matchId}&locale=${locale}`,
        { cache: 'no-store' }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setAiPrediction(data.prediction || null);
      setNextEvent(data.nextEvent || null);
    } catch (err) {
      console.error('usePredictions loadAIPrediction error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load AI prediction'
      );
    } finally {
      setLoading(false);
    }
  }, [matchId, locale]);

  // ─────────────────────────────────────────────
  // მომხმარებლის პროგნოზის გაგზავნა
  // ─────────────────────────────────────────────
  const submitPrediction = useCallback(
    async (choice: PredictionChoice): Promise<boolean> => {
      if (!matchId) return false;

      try {
        setError(null);

        const res = await fetch('/api/predict/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, choice }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setUserPrediction(data.prediction);

        // სტატისტიკის განახლება (optimistic)
        if (stats) {
          setStats({
            ...stats,
            total: stats.total + 1,
          });
        }

        return true;
      } catch (err) {
        console.error('submitPrediction error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to submit prediction'
        );
        return false;
      }
    },
    [matchId, stats]
  );

  // ─────────────────────────────────────────────
  // სტატისტიკის ჩატვირთვა
  // ─────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch('/api/predict/stats', {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('refreshStats error:', err);
    }
  }, []);

  // ─────────────────────────────────────────────
  // მომხმარებლის პროგნოზის გაუქმება
  // ─────────────────────────────────────────────
  const clearUserPrediction = useCallback(() => {
    setUserPrediction(null);
  }, []);

  // ─────────────────────────────────────────────
  // Auto-load mount-ის დროს
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (autoLoad && matchId) {
      loadAIPrediction();
    }
  }, [autoLoad, matchId, loadAIPrediction]);

  // სტატისტიკის ჩატვირთვა ერთხელ
  useEffect(() => {
    if (autoLoad) {
      refreshStats();
    }
  }, [autoLoad, refreshStats]);

  return {
    aiPrediction,
    nextEvent,
    userPrediction,
    stats,
    loading,
    error,
    submitPrediction,
    refreshAI: loadAIPrediction,
    refreshStats,
    clearUserPrediction,
  };
}

export default usePredictions;