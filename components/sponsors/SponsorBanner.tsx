// ═══════════════════════════════════════════════════════════════
//  SportVerge — Sponsor Banner
//  ─────────────────────────────────────────────────────────────
//  📢 სარეკლამო ბანერი სპონსორებისთვის
//     - Top banner (leaderboard 728x90 style)
//     - Sidebar banner (300x250 style)
//     - Inline banner (full-width)
//     - Sponsor logo strip
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  SPONSOR CONFIG — აქ შეცვალე შენი სპონსორის ინფო
// ═══════════════════════════════════════════════════════════════

export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  logo?: string;          // /images/sponsors/your-logo.png
  ctaText: string;
  ctaUrl: string;
  bgImage?: string;       // optional background
  accentColor: 'lime' | 'teal' | 'gold' | 'red';
}

export const SPONSORS: Sponsor[] = [
  {
    id: 'judo-kimono',
    name: 'Judo Kimono',
    tagline: 'პროფესიონალური ძიუდოს კიმანო — ხარისხი, რომელიც გრძნობა',
    logo: '/images/sponsors/judo-kimono.png',
    ctaText: 'შეიძინე ახლა',
    ctaUrl: 'https://example.com/judo-kimono',
    bgImage: '/images/sponsors/judo-bg.jpg',
    accentColor: 'gold',
  },
];

// ═══════════════════════════════════════════════════════════════
//  TOP BANNER — ჰორიზონტალური (728x90 style)
// ═══════════════════════════════════════════════════════════════

interface TopBannerProps {
  sponsor?: Sponsor;
  locale?: string;
}

export function SponsorTopBanner({ sponsor = SPONSORS[0], locale = 'ka' }: TopBannerProps) {
  const accentMap = {
    lime: { text: 'text-lime', border: 'border-lime/40', glow: 'from-lime/10 to-lime/0', btn: 'bg-lime text-ink hover:shadow-[0_0_30px_rgba(217,249,157,0.5)]' },
    teal: { text: 'text-teal', border: 'border-teal/40', glow: 'from-teal/10 to-teal/0', btn: 'bg-teal text-ink hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]' },
    gold: { text: 'text-gold', border: 'border-gold/40', glow: 'from-gold/10 to-gold/0', btn: 'bg-gold text-ink hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]' },
    red: { text: 'text-red-400', border: 'border-red-500/40', glow: 'from-red-500/10 to-red-500/0', btn: 'bg-red-500 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]' },
  };
  const a = accentMap[sponsor.accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border ${a.border} bg-gradient-to-r ${a.glow} backdrop-blur-xl`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40" />

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-5">
        <div className="flex items-center gap-4 min-w-0">
          {sponsor.logo ? (
            <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-surface/80 border border-edge/50 shrink-0">
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                fill
                sizes="64px"
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-xl bg-surface/80 border ${a.border} flex items-center justify-center shrink-0`}>
              <Sparkles size={20} className={a.text} />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] uppercase tracking-widest font-black ${a.text} opacity-80`}>
                SPONSOR
              </span>
            </div>
            <h3 className="font-heading text-base lg:text-lg font-black text-text truncate">
              {sponsor.name}
            </h3>
            <p className="text-xs lg:text-sm text-muted truncate">
              {sponsor.tagline}
            </p>
          </div>
        </div>

        <Link
          href={sponsor.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`group shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl ${a.btn} font-black text-xs uppercase tracking-wider transition-all`}
        >
          <span>{sponsor.ctaText}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SIDEBAR BANNER — ვერტიკალური (300x250 style)
// ═══════════════════════════════════════════════════════════════

export function SponsorSidebarBanner({ sponsor = SPONSORS[0] }: TopBannerProps) {
  return (
    <Link
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent backdrop-blur-xl hover:border-gold/70 transition-all hover:-translate-y-1"
    >
      <div className="p-6 text-center">
        <div className="text-[9px] uppercase tracking-widest font-black text-gold opacity-80 mb-4">
          SPONSORED
        </div>

        {sponsor.logo && (
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src={sponsor.logo}
              alt={sponsor.name}
              fill
              sizes="80px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        <h4 className="font-heading text-lg font-black text-text mb-2">
          {sponsor.name}
        </h4>

        <p className="text-xs text-muted leading-relaxed mb-4">
          {sponsor.tagline}
        </p>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold group-hover:gap-2.5 transition-all">
          <span>{sponsor.ctaText}</span>
          <ExternalLink size={11} />
        </span>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  INLINE BANNER — Full-width (leaderboard style)
// ═══════════════════════════════════════════════════════════════

export function SponsorInlineBanner({ sponsor = SPONSORS[0] }: TopBannerProps) {
  return (
    <Link
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-surface via-gold/5 to-surface backdrop-blur-xl hover:border-gold/60 transition-all"
    >
      {sponsor.bgImage && (
        <div className="absolute inset-0 opacity-20">
          <Image src={sponsor.bgImage} alt="" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {sponsor.logo && (
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 shrink-0">
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                fill
                sizes="80px"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-gold mb-1">
              ⭐ SPONSORED BY
            </div>
            <h3 className="font-heading text-xl lg:text-2xl font-black text-text mb-1">
              {sponsor.name}
            </h3>
            <p className="text-sm text-muted">{sponsor.tagline}</p>
          </div>
        </div>

        <span className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-ink font-black text-sm group-hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all">
          <span>{sponsor.ctaText}</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SPONSOR LOGO STRIP — პატარა ლოგოები (Footer-ისთვის)
// ═══════════════════════════════════════════════════════════════

interface LogoStripProps {
  sponsors?: Sponsor[];
}

export function SponsorLogoStrip({ sponsors = SPONSORS }: LogoStripProps) {
  if (sponsors.length === 0) return null;

  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      {sponsors.map((s) => (
        <Link
          key={s.id}
          href={s.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative h-12 w-28 opacity-60 hover:opacity-100 transition-opacity"
        >
          {s.logo ? (
            <Image src={s.logo} alt={s.name} fill sizes="112px" className="object-contain" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-xs font-bold text-muted">
              {s.name}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}