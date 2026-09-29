import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────
        // საბაზისო ფონები — რეალურად გამოყენებული
        // კომპონენტებში (bg-ink, bg-surface...)
        // ─────────────────────────────────────
        ink: '#0A0F1C',          // მთავარი ბექგრაუნდი (bg-ink)
        surface: {
          DEFAULT: '#111827',    // ბარათების ფონი (bg-surface)
          hover: '#1E293B',      // hover მდგომარეობა (bg-surface-hover)
        },
        edge: '#1F2937',         // საზღვრები (border-edge)

        // ─────────────────────────────────────
        // ტექსტი
        // ─────────────────────────────────────
        text: {
          DEFAULT: '#F8FAFC',    // ძირითადი ტექსტი (text-text)
          muted: '#94A3B8',      // მეორადი ტექსტი (text-muted / text-text-muted)
          disabled: '#475569',
        },
        muted: '#94A3B8',        // alias — text-muted-ს პირდაპირი წვდომისთვის (text-muted)

        // ─────────────────────────────────────
        // ბრენდის / აქცენტის ფერები
        // ─────────────────────────────────────
        lime: { DEFAULT: '#D9F99D' },
        teal: { DEFAULT: '#14B8A6' },
        gold: { DEFAULT: '#FBBF24' },
        danger: { DEFAULT: '#EF4444' },
        success: { DEFAULT: '#22C55E' },

        // ძველი bg.* სახელები შენარჩუნებულია უკუთავსებადობისთვის
        // (თუ ძველი კოდი ჯერ კიდევ იყენებს bg-primary/bg-card და ა.შ.)
        bg: {
          primary: '#0A0F1C',
          card: '#111827',
          hover: '#1E293B',
          border: '#1F2937',
        },
      },

      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },

      boxShadow: {
        'glow-lime': '0 0 24px rgba(217, 249, 157, 0.3)',
        'glow-teal': '0 0 24px rgba(20, 184, 166, 0.3)',
        'glow-gold': '0 0 24px rgba(251, 191, 36, 0.3)',
        'glow-danger': '0 0 24px rgba(239, 68, 68, 0.3)',
        'glow-sm-lime': '0 0 12px rgba(217, 249, 157, 0.5)',
      },

      borderRadius: {
        '4xl': '2rem',
      },

      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, #1F2937 1px, transparent 1px), linear-gradient(to bottom, #1F2937 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-md': '32px 32px',
      },

      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 24px rgba(217, 249, 157, 0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 12px rgba(217, 249, 157, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    // scrollbar-hide utility — NewsGrid-ის FilterBar იყენებს `scrollbar-hide`-ს
    function ({ addUtilities }: { addUtilities: (utils: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};

export default config;