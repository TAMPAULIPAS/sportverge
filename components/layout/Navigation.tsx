'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Navigation (Desktop + Mobile)
//  Framer Motion + Icon-ები + Hover + Live dot
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Trophy,
  Target,
  BarChart3,
  Newspaper,
  Play,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  key: string;
  icon: typeof Home;
  hasDot?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', key: 'home', icon: Home, hasDot: true },
  { href: '/matches', key: 'matches', icon: Trophy },
  { href: '/predictions', key: 'predictions', icon: Target },
  { href: '/analytics', key: 'analytics', icon: BarChart3 },
  { href: '/news', key: 'news', icon: Newspaper },
  { href: '/videos', key: 'videos', icon: Play },
];

export function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLinkActive = (href: string) => {
    const fullHref = `/${locale}${href}`;
    if (href === '/') return pathname === fullHref;
    return pathname === fullHref || pathname.startsWith(fullHref);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          DESKTOP Navigation
      ═══════════════════════════════════════════════════ */}
      <nav className="hidden lg:flex items-center gap-0.5">
        {NAV_LINKS.map((link) => {
          const fullHref = `/${locale}${link.href}`;
          const isActive = isLinkActive(link.href);
          const Icon = link.icon;
          const isHovered = hoveredKey === link.key;

          return (
            <Link
              key={link.key}
              href={fullHref}
              onMouseEnter={() => setHoveredKey(link.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                isActive ? 'text-lime' : 'text-muted hover:text-text'
              )}
            >
              {/* Hover background */}
              {isHovered && !isActive && (
                <motion.span
                  layoutId="nav-hover-bg"
                  className="absolute inset-0 bg-surface-hover rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon
                size={15}
                className={cn(
                  'shrink-0 transition-transform duration-200',
                  isActive && 'text-lime',
                  isHovered && !isActive && 'scale-110'
                )}
              />

              {/* Label */}
              <span className="whitespace-nowrap">{t(link.key)}</span>

              {/* Live dot */}
              {link.hasDot && (
                <span className="relative flex items-center justify-center ml-0.5">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-lime animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-lime" />
                </span>
              )}

              {/* Active underline */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-underline"
                  className="absolute -bottom-0.5 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-lime to-teal rounded-full shadow-[0_0_8px_rgba(217,249,157,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════
          MOBILE Menu Button
      ═══════════════════════════════════════════════════ */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text hover:border-lime/40 hover:bg-surface transition-all"
        aria-label="მენიუს გახსნა"
      >
        <Menu size={20} />
      </button>

      {/* ═══════════════════════════════════════════════════
          MOBILE Menu Drawer
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-[100] bg-ink/80 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-[101] w-full max-w-sm bg-ink border-l border-edge shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-edge">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-lime to-teal shadow-[0_0_12px_rgba(217,249,157,0.7)]" />
                  <h2 className="font-heading text-lg font-bold text-text">
                    მენიუ
                  </h2>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-lg bg-surface/60 border border-edge flex items-center justify-center text-muted hover:text-text hover:border-lime/40 transition-all"
                  aria-label="მენიუს დახურვა"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <nav className="p-4 space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const fullHref = `/${locale}${link.href}`;
                  const isActive = isLinkActive(link.href);
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={fullHref}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all',
                          isActive
                            ? 'bg-lime/10 border border-lime/30 text-lime'
                            : 'text-muted hover:text-text hover:bg-surface-hover border border-transparent'
                        )}
                      >
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                            isActive
                              ? 'bg-gradient-to-br from-lime to-teal'
                              : 'bg-surface/60 border border-edge group-hover:border-lime/30'
                          )}
                        >
                          <Icon
                            size={16}
                            className={cn(
                              isActive ? 'text-ink' : 'text-lime'
                            )}
                          />
                        </div>

                        <span className="flex-1">{t(link.key)}</span>

                        {link.hasDot && (
                          <span className="relative flex items-center justify-center">
                            <span className="absolute w-2 h-2 rounded-full bg-lime animate-ping opacity-75" />
                            <span className="relative w-2 h-2 rounded-full bg-lime" />
                          </span>
                        )}

                        {isActive && (
                          <span className="w-1 h-6 rounded-full bg-lime shadow-[0_0_8px_rgba(217,249,157,0.8)]" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;