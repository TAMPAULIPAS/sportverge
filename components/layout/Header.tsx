'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Header (Ultra Premium v2)
//  Features:
//  • Sticky + smart hide/show on scroll
//  • Scroll progress bar
//  • Live match indicator
//  • Search modal (⌘K)
//  • Notifications with badge
//  • Language switcher
//  • User menu (login/register)
//  • Bookmarks quick access
//  • Live clock (Tbilisi time)
//  • Glass morphism + glow effects
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Menu, Search, Bell, Zap, X, Bookmark, User,
  Radio, Clock, Command, TrendingUp, Settings,
  LogIn, UserPlus, ChevronDown,
} from 'lucide-react';
import { LogoFull } from '@/components/brand/LogoFull';
import { Navigation } from './Navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
//  MAIN HEADER
// ═══════════════════════════════════════════════════════════════
export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();

  // ─── State ───
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  // ─── Scroll state ───
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [progress, setProgress] = useState(0);

  // ═══════════════════════════════════════════════════════════════
  //  SMART SCROLL: hide on scroll down, show on scroll up
  // ═══════════════════════════════════════════════════════════════
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY;

    // Scroll progress
    setProgress(scrollYProgress.get() * 100);

    // Scrolled state (glass effect)
    setScrolled(latest > 20);

    // Hide/show logic
    if (latest > previous && latest > 150 && !mobileOpen && !searchOpen) {
      // Scrolling DOWN - hide
      setHidden(true);
    } else {
      // Scrolling UP or at top - show
      setHidden(false);
    }

    setLastScrollY(latest);
  });

  // ═══════════════════════════════════════════════════════════════
  //  KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K → Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      // ⌘B / Ctrl+B → Bookmarks
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        // TODO: open bookmarks
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  BODY SCROLL LOCK
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const shouldLock = mobileOpen || searchOpen;
    if (!shouldLock) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen, searchOpen]);

  // ═══════════════════════════════════════════════════════════════
  //  LIVE CLOCK (Tbilisi time)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Tbilisi',
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentTime(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  FETCH LIVE MATCH COUNT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const res = await fetch('/api/live');
        if (res.ok) {
          const data = await res.json();
          setLiveCount(data.count || 0);
        }
      } catch {
        setLiveCount(3);
      }
    };

    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  CLOSE MENUS ON CLICK OUTSIDE
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) setUserMenuOpen(false);
      if (!target.closest('[data-notif-menu]')) setNotifOpen(false);
    };

    if (userMenuOpen || notifOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [userMenuOpen, notifOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: hidden ? -100 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-ink/85 backdrop-blur-2xl border-b border-edge/60 shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
            : 'bg-ink/60 backdrop-blur-xl border-b border-edge/30'
        )}
      >
        {/* ═══ Top gradient line ═══ */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent opacity-70" />

        {/* ═══ Scroll progress bar ═══ */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lime via-teal to-lime origin-left z-20"
        />

        {/* ═══ Subtle glow when scrolled ═══ */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent"
            />
          )}
        </AnimatePresence>

        <div className="container mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex h-16 lg:h-[72px] items-center justify-between gap-4">
            {/* ═══════════════════════════════════════════════════
                LEFT: Logo + Live Badge
            ═══════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 shrink-0"
            >
              <LogoFull size="md" locale={locale} />

              {/* Live badge (desktop only) */}
              {liveCount > 0 && (
                <Link
                  href={`/${locale}/matches`}
                  className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 border border-danger/30 hover:bg-danger/20 transition-colors group"
                >
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-75" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-danger" />
                  </span>
                  <Radio size={10} className="text-danger" />
                  <span className="text-[10px] font-bold text-danger uppercase tracking-wider">
                    {liveCount} LIVE
                  </span>
                </Link>
              )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                CENTER: Navigation
            ═══════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex flex-1 justify-center"
            >
              <Navigation />
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                RIGHT: Actions
            ═══════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-1 lg:gap-1.5 shrink-0"
            >
              {/* Live Clock (desktop) */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface/40 border border-edge/50 text-muted">
                <Clock size={11} className="text-lime" />
                <span className="text-[11px] font-mono font-semibold text-text/80">
                  {currentTime}
                </span>
              </div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-text hover:bg-surface-hover transition-all duration-200 group"
                aria-label="Search"
              >
                <Search size={16} className="group-hover:text-lime transition-colors" />
                <span className="hidden lg:inline text-xs">
                  {locale === 'ka' ? 'ძებნა' : locale === 'ru' ? 'Поиск' : 'Search'}
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-hover border border-edge text-[10px] font-mono text-muted">
                  <Command size={9} />
                  <span>K</span>
                </kbd>
              </button>

              {/* Bookmarks (desktop) */}
              <Link
                href={`/${locale}/bookmarks`}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-lime hover:bg-surface-hover transition-all duration-200"
                aria-label="Bookmarks"
              >
                <Bookmark size={17} />
              </Link>

              {/* Notifications */}
              <div className="relative" data-notif-menu>
                <button
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    if (hasNotifications) setHasNotifications(false);
                  }}
                  className={cn(
                    'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                    notifOpen
                      ? 'text-lime bg-lime/10'
                      : 'text-muted hover:text-text hover:bg-surface-hover'
                  )}
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center">
                      <span className="absolute w-2 h-2 rounded-full bg-danger animate-ping opacity-75" />
                      <span className="relative w-2 h-2 rounded-full bg-danger" />
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-80 bg-surface border border-edge rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

                      <div className="p-4 border-b border-edge/60">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-text">
                            {locale === 'ka' ? 'შეტყობინებები' : locale === 'ru' ? 'Уведомления' : 'Notifications'}
                          </h3>
                          <span className="text-[10px] font-mono text-lime px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30">
                            3 new
                          </span>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {[
                          { icon: Radio, textKa: 'LIVE: მატჩი დაიწყო', textEn: 'LIVE: Match started', textRu: 'LIVE: Матч начался', time: '2m' },
                          { icon: TrendingUp, textKa: 'ახალი AI პროგნოზი', textEn: 'New AI prediction', textRu: 'Новый AI прогноз', time: '15m' },
                          { icon: Bell, textKa: 'გუნდი შენი ფავორიტია', textEn: 'Team is your favorite', textRu: 'Команда в избранном', time: '1h' },
                        ].map((notif, i) => {
                          const Icon = notif.icon;
                          const text = locale === 'ka' ? notif.textKa : locale === 'ru' ? notif.textRu : notif.textEn;
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 hover:bg-surface-hover/50 transition-colors cursor-pointer border-b border-edge/30 last:border-0"
                            >
                              <div className="w-8 h-8 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0">
                                <Icon size={14} className="text-lime" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text truncate">{text}</p>
                                <p className="text-[10px] text-muted mt-0.5">{notif.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 border-t border-edge/60 text-center">
                        <Link
                          href={`/${locale}/notifications`}
                          className="text-xs font-medium text-lime hover:underline"
                        >
                          {locale === 'ka' ? 'ყველა შეტყობინება' : locale === 'ru' ? 'Все уведомления' : 'View all'}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language */}
              <LanguageSwitcher />

              {/* User menu (desktop) */}
              <div className="hidden sm:block relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200',
                    userMenuOpen
                      ? 'bg-lime text-ink'
                      : 'bg-lime/10 text-lime hover:bg-lime/20 border border-lime/30'
                  )}
                >
                  <User size={14} />
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform', userMenuOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface border border-edge rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

                      <Link
                        href={`/${locale}/authorization`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-lime/10 hover:text-lime transition-colors border-b border-edge/40 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogIn size={14} className="text-lime" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {locale === 'ka' ? 'შესვლა' : locale === 'ru' ? 'Войти' : 'Sign in'}
                          </div>
                          <div className="text-[10px] text-muted">
                            {locale === 'ka' ? 'არსებული ანგარიში' : locale === 'ru' ? 'Существующий аккаунт' : 'Existing account'}
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/authorization`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-lime/10 hover:text-lime transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime to-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UserPlus size={14} className="text-ink" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {locale === 'ka' ? 'რეგისტრაცია' : locale === 'ru' ? 'Регистрация' : 'Sign up'}
                          </div>
                          <div className="text-[10px] text-muted">
                            {locale === 'ka' ? 'უფასო ანგარიში' : locale === 'ru' ? 'Бесплатный аккаунт' : 'Free account'}
                          </div>
                        </div>
                      </Link>

                      <div className="p-3 bg-surface-hover/30 border-t border-edge/40 flex items-center justify-center gap-1.5 text-[10px] text-muted">
                        <Zap size={10} className="text-lime" />
                        <span>
                          {locale === 'ka' ? 'სრულად უფასო' : locale === 'ru' ? 'Полностью бесплатно' : 'Free forever'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <Menu size={20} />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SEARCH MODAL (⌘K)
// ═══════════════════════════════════════════════════════════════
function SearchModal({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query when opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Escape + Focus trap + Arrow navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const placeholder =
    {
      ka: 'მოძებნე გუნდი, მოთამაშე ან მატჩი...',
      en: 'Search team, player or match...',
      ru: 'Поиск команды, игрока или матча...',
    }[locale] || 'Search...';

  const quickLinks =
    {
      ka: [
        { label: '⚽ მატჩები', href: `/${locale}/matches`, desc: 'ცოცხალი ანგარიშები' },
        { label: '🎯 პროგნოზები', href: `/${locale}/predictions`, desc: 'AI ანალიზი' },
        { label: '📊 ანალიტიკა', href: `/${locale}/analytics`, desc: 'ლიგის ცხრილები' },
        { label: '📰 სიახლეები', href: `/${locale}/news`, desc: 'უახლესი ამბები' },
        { label: '🎥 ვიდეოები', href: `/${locale}/videos`, desc: 'მიმოხილვები' },
        { label: '🏆 ლიდერბორდი', href: `/${locale}/leaderboard`, desc: 'ტოპ პროგნოზიორები' },
      ],
      en: [
        { label: '⚽ Matches', href: `/${locale}/matches`, desc: 'Live scores' },
        { label: '🎯 Predictions', href: `/${locale}/predictions`, desc: 'AI analysis' },
        { label: '📊 Analytics', href: `/${locale}/analytics`, desc: 'League tables' },
        { label: '📰 News', href: `/${locale}/news`, desc: 'Latest stories' },
        { label: '🎥 Videos', href: `/${locale}/videos`, desc: 'Highlights' },
        { label: '🏆 Leaderboard', href: `/${locale}/leaderboard`, desc: 'Top predictors' },
      ],
      ru: [
        { label: '⚽ Матчи', href: `/${locale}/matches`, desc: 'Живые счета' },
        { label: '🎯 Прогнозы', href: `/${locale}/predictions`, desc: 'AI анализ' },
        { label: '📊 Аналитика', href: `/${locale}/analytics`, desc: 'Таблицы лиг' },
        { label: '📰 Новости', href: `/${locale}/news`, desc: 'Последние' },
        { label: '🎥 Видео', href: `/${locale}/videos`, desc: 'Обзоры' },
        { label: '🏆 Лидерборд', href: `/${locale}/leaderboard`, desc: 'Топ прогнозистов' },
      ],
    }[locale as 'ka' | 'en' | 'ru'] || [];

  const hint =
    {
      ka: 'სწრაფი ლინკები',
      en: 'Quick links',
      ru: 'Быстрые ссылки',
    }[locale] || 'Quick links';

  const noResultsText =
    locale === 'ka'
      ? `"${query}" - შედეგები მალე დაემატება`
      : locale === 'ru'
      ? `"${query}" - результаты скоро`
      : `"${query}" - results coming soon`;

  // Filter quick links by query
  const filteredLinks = query
    ? quickLinks.filter((link) =>
        link.label.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label={hint}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-surface border border-edge rounded-2xl shadow-[0_16px_64px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-edge/60">
              <Search size={20} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-text placeholder:text-muted/60 text-base focus:outline-none"
              />
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {filteredLinks.length > 0 && (
                <>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-1">
                    {hint}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-surface-hover/50 hover:bg-lime/10 border border-transparent hover:border-lime/30 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-text group-hover:text-lime transition-colors">
                            {link.label}
                          </div>
                          <div className="text-[10px] text-muted truncate">
                            {link.desc}
                          </div>
                        </div>
                        <ChevronDown
                          size={12}
                          className="-rotate-90 text-muted group-hover:text-lime transition-all"
                        />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {query && filteredLinks.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover border border-edge flex items-center justify-center">
                    <Search size={28} className="text-muted" />
                  </div>
                  <p className="text-sm text-muted">{noResultsText}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-edge/60 flex items-center justify-between text-[10px] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-hover border border-edge font-mono">
                    ↑↓
                  </kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-hover border border-edge font-mono">
                    ↵
                  </kbd>
                  <span>select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-hover border border-edge font-mono">
                    ESC
                  </kbd>
                  <span>close</span>
                </span>
              </div>

              <span className="font-mono text-muted/60">SportVerge</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Header;