// ═══════════════════════════════════════════════════════════════
//  SportVerge — VideoPlayer v2
//  ─────────────────────────────────────────────────────────────
//  🎬 YouTube video player (embed)
//     - 3 variants: default, minimal, modal
//     - YouTube thumbnail fallback (maxres → hq → mq)
//     - ESC to close modal
//     - Body scroll lock when modal open
//     - Loading state
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Maximize2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export type VideoPlayerVariant = "default" | "minimal" | "modal";
export type VideoAspect = "16/9" | "4/3" | "1/1" | "9/16";

export interface VideoPlayerProps {
  youtubeId: string;
  title?: string;
  thumbnail?: string | null;
  autoPlay?: boolean;
  variant?: VideoPlayerVariant;
  className?: string;
  aspect?: VideoAspect;
}

// ═══════════════════════════════════════════════════════════════
//  ASPECT RATIOS
// ═══════════════════════════════════════════════════════════════

const ASPECT_MAP: Record<VideoAspect, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "9/16": "aspect-[9/16]",
};

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * YouTube thumbnail URL — with quality option.
 * ⚠️ maxresdefault ყოველთვის არ არსებობს (მოკლე ვიდეოებზე).
 */
function getYouTubeThumbnail(
  youtubeId: string,
  quality: "max" | "hq" | "mq" = "hq"
): string {
  const q =
    quality === "max"
      ? "maxresdefault"
      : quality === "mq"
      ? "mqdefault"
      : "hqdefault";
  return `https://i.ytimg.com/vi/${youtubeId}/${q}.jpg`;
}

/**
 * YouTube embed URL — with parameters.
 */
function getEmbedUrl(youtubeId: string, autoPlay: boolean): string {
  const params = new URLSearchParams({
    autoplay: autoPlay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(autoPlay && { mute: "1" }), // autoplay requires mute
  });
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════
//  THUMBNAIL — with fallback + loading
// ═══════════════════════════════════════════════════════════════

function Thumbnail({
  youtubeId,
  thumbnail,
  title,
  priority = false,
}: {
  youtubeId: string;
  thumbnail?: string | null;
  title?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  let src: string;
  if (thumbnail && !error) {
    src = thumbnail;
  } else {
    src = getYouTubeThumbnail(youtubeId, "hq");
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover animate-pulse" />
      )}
      <Image
        src={src}
        alt={title ?? "Video thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
        priority={priority}
        className={`object-cover transition-all duration-500 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // If custom thumbnail fails → try YouTube hqdefault
          if (thumbnail && !error) {
            setError(true);
          }
        }}
        unoptimized
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PLAY BUTTON
// ═══════════════════════════════════════════════════════════════

function PlayButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { outer: "w-12 h-12", icon: 18 },
    md: { outer: "w-16 h-16 lg:w-20 lg:h-20", icon: 26 },
    lg: { outer: "w-20 h-20 lg:w-24 lg:h-24", icon: 32 },
  };
  const s = sizes[size];

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full bg-lime flex items-center justify-center shadow-[0_0_40px_rgba(217,249,157,0.6)] ${s.outer}`}
    >
      <Play size={s.icon} className="text-ink ml-1" fill="currentColor" />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function VideoPlayer({
  youtubeId,
  title,
  thumbnail,
  autoPlay = false,
  variant = "default",
  className = "",
  aspect = "16/9",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ─── ESC to close modal ───
  useEffect(() => {
    if (!isModalOpen) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // ─── Body scroll lock ───
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // ═══════════════════════════════════════════════════════════════
  //  MODAL VARIANT — button that opens modal
  // ═══════════════════════════════════════════════════════════════
  if (variant === "modal") {
    return (
      <>
        <button
          type="button"
          onClick={openModal}
          className={`group relative block w-full overflow-hidden rounded-2xl bg-surface border border-edge hover:border-lime/40 transition-colors duration-300 ${ASPECT_MAP[aspect]} ${className}`}
          aria-label="Play video"
        >
          <Thumbnail
            youtubeId={youtubeId}
            thumbnail={thumbnail}
            title={title}
            priority
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayButton size="md" />
          </div>

          {/* Title */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 text-left">
              <h3 className="font-heading text-base lg:text-lg font-bold text-white line-clamp-2">
                {title}
              </h3>
            </div>
          )}

          {/* Expand icon */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={14} />
          </div>
        </button>

        {/* ═══ MODAL ═══ */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
                onClick={closeModal}
                aria-hidden="true"
              />

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative w-full max-w-5xl"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute -top-12 right-0 p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                  aria-label="Close video"
                >
                  <X size={24} />
                </button>

                {/* Title */}
                {title && (
                  <h3 className="text-white font-heading text-lg lg:text-xl font-bold mb-3 line-clamp-2">
                    {title}
                  </h3>
                )}

                {/* Iframe */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
                  <iframe
                    src={getEmbedUrl(youtubeId, true)}
                    title={title ?? "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MINIMAL VARIANT — iframe only (thumbnail → play → iframe)
  // ═══════════════════════════════════════════════════════════════
  if (variant === "minimal") {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-black border border-edge ${ASPECT_MAP[aspect]} ${className}`}
      >
        {isPlaying ? (
          <iframe
            src={getEmbedUrl(youtubeId, true)}
            title={title ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label="Play video"
          >
            <Thumbnail youtubeId={youtubeId} thumbnail={thumbnail} title={title} />

            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <PlayButton size="sm" />
            </div>
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  DEFAULT VARIANT — full featured
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-black border border-edge ${ASPECT_MAP[aspect]} ${className}`}
    >
      {isPlaying ? (
        <iframe
          src={getEmbedUrl(youtubeId, true)}
          title={title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 w-full h-full"
          aria-label="Play video"
        >
          <Thumbnail
            youtubeId={youtubeId}
            thumbnail={thumbnail}
            title={title}
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayButton size="md" />
          </div>

          {/* Title */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 text-left">
              <h3 className="font-heading text-base lg:text-lg font-bold text-white line-clamp-2">
                {title}
              </h3>
            </div>
          )}
        </button>
      )}
    </div>
  );
}

export { getYouTubeThumbnail, getEmbedUrl };
export default VideoPlayer;