// ═══════════════════════════════════════════════════════════════
//  SportVerge — News Share Buttons
//  ─────────────────────────────────────────────────────────────
//  📤 Share: X (Twitter), Facebook, Telegram, Copy Link
//  ⚠️  Brand icons — inline SVG (Lucide-ში აღარ არის)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Send, Link2, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  BRAND ICONS (inline SVG)
// ─────────────────────────────────────────────────────────────

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

interface Props {
  url: string;
  title: string;
  labels?: { share: string; copyLink: string; copied: string };
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function NewsShareButtons({ url, title, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = labels ?? {
    share: "Share",
    copyLink: "Copy link",
    copied: "Copied!",
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-muted hover:text-lime hover:border-lime/40 transition-all"
        aria-label={t.share}
        aria-expanded={open}
      >
        <Share2 size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-20 flex gap-1.5 p-2 rounded-xl bg-surface/95 backdrop-blur-xl border border-edge shadow-xl"
          >
            {/* X (Twitter) */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-surface hover:bg-lime/10 flex items-center justify-center text-muted hover:text-lime transition-all"
              aria-label="Share on X"
            >
              <XIcon size={14} />
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-surface hover:bg-lime/10 flex items-center justify-center text-muted hover:text-lime transition-all"
              aria-label="Share on Facebook"
            >
              <FacebookIcon size={14} />
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-surface hover:bg-lime/10 flex items-center justify-center text-muted hover:text-lime transition-all"
              aria-label="Share on Telegram"
            >
              <Send size={14} />
            </a>

            {/* Copy Link */}
            <button
              onClick={copy}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-lime/10 flex items-center justify-center text-muted hover:text-lime transition-all"
              aria-label={t.copyLink}
              title={copied ? t.copied : t.copyLink}
            >
              {copied ? (
                <Check size={14} className="text-lime" />
              ) : (
                <Link2 size={14} />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}