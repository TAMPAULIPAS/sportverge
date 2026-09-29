'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — BannerHero (banner.jpg + parallax + particles)
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import {
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  ChevronDown,
  Trophy,
  Target,
  Users,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/layout/Container';

interface BannerHeroProps {
  locale: string;
}

export function BannerHero({ locale }: BannerHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.92]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blurAmount = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const blurFilter = useTransform(blurAmount, (v) => `blur(${v}px)`);

  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 6,
        duration: Math.random() * 8 + 8,
        opacity: Math.random() * 0.5 + 0.2,
      })),
    []
  );

  const stats = [
    { icon: Trophy, value: '200+', label: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues' },
    { icon: Target, value: '10K+', label: isKa ? 'პროგნოზი' : isRu ? 'Прогнозов' : 'Predictions' },
    { icon: Users, value: '5K+', label: isKa ? 'მომხმარებელი' : isRu ? 'Юзеров' : 'Users' },
    { icon: Activity, value: '78%', label: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy' },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[95vh] lg:min-h-screen overflow-hidden bg-ink"
    >
      {/* ─── Parallax Image ─── */}
      <motion.div
        style={{ y: imageY, scale: imageScale, filter: blurFilter }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/images/banners/banner.jpg"
          alt="SportVerge — Where sport meets the edge"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center select-none"
          draggable={false}
        />
      </motion.div>

      {/* ─── Overlays ─── */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_30%,rgba(217,249,157,0.14),transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_70%,rgba(20,184,166,0.14),transparent_60%)]" />

      {/* ─── Grid + Particles ─── */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, -80, 0], opacity: [0, p.opacity, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
            className="rounded-full bg-lime shadow-[0_0_8px_rgba(217,249,157,0.8)]"
          />
        ))}
      </div>

      {/* ─── Top Glow ─── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

      {/* ─── Content ─── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex min-h-[95vh] lg:min-h-screen items-center"
      >
        <Container size="lg" padding>
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="lime" size="md" dot pulse>
                <Sparkles size={12} className="mr-1.5" />
                {isKa ? 'AI-POWERED სპორტი' : isRu ? 'AI-СПОРТ' : 'AI-POWERED SPORTS'}
              </Badge>
            </motion.div>

            {/* Title */}
            <div className="mt-7 font-heading font-black leading-[0.95] tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 45 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="block text-3xl sm:text-4xl lg:text-5xl text-text/90"
              >
                {isKa ? 'სადაც სპორტი' : isRu ? 'Там где спорт' : 'WHERE SPORT'}
              </motion.span>

              <motion.span
                initial={{ opacity: 0, y: 45, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.85, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-gradient-lime-teal mt-1"
              >
                {isKa ? 'კიდეს ხვდება' : isRu ? 'встречает край' : 'MEETS THE EDGE'}
              </motion.span>

              <motion.span
                initial={{ opacity: 0, y: 45 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="block text-lg sm:text-xl lg:text-2xl xl:text-3xl text-text/80 mt-5 font-semibold tracking-tight"
              >
                {isKa
                  ? 'პროგნოზები. სტატისტიკა. გამარჯვება.'
                  : isRu
                  ? 'Прогнозы. Статистика. Победа.'
                  : 'Predictions. Stats. Victory.'}
              </motion.span>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-7 text-base lg:text-lg text-muted max-w-xl leading-relaxed"
            >
              {isKa
                ? 'რეალურ დროში მატჩები, AI პროგნოზები და ფანების აზრები — ერთ პლატფორმაზე'
                : isRu
                ? 'Матчи в реальном времени, AI прогнозы и мнения фанатов — на одной платформе'
                : 'Real-time matches, AI predictions and fan opinions — on one platform'}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.72 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href={`/${locale}/predictions`}
                className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm overflow-hidden hover:shadow-[0_0_44px_rgba(217,249,157,0.6)] transition-all"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <Zap size={16} fill="currentColor" className="relative z-10" />
                <span className="relative z-10">
                  {isKa ? 'დაიწყე ახლა' : isRu ? 'Начать сейчас' : 'Start now'}
                </span>
                <ArrowRight
                  size={16}
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <Link
                href={`/${locale}/matches`}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/15 text-text font-medium text-sm hover:border-lime/50 hover:bg-white/10 transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-lime/20 border border-lime/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={11} className="text-lime ml-0.5" fill="currentColor" />
                </span>
                <span>{isKa ? 'მატჩები' : isRu ? 'Матчи' : 'Matches'}</span>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.86 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl"
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.94 + i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3.5 hover:border-lime/40 transition-colors overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime/0 to-teal/0 group-hover:from-lime/5 group-hover:to-teal/5 transition-all duration-300" />
                    <div className="relative flex items-center gap-2 mb-1.5">
                      <Icon size={12} className="text-lime" />
                      <div className="font-mono text-xl lg:text-2xl font-bold text-lime leading-none">
                        {s.value}
                      </div>
                    </div>
                    <div className="relative text-[10px] uppercase tracking-wider text-muted">
                      {s.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </Container>
      </motion.div>

      {/* ─── Scroll Indicator ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 text-muted/70"
        >
          <span className="text-[10px] uppercase tracking-widest">
            {isKa ? 'ჩამოსქროლე' : isRu ? 'Прокрути' : 'Scroll'}
          </span>
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

      {/* ─── Bottom Fade ─── */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-ink/60 to-transparent pointer-events-none" />
    </section>
  );
}