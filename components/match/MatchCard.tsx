import Image from 'next/image';
import { TeamBadge } from './TeamBadge';
import { LiveBadge } from './LiveBadge';

interface TeamData {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string | null;
  strTeamLogo: string | null;
}

interface MatchCardProps {
  homeTeam: TeamData;
  awayTeam: TeamData;
  league: string;
  matchday?: number | string;
  stadium?: string | null;
  stadiumCity?: string | null;
  scoreHome: number | null;
  scoreAway: number | null;
  minute?: number;
  half?: string;
  status: 'upcoming' | 'live' | 'finished';
  homeForm?: ('W' | 'D' | 'L')[];
  awayForm?: ('W' | 'D' | 'L')[];
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = {
    W: 'bg-success',
    D: 'bg-gold',
    L: 'bg-danger',
  };
  return (
    <span
      className={`w-5 h-5 rounded-full ${colors[result]} flex items-center justify-center text-[10px] font-bold text-ink`}
      aria-label={result}
    >
      {result}
    </span>
  );
}

function TeamLogo({ team }: { team: TeamData }) {
  const logo = team.strTeamBadge || team.strTeamLogo;
  if (!logo) {
    return (
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-surface-hover flex items-center justify-center">
        <span className="text-lg font-bold text-muted">
          {team.strTeam.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <div className="relative w-16 h-16 lg:w-20 lg:h-20">
      <Image
        src={logo}
        alt={team.strTeam}
        fill
        sizes="80px"
        className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}

export function MatchCard({
  homeTeam,
  awayTeam,
  league,
  matchday,
  stadium,
  stadiumCity,
  scoreHome,
  scoreAway,
  minute,
  half,
  status,
  homeForm = [],
  awayForm = [],
}: MatchCardProps) {
  const hasScore = scoreHome !== null && scoreAway !== null;

  return (
    <div className="relative w-full bg-surface/80 backdrop-blur-xl border border-edge rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent opacity-60" />

      <div className="flex items-center justify-between px-4 lg:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs lg:text-sm text-muted font-medium">{league}</span>
          {matchday && (
            <>
              <span className="text-muted/50">•</span>
              <span className="text-xs lg:text-sm text-muted">Matchday {matchday}</span>
            </>
          )}
        </div>
        {status === 'live' && <LiveBadge size="sm" />}
      </div>

      <div className="px-4 lg:px-6 pb-4 lg:pb-6">
        <div className="grid grid-cols-3 items-center gap-2 lg:gap-4 py-4">
          <div className="flex flex-col items-center text-center gap-3">
            <TeamLogo team={homeTeam} />
            <span className="text-sm lg:text-base font-semibold text-text">
              {homeTeam.strTeam}
            </span>
            {homeForm.length > 0 && (
              <div className="flex gap-1">
                {homeForm.map((r, i) => (
                  <FormDot key={i} result={r} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            {hasScore ? (
              <div className="font-mono text-4xl lg:text-6xl font-bold text-text tracking-tight flex items-center gap-2 lg:gap-4">
                <span>{scoreHome}</span>
                <span className="text-lime text-2xl lg:text-4xl">:</span>
                <span>{scoreAway}</span>
              </div>
            ) : (
              <div className="font-mono text-2xl lg:text-3xl font-bold text-muted">
                VS
              </div>
            )}

            {status === 'live' && minute && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/15 border border-danger/30">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                <span className="text-xs lg:text-sm font-bold text-danger font-mono">
                  {minute}'
                </span>
              </div>
            )}

            {half && status === 'live' && (
              <span className="text-[10px] lg:text-xs text-muted uppercase tracking-wider">
                {half}
              </span>
            )}

            {status === 'upcoming' && (
              <span className="text-xs lg:text-sm text-muted">მალე დაიწყება</span>
            )}

            {status === 'finished' && (
              <span className="text-xs lg:text-sm text-muted uppercase tracking-wider">
                დასრულდა
              </span>
            )}
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <TeamLogo team={awayTeam} />
            <span className="text-sm lg:text-base font-semibold text-text">
              {awayTeam.strTeam}
            </span>
            {awayForm.length > 0 && (
              <div className="flex gap-1">
                {awayForm.map((r, i) => (
                  <FormDot key={i} result={r} />
                ))}
              </div>
            )}
          </div>
        </div>

        {stadium && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-edge/50">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
            </svg>
            <span className="text-xs text-muted">
              {stadium}
              {stadiumCity && ` • ${stadiumCity}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchCard;
