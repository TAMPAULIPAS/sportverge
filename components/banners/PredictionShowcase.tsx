'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — PredictionShowcase
//  AI ვიდეო + ფოტო showcase — predictions გვერდისთვის
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, Sparkles, Video, BarChart3, TrendingUp } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
  videoSrc?: string;
}

export function PredictionShowcase({
  locale,
  videoSrc = '/icons/video.mp4',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: '-100px' });

  const [isPlaying, setIsPlaying] = useState(true);
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

  const features = [
    {
      icon: Sparkles,
      title: isKa ? 'AI ანალიზი' : isRu ? 'AI анализ' : 'AI Analysis',
      desc: isKa ? 'ჭკვიანი ალგორითმი' : isRu ? 'Умный алгоритм' : 'Smart algorithm',
    },
    {
      icon: BarChart3,
      title: isKa ? 'სტატისტიკა' : isRu ? 'Статистика' : 'Statistics',
      desc: isKa ? '1000+ მონაცემი' : isRu ? '1000+ данных' : '1000+ data points',
    },
    {
      icon: TrendingUp,
      title: isKa ? '94% სიზუსტე' : isRu ? '94% точность' : '94% Accuracy',
      desc: isKa ? 'რეალური შედეგები' : isRu ? 'Реальные результаты' : 'Real results',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden py-12 lg:py-20"
      style={{
        background:
          'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167,139,250,0.12), transparent 70%), radial-gradient(ellipse 40% 40% at 30% 40%, rgba(251,191,36,0.10), transparent 70%), #0F0A1F',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/40 mb-4">
            <Video size={12} className="text-purple-300" />
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
              {isKa ? 'AI ტექნოლოგია' : isRu ? 'AI технология' : 'AI Technology'}
            </span>
          </div>

          <h2 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-black text-purple-50 tracking-tight">
            {isKa ? 'როგორ მუშაობს AI' : isRu ? 'Как работает AI' : 'How AI works'}
          </h2>

          <p className="mt-3 text-sm lg:text-base text-purple-200/70 max-w-2xl mx-auto">
            {isKa
              ? 'ყოველ წამს ანალიზი — ყოველ მატჩზე ზუსტი პროგნოზი'
              : isRu
              ? 'Анализ каждую секунду — точный прогноз на каждый матч'
              : 'Analysis every second — precise prediction for every match'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center">
          {/* ═══ Video — LEFT ═══ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-3 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-transparent to-purple-500/20 rounded-[2rem] blur-3xl opacity-60 pointer-events-none" />

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-purple-500/30 shadow-[0_40px_100px_-20px_rgba(139,92,246,0.5)] bg-[#0F0A1F]">
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

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0F0A1F]/80 via-[#0F0A1F]/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F0A1F]/70 backdrop-blur-md border border-amber-400/40">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
                      <span className="relative w-2 h-2 rounded-full bg-amber-400" />
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      AI LIVE
                    </span>
                  </div>

                  <button
                    onClick={togglePlay}
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F0A1F]/80 backdrop-blur-xl border border-white/15 text-text hover:border-amber-400/50 transition-all"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={14} className="text-amber-300" />
                        <span className="text-xs font-semibold">
                          {isKa ? 'პაუზა' : isRu ? 'Пауза' : 'Pause'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="text-amber-300" fill="currentColor" />
                        <span className="text-xs font-semibold">
                          {isKa ? 'დაკვრა' : isRu ? 'Играть' : 'Play'}
                        </span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <Image
                    src="/images/banners/banner-3.jpg"
                    alt="AI Predictions"
                    fill
                    quality={95}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] via-[#0F0A1F]/60 to-transparent" />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                      <Sparkles size={28} className="text-amber-300" />
                    </div>
                    <p className="text-sm text-purple-100 font-semibold text-center">
                      {isKa ? 'AI Predictions' : isRu ? 'AI Predictions' : 'AI Predictions'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══ Features — RIGHT ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  className="group relative bg-gradient-to-br from-[#1A1329]/80 to-[#0F0A1F]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-300"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(251,191,36,0.3)] group-hover:scale-110 transition-transform">
                      <Icon size={20} className="text-[#0F0A1F]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold text-purple-50 mb-1">
                        {f.title}
                      </h3>
                      <p className="text-sm text-purple-200/60">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-br from-[#1A1329]/80 to-[#0F0A1F]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-purple-100">
                  {isKa ? 'AI სიზუსტე' : isRu ? 'Точность AI' : 'AI Accuracy'}
                </span>
                <span className="font-mono text-lg font-bold text-amber-300">94%</span>
              </div>
              <div className="h-2 bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '94%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default PredictionShowcase;