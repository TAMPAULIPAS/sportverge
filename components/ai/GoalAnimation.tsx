// ═══════════════════════════════════════════════════════════════
//  SportVerge — GoalAnimation v2
//  ─────────────────────────────────────────────────────────────
//  ⚽ 3D კარის ანიმაცია ბურთით — მრავალ რეჟიმში
//
//  🎬 VARIANTS:
//     • hero    — დიდი, hero სექციისთვის (promo)
//     • card    — match card-ის ზომა
//     • inline  — ტექსტის გვერდით (small)
//     • loader  — loading state-ისთვის
//     • banner  — promo banner
//     • minimal — მხოლოდ კარი, ბურთის გარეშე
//
//  🎨 THEMES:
//     • lime   — default (lime → teal)
//     • gold   — gold → red (final/derby)
//     • ice    — teal → blue (calm)
//     • fire   — red → orange (intense)
//
//  ✨ Features:
//     - Auto-loop with configurable delay
//     - Click to replay
//     - Score / Miss modes
//     - Goal text flash (multi-language)
//     - Particles burst
//     - Shake effect on goal
//     - Trail effect
//     - Ambient glow
//     - Reduced motion support
//     - Fully responsive
//     - SVG based (crisp at any size)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

export type GoalVariant =
  | "hero"
  | "card"
  | "inline"
  | "loader"
  | "banner"
  | "minimal";

export type GoalTheme = "lime" | "gold" | "ice" | "fire";

export type GoalSize = "sm" | "md" | "lg" | "xl";

interface GoalAnimationProps {
  /** ჩართული ანიმაცია */
  active?: boolean;
  /** ზომა */
  size?: GoalSize;
  /** ვიზუალური ვარიანტი */
  variant?: GoalVariant;
  /** ფერის თემა */
  theme?: GoalTheme;
  /** ბურთი კარში შედის? (false = miss) */
  score?: boolean;
  /** "GOAL!" ტექსტის ენა */
  locale?: "ka" | "en" | "ru";
  /** "GOAL!" ტექსტის ჩვენება */
  showText?: boolean;
  /** Particles-ის ჩვენება */
  showParticles?: boolean;
  /** Auto-loop ინტერვალი (ms). 0 = გამორთული */
  loopDelay?: number;
  /** Click-ზე replay */
  replayOnClick?: boolean;
  /** ხელის cursor */
  clickable?: boolean;
  /** Custom class */
  className?: string;
  /** onAnimationComplete callback */
  onComplete?: () => void;
}

// ─────────────────────────────────────────────────────────────
//  📏 SIZES
// ─────────────────────────────────────────────────────────────

const SIZES: Record<
  GoalSize,
  { ball: number; stroke: number; netOpacity: number; glow: number }
> = {
  sm: { ball: 14, stroke: 1.5, netOpacity: 0.18, glow: 6 },
  md: { ball: 22, stroke: 2, netOpacity: 0.25, glow: 10 },
  lg: { ball: 32, stroke: 2.5, netOpacity: 0.28, glow: 15 },
  xl: { ball: 44, stroke: 3, netOpacity: 0.3, glow: 22 },
};

// ─────────────────────────────────────────────────────────────
//  🎨 THEMES
//  ─────────────────────────────────────────────────────────────

const THEMES: Record<
  GoalTheme,
  {
    from: string;
    to: string;
    particle: string;
    text: string;
    glow: string;
    ball: string;
  }
> = {
  lime: {
    from: "#D9F99D",
    to: "#14B8A6",
    particle: "#D9F99D",
    text: "from-lime to-teal",
    glow: "rgba(217,249,157,0.6)",
    ball: "#F8FAFC",
  },
  gold: {
    from: "#FBBF24",
    to: "#EF4444",
    particle: "#FBBF24",
    text: "from-amber-300 to-red-500",
    glow: "rgba(251,191,36,0.6)",
    ball: "#FEF3C7",
  },
  ice: {
    from: "#14B8A6",
    to: "#3B82F6",
    particle: "#5EEAD4",
    text: "from-teal-300 to-blue-500",
    glow: "rgba(20,184,166,0.6)",
    ball: "#E0F2FE",
  },
  fire: {
    from: "#EF4444",
    to: "#F97316",
    particle: "#F87171",
    text: "from-red-400 to-orange-500",
    glow: "rgba(239,68,68,0.6)",
    ball: "#FEF2F2",
  },
};

// ─────────────────────────────────────────────────────────────
//  🌍 GOAL TEXT (multi-language)
//  ─────────────────────────────────────────────────────────────

const GOAL_TEXT: Record<string, string> = {
  ka: "გოლი!",
  en: "GOAL!",
  ru: "ГОЛ!",
};

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN COMPONENT
//  ─────────────────────────────────────────────────────────────

