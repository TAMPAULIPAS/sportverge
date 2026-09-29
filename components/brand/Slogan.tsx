// ═══════════════════════════════════════════════════════════════
//  Slogan — ბრენდის დევიზი 3 ენაზე
//  გამოიყენება: Footer-ში, Hero-ზე, Promo ბანერზე, About გვერდზე
// ═══════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// ტიპები
// ─────────────────────────────────────────────
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SloganProps {
  locale?: 'ka' | 'en' | 'ru' | string;
  size?: Size;
  className?: string;
  gradient?: boolean;
  italic?: boolean;
}

// ─────────────────────────────────────────────
// დევიზები 3 ენაზე
// ─────────────────────────────────────────────
const SLOGANS = {
  ka: 'სადაც სპორტი კიდეს ხვდება',
  en: 'Where sport meets the edge',
  ru: 'Там, где спорт встречает край',
} as const;

// ─────────────────────────────────────────────
// ზომები
// ─────────────────────────────────────────────
const sizes: Record<Size, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base lg:text-lg',
  xl: 'text-lg lg:text-xl',
};

// ─────────────────────────────────────────────
// მთავარი კომპონენტი
// ─────────────────────────────────────────────
export function Slogan({
  locale = 'ka',
  size = 'md',
  className = '',
  gradient = false,
  italic = false,
}: SloganProps) {
  const text = SLOGANS[locale as keyof typeof SLOGANS] || SLOGANS.ka;

  return (
    <span
      className={cn(
        sizes[size],
        gradient
          ? 'text-gradient-lime-teal font-medium'
          : 'text-muted',
        italic && 'italic',
        'tracking-wide',
        className
      )}
    >
      {text}
    </span>
  );
}

export default Slogan;
