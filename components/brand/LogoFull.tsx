import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoFullProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** ლინკის მისამართი. `null` — ლინკის გარეშე (მაგ. footer-ში). ნაგულისხმევი: '/' */
  href?: string | null;
  locale?: string;
  className?: string;
  glow?: boolean;
  /** სურათის ნაცვლად მხოლოდ ტექსტური ლოგო (თუ სურათი არ ჩაიტვირთა ან საჭირო არაა) */
  textOnly?: boolean;
  /** alt/aria ტექსტის override საჭიროებისას */
  label?: string;
}

const sizes = {
  sm: { width: 120, height: 32, text: 'text-lg' },
  md: { width: 160, height: 44, text: 'text-2xl' },
  lg: { width: 220, height: 60, text: 'text-3xl' },
  xl: { width: 300, height: 82, text: 'text-4xl' },
} as const;

export function LogoFull({
  size = 'md',
  href = '/',
  locale = 'ka',
  className = '',
  glow = false,
  textOnly = false,
  label = 'SportVerge — Home',
}: LogoFullProps) {
  const s = sizes[size];

  const content = textOnly ? (
    <span
      className={cn(
        'font-heading font-bold tracking-tight text-text shrink-0',
        s.text,
        glow && 'drop-shadow-[0_0_16px_rgba(217,249,157,0.4)]',
        'transition-transform duration-200 group-hover:scale-[1.03]'
      )}
    >
      Sport<span className="text-lime">Verge</span>
    </span>
  ) : (
    <div
      className={cn(
        'relative shrink-0',
        glow && 'drop-shadow-[0_0_16px_rgba(217,249,157,0.4)]',
        'transition-transform duration-200 group-hover:scale-[1.03]'
      )}
      style={{ width: s.width, height: s.height }}
    >
      <Image
        src="/logo/logo.png"
        alt="SportVerge"
        fill
        sizes={`${s.width}px`}
        className="object-contain object-left"
        priority
      />
    </div>
  );

  // ლინკის გარეშე ვერსია (მაგ. active/current გვერდზე ან footer-ში)
  if (href === null) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        {content}
      </div>
    );
  }

  // გარე (http/https) ლინკები არ იღებენ locale პრეფიქსს
  const isExternal = /^https?:\/\//.test(href);
  const targetHref = isExternal
    ? href
    : href === '/'
      ? `/${locale}`
      : `/${locale}${href}`;

  return (
    <Link
      href={targetHref}
      className={cn(
        'group inline-flex items-center transition-opacity hover:opacity-90',
        className
      )}
      aria-label={label}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </Link>
  );
}

export default LogoFull;