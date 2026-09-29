'use client';

// ═══════════════════════════════════════════════════════════════
//  PageHeader — გვერდის სათაური (breadcrumb + title + actions)
//  გამოიყენება: ყველა შიდა გვერდზე
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  icon?: React.ReactNode;
  animated?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  icon,
  animated = true,
  className = '',
}: PageHeaderProps) {
  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn('w-full py-6 lg:py-8', className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 text-xs lg:text-sm text-muted mb-4 overflow-x-auto scrollbar-hide"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((item, i) => {
            const isLast = i === breadcrumbs.length - 1;

            return (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-lime transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-text font-medium' : ''}>
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <ChevronRight size={12} className="text-muted/50 shrink-0" />
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Main content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon && (
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center text-ink shrink-0">
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-bold text-text tracking-tight leading-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm lg:text-base text-muted mt-2 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Wrapper>
  );
}

export default PageHeader;
