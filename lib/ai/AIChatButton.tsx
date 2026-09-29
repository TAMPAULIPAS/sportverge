// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Chat Floating Button
//  ─────────────────────────────────────────────────────────────
//  🎯 Floating ღილაკი ქვედა მარჯვენა კუთხეში
//
//  ✨ Features:
//     - Pulsing glow animation
//     - Hover tooltip
//     - Sparkles icon
//     - Mobile responsive
//     - Auto-hide on scroll down (optional)
//     - Framer Motion entrance
//     - Accessibility (aria-label, keyboard)
// ═══════════════════════════════════════════════════════════════

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

type Locale = "ka" | "en" | "ru";

interface AIChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  locale?: Locale;
}

// ─────────────────────────────────────────────────────────────
//  🌍 TRANSLATIONS
// ─────────────────────────────────────────────────────────────

function getLabel(locale: Locale) {
  if (locale === "ka") return "ჰკითხე AI-ს";
  if (locale === "ru") return "Спроси AI";
  return "Ask AI";
}

function getTooltip(locale: Locale) {
  if (locale === "ka") return "SportVerge AI ასისტენტი";
  if (locale === "ru") return "AI-ассистент SportVerge";
  return "SportVerge AI Assistant";
}

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function AIChatButton({
  onClick,
  isOpen,
  locale = "ka",
}: AIChatButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ─── Mount animation delay ───
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // ─── Auto-hide tooltip after 5 seconds ───
  useEffect(() => {
    if (!mounted || isOpen) return;

    const showTimer = setTimeout(() => setShowTooltip(true), 2000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 7000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [mounted, isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90] flex items-end gap-3">
      {/* ═══ Tooltip ═══ */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="hidden sm:block relative"
          >
            <div className="relative bg-surface/95 backdrop-blur-xl border border-lime/30 rounded-2xl px-4 py-2.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
              <div className="text-xs font-semibold text-text whitespace-nowrap">
                {getTooltip(locale)}
              </div>
              <div className="text-[10px] text-muted mt-0.5">
                👋 {getLabel(locale)}
              </div>

              {/* Arrow */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-surface/95 border-r border-t border-lime/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Main Button ═══ */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-lime to-teal flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(217,249,157,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(217,249,157,0.8)] transition-shadow"
        aria-label={isOpen ? "Close AI chat" : getLabel(locale)}
      >
        {/* ═══ Pulsing ring ═══ */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-lime animate-ping opacity-20" />
            <span
              className="absolute inset-0 rounded-2xl bg-lime animate-ping opacity-10"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}

        {/* ═══ Glow ═══ */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-lime to-teal opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />

        {/* ═══ Icon ═══ */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-ink relative z-10" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Sparkles
                size={24}
                className="text-ink group-hover:rotate-12 transition-transform"
                strokeWidth={2.5}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Online badge ═══ */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0A0F1C] flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
          </span>
        )}

        {/* ═══ Text label (mobile hidden) ═══ */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-lime font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
          {isOpen ? "" : "AI"}
        </span>
      </motion.button>
    </div>
  );
}