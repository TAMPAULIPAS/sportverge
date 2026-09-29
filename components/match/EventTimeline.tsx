'use client';

// ═══════════════════════════════════════════════════════════════
//  EventTimeline — ჰორიზონტალური მატჩის მოვლენების ტაიმლაინი
//  გოლები, ბარათები, შეცვლები — დროის მიხედვით
// ═══════════════════════════════════════════════════════════════

interface MatchEvent {
  minute: number;
  extraMinute?: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'penalty' | 'own-goal';
  player: string;
  team: 'home' | 'away';
}

interface EventTimelineProps {
  events: MatchEvent[];
  currentMinute: number;
  totalMinutes?: number;
}

const eventIcons = {
  goal: '⚽',
  'own-goal': '⚽',
  penalty: '⚽',
  yellow: '🟨',
  red: '🟥',
  substitution: '🔄',
};

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  if (type === 'yellow') {
    return <span className="inline-block w-3 h-4 bg-gold rounded-sm" />;
  }
  if (type === 'red') {
    return <span className="inline-block w-3 h-4 bg-danger rounded-sm" />;
  }
  if (type === 'substitution') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return <span className="text-sm">{eventIcons[type]}</span>;
}

export function EventTimeline({
  events,
  currentMinute,
  totalMinutes = 90,
}: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const progress = Math.min((currentMinute / totalMinutes) * 100, 100);

  return (
    <div className="w-full bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl px-4 lg:px-6 py-5">
      <div className="relative h-20 mb-4">
        {sortedEvents.map((event, i) => {
          const left = `${(event.minute / totalMinutes) * 100}%`;
          const isAbove = i % 2 === 0;

          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left,
                top: isAbove ? '0' : 'auto',
                bottom: isAbove ? 'auto' : '0',
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-[10px] lg:text-xs font-mono text-muted whitespace-nowrap">
                {event.minute}
                {event.extraMinute ? `+${event.extraMinute}` : ''}'
              </span>

              <div
                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
                  event.team === 'home'
                    ? 'bg-lime/20 border border-lime/40'
                    : 'bg-teal/20 border border-teal/40'
                }`}
              >
                <EventIcon type={event.type} />
              </div>

              <span className="text-[10px] lg:text-xs text-text whitespace-nowrap max-w-[80px] lg:max-w-[120px] truncate">
                {event.player}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <div className="relative h-1 bg-edge rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-lime to-teal rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />

          {sortedEvents.map((event, i) => {
            const left = `${(event.minute / totalMinutes) * 100}%`;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-text ring-2 ring-ink"
                style={{ left }}
              />
            );
          })}
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${progress}%` }}
        >
          <div className="w-3 h-3 rounded-full bg-danger ring-4 ring-danger/30 animate-pulse" />
        </div>

        <div className="flex justify-between mt-3 text-[10px] lg:text-xs font-mono text-muted">
          <span>0'</span>
          <span>15'</span>
          <span>30'</span>
          <span className="text-teal font-semibold">HT</span>
          <span>60'</span>
          <span>75'</span>
          <span>90'</span>
        </div>
      </div>
    </div>
  );
}

export default EventTimeline;
