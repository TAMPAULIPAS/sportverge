import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'lime' | 'teal' | 'gold' | 'danger' | 'success' | 'muted' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  lime: 'bg-lime/15 text-lime border border-lime/30',
  teal: 'bg-teal/15 text-teal border border-teal/30',
  gold: 'bg-gold/15 text-gold border border-gold/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
  success: 'bg-success/15 text-success border border-success/30',
  muted: 'bg-surface-hover text-muted border border-edge',
  outline: 'bg-transparent text-text border border-edge',
};

const dotColors: Record<Variant, string> = {
  lime: 'bg-lime',
  teal: 'bg-teal',
  gold: 'bg-gold',
  danger: 'bg-danger',
  success: 'bg-success',
  muted: 'bg-muted',
  outline: 'bg-text',
};

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'lime',
      size = 'md',
      dot = false,
      pulse = false,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium tracking-wide',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className="relative flex items-center justify-center">
            {pulse && (
              <span
                className={cn(
                  'absolute w-full h-full rounded-full opacity-75 animate-ping',
                  dotColors[variant]
                )}
              />
            )}
            <span
              className={cn(
                'relative w-1.5 h-1.5 rounded-full',
                dotColors[variant]
              )}
            />
          </span>
        )}

        {icon && <span className="shrink-0">{icon}</span>}

        {children && <span className="uppercase">{children}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;