import type { Metadata, Viewport } from 'next';
import {
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
  Noto_Sans_Georgian,
} from 'next/font/google';
import './globals.css';

// ═══════════════════════════════════════════════════════════════
//  FONTS
// ═══════════════════════════════════════════════════════════════
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

const notoGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  variable: '--font-noto-georgian',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'SportVerge';

// ═══════════════════════════════════════════════════════════════
//  VIEWPORT
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
//  METADATA — global fallback (SEO)
// ═══════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: {
    default: 'SportVerge — AI-Powered Sports Platform',
    template: '%s | SportVerge',
  },
  description:
    'AI-powered sports platform. Live scores, smart predictions, real-time analytics in 3 languages.',
  applicationName: SITE_NAME,
  generator: 'Next.js',
  authors: [{ name: 'SportVerge Team', url: SITE_URL }],
  creator: 'SportVerge',
  publisher: 'SportVerge',
  metadataBase: new URL(SITE_URL),
  keywords: [
    'sports', 'football', 'live scores', 'AI predictions', 'matches',
    'sports news', 'la liga', 'champions league', 'premier league',
    'სპორტი', 'ფეხბურთი', 'AI პროგნოზი',
    'спорт', 'футбол', 'AI прогнозы',
  ],

  // ═══════════════════════════════════════════════════════════════
  //  ICONS — ყველგან ჩვენი ლოგო
  //  შენიშვნა: app/icon.png და app/apple-icon.png ავტომატურად
  //  მუშაობს Next.js-ის მიერ. აქ ვამატებთ მხოლოდ დამატებით ზომებს.
  // ═══════════════════════════════════════════════════════════════
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    other: [
      { rel: 'mask-icon', url: '/icons/icon-512.png', color: '#D9F99D' },
    ],
  },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'SportVerge — AI-Powered Sports Platform',
    description:
      'AI-powered sports platform. Live scores, smart predictions, real-time analytics.',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/images/banners/banner-5.jpg`,
        width: 1200,
        height: 630,
        alt: 'SportVerge',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SportVerge — AI-Powered Sports Platform',
    description:
      'AI-powered sports platform. Live scores, smart predictions, real-time analytics.',
    images: [`${SITE_URL}/images/banners/banner-5.jpg`],
    creator: '@sportverge',
    site: '@sportverge',
  },

  manifest: '/manifest.webmanifest',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  category: 'sports',
  classification: 'Sports News & Analytics',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'SportVerge',
    'application-name': 'SportVerge',
    'msapplication-TileColor': '#0A0F1C',
  },
};

// ═══════════════════════════════════════════════════════════════
//  ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ka"
      dir="ltr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoGeorgian.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://www.thesportsdb.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
      </head>

      <body className="font-body antialiased bg-ink text-text selection:bg-lime/30 selection:text-text">
        {children}
      </body>
    </html>
  );
}