'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Play, Sparkles, Zap, Trophy, Target, Users, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerHero({ locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.10]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  const stats = [
    { icon: Trophy, value: '200+', label: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues' },
    { icon: Target, value: '10K+', label: isKa ? 'პროგნოზი' : isRu ? 'Прогнозов' : 'Predictions' },
    { icon: Users, value: '5K+', label: isKa ? 'მომხმარებელი' : isRu ? 'Юзеров' : 'Users' },
    { icon: Activity, value: '78%', label: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy' },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        // 🎨 ფოტოს ფერებზე მორგებული ბექგრაუნდი
        background:
          'radial-gradient(ellipse 60% 60% at 20% 40%, rgba(217,249,157,0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(20,184,166,0.18), transparent 70%), #0A0F1C',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-edge/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        >
          {/* Image */}
          <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 will-change-transform">
            <Image
              src="/images/banners/banner.jpg"
              alt="SportVerge — Where sport meets the edge"
              fill
              priority
              quality={100}
              sizes="100vw"
              className="object-cover object-center select-none"
              draggable={false}
            />
          </motion.div>

          {/* Overlays — მხოლოდ მარცხნივ და ქვემოთ */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

          {/* Top glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

          {/* Content */}
          <motion.div
            style={{ opacity: contentOpacity }}
            className="relative z-10 h-full flex items-center p-6 sm:p-8 lg:p-14 xl:p-20"
          >
            <div className="max-w-2xl">
              <Badge variant="lime" size="md" dot pulse>
                <Sparkles size={12} className="mr-1.5" />
                {isKa ? 'AI-POWERED სპორტი' : isRu ? 'AI-СПОРТ' : 'AI-POWERED SPORTS'}
              </Badge>

              <div className="mt-5 font-heading font-black leading-[0.95] tracking-tight">
                <span className="block text-2xl sm:text-3xl lg:text-5xl xl:text-6xl text-text/90">
                  {isKa ? 'სადაც სპორტი' : isRu ? 'Там где спорт' : 'WHERE SPORT'}
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-7xl xl:text-8xl text-gradient-lime-teal mt-1">
                  {isKa ? 'კიდეს ხვდება' : isRu ? 'встречает край' : 'MEETS THE EDGE'}
                </span>
              </div>

              <p className="mt-5 text-sm sm:text-base lg:text-lg text-muted max-w-lg leading-relaxed">
                {isKa
                  ? 'რეალურ დროში მატჩები, AI პროგნოზები და ფანების აზრები — ერთ პლატფორმაზე'
                  : isRu
                  ? 'Матчи в реальном времени, AI прогнозы и мнения фанатов — на одной платформе'
                  : 'Real-time matches, AI predictions and fan opinions — on one platform'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/predictions`}
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm overflow-hidden hover:shadow-[0_0_44px_rgba(217,249,157,0.6)] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <Zap size={16} fill="currentColor" className="relative z-10" />
                  <span className="relative z-10">
                    {isKa ? 'დაიწყე ახლა' : isRu ? 'Начать сейчас' : 'Start now'}
                  </span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={`/${locale}/matches`}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-text font-medium text-sm hover:border-lime/50 hover:bg-white/15 transition-all"
                >
                  <span className="w-7 h-7 rounded-full bg-lime/20 border border-lime/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={11} className="text-lime ml-0.5" fill="currentColor" />
                  </span>
                  <span>{isKa ? 'მატჩები' : isRu ? 'Матчи' : 'Matches'}</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats — ქვედა მარჯვენა კუთხეში */}
          <div className="absolute bottom-0 right-0 p-4 sm:p-6 lg:p-8 hidden md:flex gap-3">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
                  className="bg-ink/60 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 min-w-[100px]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-lime" />
                    <span className="font-mono text-lg font-bold text-lime leading-none">{s.value}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-muted">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}