import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: Size;
  ring?: 'lime' | 'teal' | 'gold' | 'none';
  status?: 'online' | 'offline' | 'live' | 'none';
  className?: string;
  priority?: boolean;
}

const sizeMap: Record<Size, { px: number; text: string; dot: string }> = {
  xs: { px: 24, text: 'text-[10px]', dot: 'w-2 h-2' },
  sm: { px: 32, text: 'text-xs', dot: 'w-2.5 h-2.5' },
  md: { px: 40, text: 'text-sm', dot: 'w-3 h-3' },
  lg: { px: 56, text: 'text-lg', dot: 'w-4 h-4' },
  xl: { px: 80, text: 'text-2xl', dot: 'w-5 h-5' },
};

const ringMap = {
  lime: 'ring-2 ring-lime/60 ring-offset-2 ring-offset-ink',
  teal: 'ring-2 ring-teal/60 ring-offset-2 ring-offset-ink',
  gold: 'ring-2 ring-gold/60 ring-offset-2 ring-offset-ink',
  none: '',
};

const statusMap = {
  online: 'bg-success',
  offline: 'bg-muted',
  live: 'bg-danger',
  none: '',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'from-lime to-teal',
    'from-teal to-lime',
    'from-gold to-lime',
    'from-teal to-gold',
    'from-lime to-gold',
    'from-danger to-gold',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  ring = 'none',
  status = 'none',
  className = '',
  priority = false,
}: AvatarProps) {
  const s = sizeMap[size];
  const initials = getInitials(name || alt);
  const gradient = getColorFromName(name || alt || '?');

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center bg-surface-hover',
          ringMap[ring]
        )}
        style={{ width: s.px, height: s.px }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            width={s.px}
            height={s.px}
            priority={priority}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center bg-gradient-to-br font-bold text-ink',
              gradient,
              s.text
            )}
          >
            {initials}
          </div>
        )}
      </div>

      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-ink',
            s.dot,
            statusMap[status],
            status === 'live' && 'animate-pulse'
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: { src?: string | null; name?: string; alt?: string }[];
  max?: number;
  size?: Size;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'sm',
  className = '',
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visible.map((avatar, i) => (
        <div key={i} className="relative">
          <Avatar
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
            className="ring-2 ring-ink"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={cn(
            'relative rounded-full bg-surface border-2 border-ink flex items-center justify-center font-bold text-muted',
            s.text
          )}
          style={{ width: s.px, height: s.px }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}