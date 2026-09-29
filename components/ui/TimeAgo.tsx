// ═══════════════════════════════════════════════════════════════
//  SportVerge — TimeAgo
//  ─────────────────────────────────────────────────────────────
//  🕐 Relative time — client-side only (no hydration mismatch)
//     - Server: renders static placeholder
//     - Client: updates after mount
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";

interface TimeAgoProps {
  date: string;
  locale?: string;
  className?: string;
  /** Placeholder before client mounts */
  fallback?: string;
}

function computeTimeAgo(date: string, locale: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const isKa = locale === "ka";
    const isRu = locale === "ru";

    if (diff < 0) return isKa ? "ახლა" : isRu ? "сейчас" : "now";
    if (diff < 60) return isKa ? "ახლა" : isRu ? "сейчас" : "now";
    if (diff < 3600)
      return `${Math.floor(diff / 60)}${isKa ? "წთ" : isRu ? "м" : "m"}`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)}${isKa ? "სთ" : isRu ? "ч" : "h"}`;
    return `${Math.floor(diff / 86400)}${isKa ? "დღ" : isRu ? "д" : "d"}`;
  } catch {
    return "";
  }
}

export function TimeAgo({ date, locale = "ka", className = "", fallback = "—" }: TimeAgoProps) {
  // ⚡ null on server, string on client — avoid mismatch
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    // Initial compute
    setText(computeTimeAgo(date, locale));

    // Update every 60 seconds
    const interval = setInterval(() => {
      setText(computeTimeAgo(date, locale));
    }, 60_000);

    return () => clearInterval(interval);
  }, [date, locale]);

  return (
    <span className={className} suppressHydrationWarning>
      {text ?? fallback}
    </span>
  );
}

export default TimeAgo;