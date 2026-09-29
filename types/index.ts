export interface Team {
  id: string;
  name_ka: string;
  name_en: string;
  name_ru: string;
  logo: string;
  league: string;
  country: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  date: string;
  status: 'upcoming' | 'live' | 'finished';
  scoreHome: number;
  scoreAway: number;
  minute?: number;
  stadium?: string;
}

export interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  reason: string;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'penalty';
  player: string;
  team: 'home' | 'away';
}

export interface Possession {
  home: number;
  away: number;
}

export interface Stats {
  possession: Possession;
  shots: { home: number; away: number };
  onTarget: { home: number; away: number };
  corners: { home: number; away: number };
}
