'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — BannerPredictions
//  Purple/Gold theme — predictions გვერდისთვის
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Brain, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerPredictions({ locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.10]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  const stats = [
    { icon: Brain, value: '94%', label: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy' },
    { icon: TrendingUp, value: '12K', label: isKa ? 'პროგნოზი' : isRu ? 'Прогнозов' : 'Predictions' },
    { icon: Target, value: '250+', label: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues' },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 60% 60% at 25% 40%, rgba(251,191,36,0.20), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(167,139,250,0.20), transparent 70%), #0F0A1F',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-purple-500/20 shadow-[0_40px_100px_-20px_rgba(139,92,246,0.4)]"
        >
          <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 will-change-transform">
            <Image
              src="/images/banners/banner-3.jpg"
              loading="eager"
              alt="SportVerge AI Predictions"
              fill
              priority
              quality={100}
              sizes="100vw"
              className="object-cover object-center select-none"
              draggable={false}
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0A1F]/95 via-[#0F0A1F]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F]/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_50%,rgba(251,191,36,0.10),transparent_65%)]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

          <motion.div
            style={{ opacity: contentOpacity }}
            className="relative z-10 h-full flex items-center p-6 sm:p-8 lg:p-14 xl:p-20"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-purple-500/15 border border-amber-400/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-200">
                <Sparkles size={12} className="mr-1.5" />
                {isKa ? 'AI-POWERED პროგნოზები' : isRu ? 'AI-ПРОГНОЗЫ' : 'AI-POWERED PREDICTIONS'}
              </span>

              <div className="mt-5 font-heading font-black leading-[0.95] tracking-tight">
                <span className="block text-2xl sm:text-3xl lg:text-5xl xl:text-6xl text-amber-50/90">
                  {isKa ? 'იცოდე წინასწარ.' : isRu ? 'Знай заранее.' : 'KNOW BEFORE.'}
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 bg-clip-text text-transparent mt-1">
                  {isKa ? 'მოიგე დარწმუნებით.' : isRu ? 'Побеждай уверенно.' : 'WIN WITH CERTAINTY.'}
                </span>
              </div>

              <p className="mt-5 text-sm sm:text-base lg:text-lg text-purple-100/70 max-w-lg leading-relaxed">
                {isKa
                  ? 'AI ალგორითმი აანალიზებს ფორმას, ისტორიას და სტატისტიკას — გაძლევს ზუსტ პროგნოზებს'
                  : isRu
                  ? 'AI анализирует форму, историю и статистику — даёт точные прогнозы'
                  : 'AI analyzes form, history and stats — gives you precise predictions'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/predictions#matches`}
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#0F0A1F] font-bold text-sm overflow-hidden hover:shadow-[0_0_44px_rgba(251,191,36,0.7)] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <Zap size={16} fill="currentColor" className="relative z-10" />
                  <span className="relative z-10">
                    {isKa ? 'ნახე პროგნოზები' : isRu ? 'Смотреть прогнозы' : 'See predictions'}
                  </span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={`/${locale}/leaderboard`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-500/10 backdrop-blur-xl border border-purple-400/30 text-purple-50 font-medium text-sm hover:border-purple-300/60 hover:bg-purple-500/20 transition-all"
                >
                  <span>{isKa ? 'ლიდერბორდი' : isRu ? 'Лидерборд' : 'Leaderboard'}</span>
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-0 right-0 p-4 sm:p-6 lg:p-8 hidden md:flex gap-3">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  className="bg-[#0F0A1F]/70 backdrop-blur-xl border border-purple-400/20 rounded-2xl px-4 py-3 min-w-[110px]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-amber-300" />
                    <span className="font-mono text-lg font-bold text-amber-300 leading-none">{s.value}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-purple-200/60">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default BannerPredictions;