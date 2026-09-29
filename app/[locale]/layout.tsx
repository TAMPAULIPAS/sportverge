import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'SportVerge';
const TWITTER_HANDLE = '@sportverge';

// ═══════════════════════════════════════════════════════════════
//  Static params — ყველა ენისთვის
// ═══════════════════════════════════════════════════════════════
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ═══════════════════════════════════════════════════════════════
//  Viewport — mobile-first, dark theme
// ═══════════════════════════════════════════════════════════════
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A0F1C',
  colorScheme: 'dark',
};

// ═══════════════════════════════════════════════════════════════
//  SEO Metadata — 3 ენაზე
// ═══════════════════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    ka: 'SportVerge — რეალურ დროში ანალიტიკა. AI პროგნოზები.',
    en: 'SportVerge — Real-time Insights. AI-Powered Predictions.',
    ru: 'SportVerge — Аналитика в реальном времени. AI прогнозы.',
  };

  const descriptions = {
    ka: 'AI-ზე დაფუძნებული სპორტული პლატფორმა. ცოცხალი ანგარიშები, ჭკვიანი პროგნოზები, 3 ენა.',
    en: 'AI-powered sports platform. Live scores, smart predictions, 3 languages.',
    ru: 'Спортивная платформа на базе AI. Живые счета, умные прогнозы, 3 языка.',
  };

  const key = (locale as 'ka' | 'en' | 'ru') || 'ka';
  const title = titles[key];
  const description = descriptions[key];

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ka-GE': '/ka',
        'en-US': '/en',
        'ru-RU': '/ru',
        'x-default': '/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: key === 'ka' ? 'ka_GE' : key === 'ru' ? 'ru_RU' : 'en_US',
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/images/banner.jpg`,
          width: 1200,
          height: 630,
          alt: 'SportVerge',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [`${SITE_URL}/images/banner.jpg`],
    },
    icons: {
      icon: [
        { url: '/logo/logo.png', sizes: 'any' },
        { url: '/logo/logo.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/logo/logo.png', sizes: '192x192', type: 'image/png' }],
      shortcut: '/logo/logo.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'sports',
  };
}

// ═══════════════════════════════════════════════════════════════
//  LOCALE LAYOUT
// ═══════════════════════════════════════════════════════════════
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="relative flex min-h-screen flex-col bg-ink overflow-x-hidden">
        {/* ═══ AMBIENT BACKGROUND ═══ */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Lime glow — top-left */}
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-lime/5 rounded-full blur-[200px]" />

          {/* Teal glow — top-right */}
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-teal/5 rounded-full blur-[200px]" />

          {/* Lime glow — bottom */}
          <div className="absolute -bottom-96 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-lime/3 rounded-full blur-[280px]" />

          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="flex-1 min-h-[60vh]">{children}</main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Floating elements */}
        <ScrollToTop />
      </div>
    </NextIntlClientProvider>
  );
}