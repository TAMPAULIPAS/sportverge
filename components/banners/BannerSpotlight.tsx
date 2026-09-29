'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Users } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerSpotlight({ locale }: Props) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        // 🎨 Navy + Lime ბექგრაუნდი (FIFA card ფერები)
        background:
          'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(217,249,157,0.14), transparent 70%), radial-gradient(ellipse 60% 60% at 20% 60%, rgba(20,184,166,0.14), transparent 70%), #0A0F1C',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-edge/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        >
          <Image
            src="/images/banners/banner-3.jpg"
            alt="SportVerge spotlight"
            fill
            quality={100}
            sizes="100vw"
            className="object-cover object-center select-none"
            draggable={false}
          />

          {/* Overlay — ტექსტი მარცხნივ */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

          {/* Content — Left side */}
          <div className="relative z-10 h-full flex items-center p-6 sm:p-8 lg:p-14 xl:p-20">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-lime" fill="currentColor" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-lime">
                  {isKa ? 'AI რჩევა' : isRu ? 'AI совет' : 'AI Tip'}
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black text-text leading-[1.05] tracking-tight">
                {isKa ? (
                  <>შედი ლიდერბორდზე.{' '}<span className="text-gradient-lime-teal">დაამტკიცე რომ საუკეთესო ხარ.</span></>
                ) : isRu ? (
                  <>Попади в лидерборд.{' '}<span className="text-gradient-lime-teal">Докажи что ты лучший.</span></>
                ) : (
                  <>Get on the leaderboard.{' '}<span className="text-gradient-lime-teal">Prove you're the best.</span></>
                )}
              </h3>

              <p className="mt-4 text-sm lg:text-base text-muted max-w-md leading-relaxed">
                {isKa
                  ? 'იწინასწარმეტყველე მატჩები, მოიპოვე ქულები და გახდი თვის ტოპ პროგნოზიორი'
                  : isRu
                  ? 'Прогнозируй матчи, зарабатывай очки и стань лучшим прогнозистом месяца'
                  : 'Predict matches, earn points and become the top predictor of the month'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-teal" />
                  <span className="text-xs text-muted">
                    <span className="font-mono font-bold text-text">5,240</span>{' '}
                    {isKa ? 'მოთამაშე' : isRu ? 'игроков' : 'players'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-lime" />
                  <span className="text-xs text-muted">
                    <span className="font-mono font-bold text-text">78.4%</span>{' '}
                    {isKa ? 'საშ. სიზუსტე' : isRu ? 'средняя точность' : 'avg accuracy'}
                  </span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/leaderboard`}
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime text-ink font-bold text-sm overflow-hidden hover:shadow-[0_0_40px_rgba(217,249,157,0.6)] transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <span className="relative z-10">
                    {isKa ? 'ლიდერბორდი' : isRu ? 'Лидерборд' : 'Leaderboard'}
                  </span>
                  <ArrowRight size={15} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={`/${locale}/predictions`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-text font-medium text-sm hover:border-lime/50 transition-all"
                >
                  {isKa ? 'იწინასწარმეტყველე' : isRu ? 'Прогноз' : 'Predict'}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}