export function GoalAnimation({
  active = true,
  size = "md",
  variant = "card",
  theme = "lime",
  score = true,
  locale = "ka",
  showText = true,
  showParticles = true,
  loopDelay = 1500,
  replayOnClick = false,
  clickable = false,
  className = "",
  onComplete,
}: GoalAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(active);

  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `goalGrad-${uniqueId}`;
  const glowId = `goalGlow-${uniqueId}`;

  const s = SIZES[size];
  const t = THEMES[theme];
  const repeat = active && loopDelay > 0 && !prefersReducedMotion;
  const repeatDelay = loopDelay / 1000;

  const animationDuration = variant === "inline" ? 2 : 2.8;

  // ─── Replay handler ───
  const handleReplay = useCallback(() => {
    if (!replayOnClick) return;
    setReplayKey((k) => k + 1);
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, [replayOnClick]);

  // ─── onComplete after first run ───
  useEffect(() => {
    if (!onComplete || !isAnimating) return;
    const timer = setTimeout(onComplete, animationDuration * 1000);
    return () => clearTimeout(timer);
  }, [isAnimating, onComplete, animationDuration]);

  // ─── Variant-specific container ───
  const containerStyles: Record<GoalVariant, string> = {
    hero: "w-full max-w-md mx-auto aspect-[3/2]",
    card: "w-full aspect-[3/2]",
    inline: "w-32 h-24",
    loader: "w-24 h-24",
    banner: "w-full max-w-sm aspect-[16/9]",
    minimal: "w-full aspect-[3/2]",
  };

  // ─── Ball animation paths by variant ───
  const ballAnimate = prefersReducedMotion
    ? { opacity: 0.4 }
    : score
    ? {
        left: ["-15%", "15%", "45%", "58%"],
        top: ["75%", "45%", "58%", "68%"],
        scale: [1, 0.85, 0.65, 0.4],
        rotate: [0, 180, 360, 540],
        opacity: [0, 1, 1, 0.9],
      }
    : {
        left: ["-15%", "15%", "65%", "115%"],
        top: ["75%", "40%", "0%", "-25%"],
        scale: [1, 0.85, 0.65, 0.5],
        rotate: [0, 180, 360, 540],
        opacity: [0, 1, 1, 0],
      };

  // ─── Layout for minimal & inline ───
  const isMinimal = variant === "minimal" || variant === "inline" || variant === "loader";

  return (
    <div
      onClick={handleReplay}
      className={`relative select-none ${containerStyles[variant]} ${
        clickable || replayOnClick ? "cursor-pointer" : ""
      } ${className}`}
      role="img"
      aria-label={score ? GOAL_TEXT[locale] : "Shot missed"}
    >
      {/* ═══ Ambient glow ═══ */}
      {active && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 55% 65%, ${t.glow}, transparent 60%)`,
            filter: `blur(${s.glow * 1.5}px)`,
          }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{
            duration: animationDuration,
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        />
      )}

      {/* ═══ SVG Goal ═══ */}
      <svg
        viewBox="0 0 200 140"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for frame */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.from} stopOpacity="0.95" />
            <stop offset="100%" stopColor={t.to} stopOpacity="0.95" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#${glowId})`} opacity="0.9">
          {/* ═══ Back frame (perspective) ═══ */}
          <path
            d="M 62 108 L 62 52 L 138 52 L 138 108"
            stroke={t.to}
            strokeWidth="1.2"
            fill="none"
            opacity="0.35"
          />

          {/* ═══ Corner connectors ═══ */}
          <line x1="50" y1="40" x2="62" y2="52" stroke={t.to} strokeWidth="0.8" opacity="0.4" />
          <line x1="150" y1="40" x2="138" y2="52" stroke={t.to} strokeWidth="0.8" opacity="0.4" />
          <line x1="50" y1="120" x2="62" y2="108" stroke={t.to} strokeWidth="0.8" opacity="0.4" />
          <line x1="150" y1="120" x2="138" y2="108" stroke={t.to} strokeWidth="0.8" opacity="0.4" />

          {/* ═══ Front frame ═══ */}
          <path
            d="M 50 120 L 50 40 L 150 40 L 150 120"
            stroke={`url(#${gradientId})`}
            strokeWidth={s.stroke}
            fill="none"
            strokeLinecap="round"
          />

          {/* ═══ Net — vertical ═══ */}
          {[...Array(7)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={50 + i * 16.6}
              y1="40"
              x2={50 + i * 16.6}
              y2="120"
              stroke={t.to}
              strokeWidth="0.5"
              opacity={s.netOpacity}
            />
          ))}

          {/* ═══ Net — horizontal ═══ */}
          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="50"
              y1={40 + i * 16}
              x2="150"
              y2={40 + i * 16}
              stroke={t.to}
              strokeWidth="0.5"
              opacity={s.netOpacity}
            />
          ))}

          {/* ═══ Diagonal depth lines ═══ */}
          {[...Array(4)].map((_, i) => (
            <line
              key={`d-${i}`}
              x1={50 + i * 5}
              y1="40"
              x2={70 + i * 5}
              y2="110"
              stroke={t.to}
              strokeWidth="0.3"
              opacity={s.netOpacity * 0.5}
            />
          ))}
        </g>
      </svg>

      {/* ═══ Ball — animated ═══ */}
      {active && !isMinimal && !prefersReducedMotion && (
        <motion.div
          key={`ball-${replayKey}`}
          className="absolute"
          style={{
            width: s.ball,
            height: s.ball,
            filter: `drop-shadow(0 0 ${s.glow}px ${t.glow})`,
          }}
          initial={{ left: "-15%", top: "75%", scale: 1, rotate: 0, opacity: 0 }}
          animate={ballAnimate}
          transition={{
            duration: animationDuration,
            ease: "easeOut",
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        >
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <circle cx="16" cy="16" r="14" fill={t.ball} />
            <circle cx="16" cy="16" r="14" stroke="#0A0F1C" strokeWidth="1.5" />
            <polygon
              points="16,4 22,10 20,18 12,18 10,10"
              fill="#0A0F1C"
              opacity="0.9"
            />
            <polygon points="16,4 12,8 16,10 20,8" fill={t.from} opacity="0.35" />
          </svg>
        </motion.div>
      )}

      {/* ═══ Ball trail ═══ */}
      {active && !isMinimal && !prefersReducedMotion && (
        <motion.div
          key={`trail-${replayKey}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.ball * 0.6,
            height: s.ball * 0.6,
            background: t.particle,
            filter: `blur(${s.glow * 0.4}px)`,
          }}
          initial={{ left: "-15%", top: "75%", opacity: 0 }}
          animate={{
            left: score ? ["-15%", "15%", "45%"] : ["-15%", "15%", "65%"],
            top: score ? ["75%", "45%", "58%"] : ["75%", "40%", "0%"],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: animationDuration * 0.9,
            ease: "easeOut",
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        />
      )}

      {/* ═══ Particles burst ═══ */}
      {active && score && showParticles && !prefersReducedMotion && (
        <motion.div
          key={`particles-${replayKey}`}
          className="absolute"
          style={{ left: "55%", top: "55%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{
            duration: animationDuration,
            times: [0, 0.7, 0.75, 1],
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const distance = i % 2 === 0 ? 45 : 32;
            return (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 2 === 0 ? 6 : 4,
                  height: i % 2 === 0 ? 6 : 4,
                  background: t.particle,
                  boxShadow: `0 0 8px ${t.particle}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: animationDuration * 0.72,
                  repeat: repeat ? Infinity : 0,
                  repeatDelay,
                }}
              />
            );
          })}
        </motion.div>
      )}

      {/* ═══ Shake effect on goal ═══ */}
      {active && score && !prefersReducedMotion && (
        <motion.div
          key={`shake-${replayKey}`}
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, 0, -3, 3, -2, 2, 0],
            y: [0, 0, 2, -2, 1, -1, 0],
          }}
          transition={{
            duration: 0.4,
            delay: animationDuration * 0.72,
            repeat: repeat ? Infinity : 0,
            repeatDelay: repeatDelay + animationDuration - 0.4,
          }}
        />
      )}

      {/* ═══ GOAL! text flash ═══ */}
      {active && score && showText && !prefersReducedMotion && (
        <motion.div
          key={`text-${replayKey}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            scale: [0.5, 0.5, 1.3, 1, 1.6],
          }}
          transition={{
            duration: animationDuration,
            times: [0, 0.7, 0.75, 0.85, 1],
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        >
          <span
            className={`font-heading font-black tracking-wider bg-gradient-to-r ${t.text} bg-clip-text text-transparent`}
            style={{
              fontSize: variant === "hero" ? "2.5rem" : "1.5rem",
              filter: `drop-shadow(0 0 20px ${t.glow})`,
            }}
          >
            {GOAL_TEXT[locale] ?? GOAL_TEXT.en}
          </span>
        </motion.div>
      )}

      {/* ═══ Miss text (if score=false) ═══ */}
      {active && !score && showText && !prefersReducedMotion && (
        <motion.div
          key={`miss-${replayKey}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0, 0.9, 0],
            scale: [0.8, 0.8, 1, 1.2],
          }}
          transition={{
            duration: animationDuration,
            times: [0, 0.7, 0.8, 1],
            repeat: repeat ? Infinity : 0,
            repeatDelay,
          }}
        >
          <span
            className="font-heading font-black tracking-wider text-muted/70"
            style={{ fontSize: variant === "hero" ? "2rem" : "1.25rem" }}
          >
            {locale === "ka" ? "გამოტოვა" : locale === "ru" ? "МИМО" : "MISS"}
          </span>
        </motion.div>
      )}

      {/* ═══ Replay hint (on hover) ═══ */}
      {replayOnClick && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] text-muted/60">↻</span>
        </div>
      )}
    </div>
  );
}

export default GoalAnimation;