'use client';

// ═══════════════════════════════════════════════════════════════
//  Button — უნივერსალური ღილაკი
//  ვარიანტები: primary (lime), secondary, ghost, danger, outline
//  ზომები: sm, md, lg, icon
// ═══════════════════════════════════════════════════════════════

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-lime text-ink hover:bg-lime/90 hover:shadow-[0_0_24px_rgba(217,249,157,0.4)] font-semibold',
  secondary:
    'bg-surface border border-edge text-text hover:bg-surface-hover hover:border-muted/40',
  outline:
    'bg-transparent border border-lime text-lime hover:bg-lime/10',
  ghost:
    'bg-transparent text-muted hover:text-text hover:bg-surface-hover',
  danger:
    'bg-danger text-white hover:bg-danger/90 hover:shadow-[0_0_24px_rgba(239,68,68,0.4)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-lg p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = size === 'icon';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'relative inline-flex items-center justify-center font-medium select-none',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:shadow-none',
          'active:scale-[0.97]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Loading — icon-only ღილაკზეც ცენტრირებულია */}
        {loading && (
          <Loader2
            size={isIconOnly ? 18 : 16}
            className="animate-spin shrink-0"
            aria-hidden="true"
          />
        )}

        {!loading && leftIcon && (
          <span className="shrink-0 inline-flex" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {children && !isIconOnly && (
          <span className={loading ? 'opacity-70' : undefined}>{children}</span>
        )}

        {/* icon-only ღილაკზე loading-ის დროს ბავშვი კონტენტი იმალება, icon რჩება */}
        {children && isIconOnly && !loading && (
          <span className="sr-only">{children}</span>
        )}
        {isIconOnly && !loading && !children && leftIcon === undefined && rightIcon === undefined && (
          <span aria-hidden="true" />
        )}

        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;