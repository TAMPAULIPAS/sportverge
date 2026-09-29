'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Trophy, Target, Users, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerCinematic({ locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  const stats = [
    { icon: Trophy, value: '200+', label: isKa ? 'ლიგა' : isRu ? 'Лиг' : 'Leagues' },
    { icon: Target, value: '10K+', label: isKa ? 'პროგნოზი' : isRu ? 'Прогнозов' : 'Predictions' },
    { icon: Users, value: '5K+', label: isKa ? 'მომხმარებელი' : isRu ? 'Юзеров' : 'Users' },
    { icon: Activity, value: '78%', label: isKa ? 'სიზუსტე' : isRu ? 'Точность' : 'Accuracy' },
  ];

  return (
    <section ref={ref} className="relative w-full py-12 lg:py-20 bg-ink">
      <Container size="lg" padding>
        {/* ═══ Cinematic Card ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-edge/50 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        >
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src="/images/banners/banner-2.jpg"      
              alt="SportVerge cinematic"
              fill
              priority
              quality={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
              className="object-cover object-center select-none"
              draggable={false}
            />
          </motion.div>

          {/* Cinematic overlay — მხოლოდ ქვედა ნაწილი */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

          {/* Top glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

          {/* Bottom Content */}
          <motion.div
            style={{ y: textY }}
            className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Left — Text */}
              <div className="max-w-xl">
                <Badge variant="lime" size="sm" dot pulse>
                  <Sparkles size={11} className="mr-1.5" />
                  {isKa ? 'გამორჩეული' : isRu ? 'Особенное' : 'Featured'}
                </Badge>

                <h2 className="mt-4 font-heading font-black text-2xl sm:text-3xl lg:text-5xl text-text leading-tight tracking-tight">
                  {isKa ? (
                    <>
                      ყველა მატჩი.{' '}
                      <span className="text-gradient-lime-teal">ერთ სივრცეში.</span>
                    </>
                  ) : isRu ? (
                    <>
                      Все матчи.{' '}
                      <span className="text-gradient-lime-teal">В одном месте.</span>
                    </>
                  ) : (
                    <>
                      Every match.{' '}
                      <span className="text-gradient-lime-teal">One place.</span>
                    </>
                  )}
                </h2>

                <p className="mt-3 text-sm lg:text-base text-muted/90 max-w-md leading-relaxed">
                  {isKa
                    ? 'ცოცხალი ანგარიშები, სტატისტიკა და AI პროგნოზები — ყველა ლიგა ერთ ეკრანზე'
                    : isRu
                    ? 'Живые счета, статистика и AI прогнозы — все лиги на одном экране'
                    : 'Live scores, stats and AI predictions — every league on one screen'}
                </p>
              </div>

              {/* Right — CTA */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/${locale}/matches`}
                  className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-lime text-ink font-bold text-sm overflow-hidden hover:shadow-[0_0_40px_rgba(217,249,157,0.6)] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <span className="relative z-10">
                    {isKa ? 'ყველა მატჩი' : isRu ? 'Все матчи' : 'All matches'}
                  </span>
                  <ArrowRight
                    size={15}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>

            {/* Stats strip — ქვედა */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-lime" />
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-text leading-none">
                        {s.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}