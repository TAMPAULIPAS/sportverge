'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Target, Users } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerTrio({ locale }: Props) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  const features = [
    {
      icon: Trophy,
      title: isKa ? 'ყველა ლიგა' : isRu ? 'Все лиги' : 'All leagues',
      desc: isKa ? '200+ ლიგა' : isRu ? '200+ лиг' : '200+ leagues',
    },
    {
      icon: Target,
      title: isKa ? 'AI ანალიზი' : isRu ? 'AI анализ' : 'AI analysis',
      desc: isKa ? 'ჭკვიანი პროგნოზები' : isRu ? 'Умные прогнозы' : 'Smart predictions',
    },
    {
      icon: Users,
      title: isKa ? 'ორი მხარე' : isRu ? 'Две стороны' : 'Two Sides',
      desc: isKa ? 'ფანების აზრები' : isRu ? 'Мнения фанатов' : 'Fan opinions',
    },
  ];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        // 🎨 Deep Teal/Emerald ბექგრაუნდი (silhouette ფოტოს ფერები)
        background:
          'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(20,184,166,0.20), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 40%, rgba(16,185,129,0.12), transparent 70%), #0A0F1C',
      }}
    >
      <Container size="lg" padding>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-edge/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        >
          <Image
            src="/images/banners/banner-4.jpg"
            alt="SportVerge — Three ways to win"
            fill
            quality={100}
            sizes="100vw"
            className="object-cover object-center select-none"
            draggable={false}
          />

          {/* Soft overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-transparent" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/70 to-transparent" />

          {/* Content — ცენტრში, ქვემოთ */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 lg:p-14 xl:p-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-text tracking-tight">
                {isKa ? 'სამი გზა გამარჯვებისკენ' : isRu ? 'Три пути к победе' : 'Three ways to win'}
              </h2>
            </motion.div>

            {/* 3 Feature pills — ქვემოთ ცენტრში */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto w-full">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    className="bg-ink/60 backdrop-blur-xl border border-white/15 rounded-2xl p-4 hover:border-teal/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-teal" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text truncate">{feat.title}</div>
                        <div className="text-[10px] text-muted truncate">{feat.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}