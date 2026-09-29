'use client';

// ═══════════════════════════════════════════════════════════════
//  MobileMenu — მობილური ნავიგაციის მენიუ (Premium)
//  მარჯვნიდან სრიალებს, glass effect, smooth ანიმაციები
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  Trophy,
  TrendingUp,
  BarChart3,
  Newspaper,
  User,
  Settings,
  LogIn,
  Zap,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { LogoFull } from '@/components/brand/LogoFull';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// ნავიგაციის პუნქტები (მთავარი)
// ─────────────────────────────────────────────
const navItems = [
  { href: '/', key: 'home', icon: Home, hasDot: true },
  { href: '/matches', key: 'matches', icon: Trophy, hasDot: false },
  { href: '/predictions', key: 'predictions', icon: TrendingUp, hasDot: false },
  { href: '/analytics', key: 'analytics', icon: BarChart3, hasDot: false },
  { href: '/news', key: 'news', icon: Newspaper, hasDot: false },
];

// ─────────────────────────────────────────────
// User პუნქტები (hardcoded ლეიბლებით 3 ენაზე)
// ─────────────────────────────────────────────
const userItems = {
  ka: [
    { href: '/profile', icon: User, label: 'პროფილი' },
    { href: '/settings', icon: Settings, label: 'პარამეტრები' },
  ],
  en: [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ],
  ru: [
    { href: '/profile', icon: User, label: 'Профиль' },
    { href: '/settings', icon: Settings, label: 'Настройки' },
  ],
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');

  const userNav = userItems[locale as 'ka' | 'en' | 'ru'] || userItems.ka;

  // ─────────────────────────────────────────────
  // ESC ღილაკი + body scroll lock
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  // ─────────────────────────────────────────────
  // ლინკზე დაჭერისას დახურვა
  // ─────────────────────────────────────────────
  const handleLinkClick = () => {
    onClose();
  };

  // ─────────────────────────────────────────────
  // Active link check
  // ─────────────────────────────────────────────
  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`;
    if (href === '/') return pathname === fullHref;
    return pathname.startsWith(fullHref);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ─── Overlay ─── */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-ink/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ─── Panel ─── */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-sm bg-ink border-l border-edge lg:hidden overflow-y-auto"
          >
            {/* Top gradient line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

            {/* ─── Header ─── */}
            <div className="flex items-center justify-between p-5 border-b border-edge/50">
              <LogoFull size="md" locale={locale} href={null} />

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* ─── Main nav ─── */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const fullHref = `/${locale}${item.href}`;
                const active = isActive(item.href);

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link
                      href={fullHref}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        active
                          ? 'bg-lime/10 text-lime border border-lime/20'
                          : 'text-text hover:bg-surface-hover'
                      )}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{t(item.key)}</span>
                      {item.hasDot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* ─── Divider ─── */}
            <div className="mx-4 h-px bg-edge/50" />

            {/* ─── User nav ─── */}
            <nav className="p-4 space-y-1">
              {userNav.map((item) => {
                const Icon = item.icon;
                const fullHref = `/${locale}${item.href}`;

                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-text hover:bg-surface-hover transition-colors"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ─── Language switcher ─── */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center py-3 rounded-xl bg-surface/60 border border-edge">
                <LanguageSwitcher />
              </div>
            </div>

            {/* ─── Bottom CTAs ─── */}
            <div className="p-4 mt-2 border-t border-edge/50 space-y-2">
              <Link
                href={`/${locale}/login`}
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-text border border-edge hover:border-lime/40 hover:bg-surface-hover transition-colors"
              >
                <LogIn size={16} />
                <span>{t('login')}</span>
              </Link>

              <Link
                href={`/${locale}/predictions`}
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-ink bg-lime hover:bg-lime/90 transition-all shadow-[0_0_20px_rgba(217,249,157,0.3)]"
              >
                <Zap size={16} fill="currentColor" />
                <span>{t('getStarted')}</span>
              </Link>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
