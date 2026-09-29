// ═══════════════════════════════════════════════════════════════
//  SportVerge — SafeImage
//  ─────────────────────────────────────────────────────────────
//  🖼️ Image with automatic fallback on error
//     - Custom fallbackSrc (does NOT leak to DOM)
//     - Loading skeleton
//     - Error handling
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

export interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

const DEFAULT_FALLBACK = "/images/banners/banner.jpg";

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  ...rest
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(
    src && src.trim().length > 0 ? src : fallbackSrc
  );
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (src && src.trim().length > 0) {
      setImageSrc(src);
      setError(false);
      setLoaded(false);
    }
  }, [src]);

  function handleError() {
    if (!error) {
      setError(true);
      setImageSrc(fallbackSrc);
    }
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover animate-pulse" />
      )}
      <Image
        {...rest}
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        unoptimized={rest.unoptimized ?? true}
      />
    </>
  );
}

export default SafeImage;