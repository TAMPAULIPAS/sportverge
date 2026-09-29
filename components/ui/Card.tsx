// TODO: Card.tsx
export default function Component() {
  return null;
}
// ═══════════════════════════════════════════════════════════════
//  Card — უნივერსალური ბარათი
//  ვარიანტები: default, glass, gradient, bordered
// ═══════════════════════════════════════════════════════════════

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'glass' | 'gradient' | 'bordered' | 'flat';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  hover?: boolean;
  glow?: 'lime' | 'teal' | 'none';
}

const variants: Record<Variant, string> = {
  default:
    'bg-surface border border-edge shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
  glass:
    'bg-surface/60 backdrop-blur-xl border border-edge',
  gradient:
    'bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-edge',
  bordered:
    'bg-transparent border border-edge',
  flat:
    'bg-surface/40 border border-transparent',
};

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 lg:p-5',
  lg: 'p-5 lg:p-6',
};

const glows = {
  lime: 'hover:border-lime/40 hover:shadow-[0_0_24px_rgba(217,249,157,0.15)]',
  teal: 'hover:border-teal/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.15)]',
  none: '',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      glow = 'none',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-200',
          variants[variant],
          paddings[padding],
          hover && 'hover:border-muted/30',
          glow !== 'none' && glows[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ─────────────────────────────────────────────
// CardHeader
// ─────────────────────────────────────────────
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 mb-4',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime to-teal flex items-center justify-center text-ink shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="text-xs lg:text-sm font-semibold text-text uppercase tracking-wider truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>
          )}
          {children}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// CardFooter
// ─────────────────────────────────────────────
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function CardFooter({
  border = true,
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 pt-3 flex items-center justify-between',
        border && 'border-t border-edge/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default CardFooter;
