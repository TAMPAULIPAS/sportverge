'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Container } from '@/components/layout/Container';

interface Props {
  locale: string;
}

export function BannerPromo({ locale }: Props) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        // 🎨 Lime + Teal ბექგრაუნდი (promo ფოტოს ფერები)
        background:
          'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(217,249,157,0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 70% 50%, rgba(20,184,166,0.18), transparent 70%), #0A0F1C',
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
            src="/images/banners/banner-5.jpg"
            alt="SportVerge — Try it free"
            fill
            quality={100}
            sizes="100vw"
            className="object-cover object-center select-none"
            draggable={false}
          />

          {/* Bottom gradient for CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/70 to-transparent" />

          {/* CTA — ქვემოთ ცენტრში */}
          <div className="relative z-10 h-full flex flex-col justify-end items-center p-6 sm:p-10 lg:p-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-sm lg:text-base text-muted mb-4 max-w-lg">
                {isKa
                  ? 'სცადე უფასოდ — არავითარი ბარათი, არავითარი ვალდებულება'
                  : isRu
                  ? 'Попробуй бесплатно — без карты, без обязательств'
                  : 'Try it free — no card, no commitment'}
              </p>

              <Link
                href={`/${locale}/predictions`}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-lime text-ink font-bold text-base overflow-hidden hover:shadow-[0_0_50px_rgba(217,249,157,0.7)] transition-all"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <Zap size={18} fill="currentColor" className="relative z-10" />
                <span className="relative z-10">
                  {isKa ? 'სცადე უფასოდ' : isRu ? 'Попробовать' : 'TRY FREE'}
                </span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}