'use client';

// ═══════════════════════════════════════════════════════════════
//  LiveBadge — 🔴 პულსირებადი LIVE ინდიკატორი
// ═══════════════════════════════════════════════════════════════

interface LiveBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-[10px]',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-xs',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-4 py-1.5',
    text: 'text-sm',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
};

export function LiveBadge({
  size = 'md',
  label = 'LIVE',
  className = '',
  animated = true,
}: LiveBadgeProps) {
  const s = sizes[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${s.padding} rounded-full bg-danger/15 border border-danger/30 backdrop-blur-sm ${className}`}
      role="status"
      aria-label="Live broadcast"
    >
      <span className="relative flex items-center justify-center">
        {animated && (
          <span
            className={`absolute ${s.dot} rounded-full bg-danger opacity-75 animate-ping`}
          />
        )}
        <span className={`relative ${s.dot} rounded-full bg-danger`} />
      </span>

      <span className={`${s.text} font-bold tracking-wider text-danger uppercase`}>
        {label}
      </span>
    </div>
  );
}

export default LiveBadge;
