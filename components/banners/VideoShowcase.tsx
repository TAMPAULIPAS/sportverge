'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface VideoShowcaseProps {
  locale: string;
  videoSrc?: string;
}

export function VideoShowcase({
  locale,
  videoSrc = '/icons/logo.mp4',
}: VideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: '-100px' });

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isInView) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isInView, hasError]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden py-12 lg:py-20"
      style={{
        background:
          'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(217,249,157,0.12), transparent 70%), radial-gradient(ellipse 40% 40% at 30% 40%, rgba(20,184,166,0.10), transparent 70%), #0A0F1C',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 lg:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 mb-4">
            <Sparkles size={12} className="text-lime" />
            <span className="text-[10px] font-bold text-lime uppercase tracking-widest">
              {isKa ? 'ჩვენი ბრენდი' : isRu ? 'Наш бренд' : 'Our Brand'}
            </span>
          </div>

          <h2 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-black text-text tracking-tight">
            {isKa ? 'SportVerge ვიდეოში' : isRu ? 'SportVerge в видео' : 'SportVerge in motion'}
          </h2>

          <p className="mt-3 text-sm lg:text-base text-muted max-w-2xl mx-auto">
            {isKa
              ? 'სადაც სპორტი კიდეს ხვდება — ყოველ წამში'
              : isRu
              ? 'Там, где спорт встречает край — каждую секунду'
              : 'Where sport meets the edge — every second'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl mx-auto"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-lime/20 via-transparent to-teal/20 rounded-[2rem] blur-3xl opacity-60 pointer-events-none" />

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-edge/70 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-ink">
            {!hasError ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setHasError(true)}
                />

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/70 backdrop-blur-md border border-lime/30">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-lime animate-ping opacity-75" />
                    <span className="relative w-2 h-2 rounded-full bg-lime" />
                  </span>
                  <span className="text-[10px] font-bold text-lime uppercase tracking-wider">
                    BRAND
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <button
                    onClick={togglePlay}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink/80 backdrop-blur-xl border border-white/15 text-text hover:border-lime/50 hover:bg-ink/90 transition-all"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={14} className="text-lime" />
                        <span className="text-xs font-semibold">
                          {isKa ? 'პაუზა' : isRu ? 'Пауза' : 'Pause'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="text-lime" fill="currentColor" />
                        <span className="text-xs font-semibold">
                          {isKa ? 'დაკვრა' : isRu ? 'Играть' : 'Play'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-ink/80 backdrop-blur-xl border border-white/15 text-text hover:border-lime/50 hover:bg-ink/90 transition-all"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX size={16} className="text-muted" />
                    ) : (
                      <Volume2 size={16} className="text-lime" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-ink via-surface to-ink p-8">
                <div className="w-20 h-20 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center">
                  <Play size={32} className="text-lime/60 ml-1" fill="currentColor" />
                </div>
                <p className="text-sm text-muted text-center">
                  {isKa ? 'ვიდეო ვერ ჩაიტვირთა' : isRu ? 'Видео не загрузилось' : 'Video failed to load'}
                </p>
                <p className="text-[10px] text-muted/60 font-mono">{videoSrc}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" />
              <span>{isKa ? 'ავტო-გამეორება' : isRu ? 'Авто-повтор' : 'Auto-loop'}</span>
            </div>
            <span className="text-muted/40">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span>{isKa ? '6 წამი' : isRu ? '6 секунд' : '6 seconds'}</span>
            </div>
            <span className="text-muted/40">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>{isKa ? 'HD ხარისხი' : isRu ? 'HD качество' : 'HD quality'}</span>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default VideoShowcase;