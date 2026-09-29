'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Footer (Clean & Elegant)
//  მხოლოდ რეალური ინფორმაცია — ყველაფერი დანარჩენი მოგვიანებით
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  Construction,
  Rocket,
  Star,
  Globe,
  Github,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/layout/Container';

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    // Sections
    product: isKa ? 'პროდუქტი' : isRu ? 'Продукт' : 'Product',
    about: isKa ? 'ჩვენ შესახებ' : isRu ? 'О нас' : 'About',

    // Nav items
    matches: isKa ? 'მატჩები' : isRu ? 'Матчи' : 'Matches',
    predictions: isKa ? 'პროგნოზები' : isRu ? 'Прогнозы' : 'Predictions',
    analytics: isKa ? 'ანალიტიკა' : isRu ? 'Аналитика' : 'Analytics',
    news: isKa ? 'სიახლეები' : isRu ? 'Новости' : 'News',
    videos: isKa ? 'ვიდეოები' : isRu ? 'Видео' : 'Videos',
    leaderboard: isKa ? 'ლიდერბორდი' : isRu ? 'Лидерборд' : 'Leaderboard',

    // About
    aboutText: isKa
      ? 'AI-ზე დაფუძნებული სპორტული პლატფორმა — ცოცხალი ანგარიშები, ჭკვიანი პროგნოზები და რეალურ დროში ანალიზი'
      : isRu
      ? 'Спортивная платформа на основе AI — живые счета, умные прогнозы и аналитика в реальном времени'
      : 'AI-powered sports platform — live scores, smart predictions and real-time analytics',

    // Status
    activeDev: isKa ? 'აქტიური განვითარება' : isRu ? 'Активная разработка' : 'Active development',
    freePlatform: isKa ? 'სრულად უფასო' : isRu ? 'Полностью бесплатно' : 'Free forever',
    languages: isKa ? '3 ენა' : isRu ? '3 языка' : '3 languages',
    underConstruction: isKa
      ? 'პლატფორმა აქტიურად ვითარდება — მალე ბევრი ახალი ფუნქცია დაემატება'
      : isRu
      ? 'Платформа активно развивается — скоро много новых функций'
      : 'Platform is actively developing — many new features coming soon',

    // Bottom
    madeWith: isKa ? 'შექმნილია' : isRu ? 'Сделано с' : 'Made with',
    love: isKa ? 'სიყვარულით' : isRu ? 'любовью' : 'love',
    in: isKa ? 'საქართველოში' : isRu ? 'в Грузии' : 'in Georgia',
    allRights: isKa ? 'ყველა უფლება დაცულია' : isRu ? 'Все права защищены' : 'All rights reserved',
    version: isKa ? 'ვერსია' : isRu ? 'Версия' : 'Version',
  };
}

// ═══════════════════════════════════════════════════════════════
//  FOOTER LINK
// ═══════════════════════════════════════════════════════════════
function FooterLink({
  href,
  label,
  locale,
}: {
  href: string;
  label: string;
  locale: string;
}) {
  return (
    <li>
      <Link
        href={`/${locale}${href}`}
        className="group inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors duration-200"
      >
        <ChevronRight
          size={12}
          className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-lime shrink-0"
        />
        <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
      </Link>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STATUS BADGE
// ═══════════════════════════════════════════════════════════════
function StatusBadge({
  icon: Icon,
  text,
  color,
}: {
  icon: typeof Rocket;
  text: string;
  color: 'lime' | 'teal' | 'gold';
}) {
  const colorMap = {
    lime: { text: 'text-lime', bg: 'bg-lime/10', border: 'border-lime/30' },
    teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30' },
    gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
  };
  const c = colorMap[color];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${c.bg} ${c.border} text-[10px] font-bold text-muted uppercase tracking-wider`}
    >
      <Icon size={10} className={c.text} />
      {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN FOOTER
// ═══════════════════════════════════════════════════════════════
export function Footer() {
  const locale = useLocale();
  const t = getT(locale);
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { href: '/matches', label: t.matches },
    { href: '/predictions', label: t.predictions },
    { href: '/analytics', label: t.analytics },
    { href: '/news', label: t.news },
    { href: '/videos', label: t.videos },
    { href: '/leaderboard', label: t.leaderboard },
  ];

  return (
    <footer className="relative mt-20 border-t border-edge/50 bg-gradient-to-b from-transparent to-surface/40">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-lime/[0.03] rounded-full blur-[200px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-teal/[0.03] rounded-full blur-[200px]" />
      </div>

      <Container size="lg" padding>
        {/* ═══════════════════════════════════════════════════
            MAIN FOOTER GRID
        ═══════════════════════════════════════════════════ */}
        <div className="relative pt-14 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* ─── Brand Column ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <Logo
                size={52}
                href={`/${locale}`}
                rounded="2xl"
                glow
                className="mb-6"
              />

              <p className="text-sm text-muted leading-relaxed max-w-lg mb-6">
                {t.aboutText}
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <StatusBadge icon={Rocket} text={t.activeDev} color="gold" />
                <StatusBadge icon={Star} text={t.freePlatform} color="lime" />
                <StatusBadge icon={Globe} text={t.languages} color="teal" />
              </div>

              {/* Under construction notice */}
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent p-4 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                    <Construction size={14} className="text-gold" />
                  </div>
                  <p className="text-xs text-muted/90 leading-relaxed">
                    {t.underConstruction}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ─── Product Links ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <h3 className="font-heading text-sm font-bold text-text uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-lime" />
                {t.product}
              </h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {productLinks.map((link) => (
                  <FooterLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    locale={locale}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            BOTTOM BAR
        ═══════════════════════════════════════════════════ */}
        <div className="relative py-6 border-t border-edge/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-mono">© {currentYear}</span>
            <span className="font-heading font-bold text-text">
              Sport<span className="text-lime">Verge</span>
            </span>
            <span className="hidden sm:inline text-muted/50">·</span>
            <span className="hidden sm:inline">{t.allRights}</span>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>{t.madeWith}</span>
            <Heart size={11} className="text-danger fill-danger animate-pulse" />
            <span>{t.love}</span>
            <span className="text-text">·</span>
            <span className="font-heading font-bold text-lime">{t.in}</span>
          </div>

          {/* Version */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted/60">
            <span>{t.version}</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-edge text-lime">
              1.0.0
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;