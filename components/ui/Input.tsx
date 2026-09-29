'use client';

// ═══════════════════════════════════════════════════════════════
//  Input — ტექსტის ველი (ფორმებისთვის, ძებნისთვის)
//  ვარიანტები: default, search, with icon
// ═══════════════════════════════════════════════════════════════

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, Search, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
  variant?: 'default' | 'search';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  clearable?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg',
  md: 'h-11 px-4 text-sm rounded-xl',
  lg: 'h-13 px-5 text-base rounded-xl',
};

const leftIconPos: Record<Size, string> = {
  sm: 'left-2.5',
  md: 'left-3.5',
  lg: 'left-4',
};

const leftPadding: Record<Size, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

const iconGlyphSize: Record<Size, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      error,
      label,
      helperText,
      fullWidth = false,
      clearable = false,
      className,
      type = 'text',
      value,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const autoId = useId();
    const inputId = id ?? autoId;

    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    const hasValue = value !== undefined && value !== '';
    const finalLeftIcon = variant === 'search' ? <Search size={iconGlyphSize[size]} /> : leftIcon;
    const hasLeftIcon = !!finalLeftIcon;
    const hasRightContent = !!rightIcon || isPassword || (clearable && hasValue);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-xs font-medium uppercase tracking-wider transition-colors duration-150',
              error ? 'text-danger' : isFocused ? 'text-lime' : 'text-muted'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {/* subtle glow ring on focus, sits behind the field */}
          <div
            className={cn(
              'pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-200',
              isFocused && !error && 'opacity-40 bg-lime/30',
              isFocused && error && 'opacity-40 bg-danger/30'
            )}
            aria-hidden="true"
          />

          {hasLeftIcon && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150',
                leftIconPos[size],
                isFocused ? 'text-lime' : 'text-muted'
              )}
              aria-hidden="true"
            >
              {finalLeftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              'relative w-full bg-surface/80 backdrop-blur-sm border text-text placeholder:text-muted/50',
              'focus:outline-none',
              'transition-all duration-200 ease-out',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/40',
              error
                ? 'border-danger/70 focus:border-danger shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                : 'border-edge hover:border-muted/50 focus:border-lime focus:shadow-[0_0_0_3px_rgba(217,249,157,0.15)]',
              sizes[size],
              hasLeftIcon ? leftPadding[size] : undefined,
              hasRightContent && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Right side: clear / password toggle / icon */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={() => {
                  const event = {
                    target: { value: '' },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange?.(event);
                }}
                className="text-muted hover:text-text hover:bg-surface-hover p-1.5 rounded-md transition-colors duration-150"
                aria-label="გასუფთავება"
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted hover:text-text hover:bg-surface-hover p-1.5 rounded-md transition-colors duration-150"
                aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}

            {rightIcon && !isPassword && (
              <span className="text-muted p-1.5" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </div>
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 text-xs text-danger animate-fade-in"
          >
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-helper`} className="text-xs text-muted">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;