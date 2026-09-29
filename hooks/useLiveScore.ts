// TODO: useLiveScore
// ═══════════════════════════════════════════════════════════════
//  useLiveScore — Live მატჩების ავტომატური განახლება
//  აბრუნებს: მატჩებს, loading-ს, error-ს, refresh ფუნქციას
//  ავტომატურად ახლდება ყოველ 30 წამში
// ═══════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SportsDBEvent } from '@/lib/api/sportsdb';

interface UseLiveScoreOptions {
  /** ავტომატური განახლება */
  autoRefresh?: boolean;
  /** განახლების ინტერვალი მილიწამებში (default: 30000 = 30 წამი) */
  refreshInterval?: number;
  /** სპორტის ტიპი */
  sport?: string;
}

interface UseLiveScoreReturn {
  matches: SportsDBEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useLiveScore({
  autoRefresh = true,
  refreshInterval = 30000,
  sport = 'Soccer',
}: UseLiveScoreOptions = {}): UseLiveScoreReturn {
  const [matches, setMatches] = useState<SportsDBEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveScores = useCallback(async () => {
    try {
      setError(null);

      const res = await fetch(`/api/live?sport=${sport}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMatches(data.events || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('useLiveScore fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load live scores');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  // Initial fetch
  useEffect(() => {
    fetchLiveScores();
  }, [fetchLiveScores]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchLiveScores();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchLiveScores]);

  return {
    matches,
    loading,
    error,
    refresh: fetchLiveScores,
    lastUpdated,
  };
}

export default useLiveScore;