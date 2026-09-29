// TODO: useLanguage
// ═══════════════════════════════════════════════════════════════
//  useLanguage — ენის მართვის hook
//  აბრუნებს: მიმდინარე ენას, ენის შეცვლის ფუნქციას, ლეიბლებს
// ═══════════════════════════════════════════════════════════════

'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// ─────────────────────────────────────────────
// ტიპები
// ─────────────────────────────────────────────
export type Locale = 'ka' | 'en' | 'ru';

export interface Language {
  code: Locale;
  label: string;
  full: string;
  flag: string;
}

// ─────────────────────────────────────────────
// ხელმისაწვდომი ენები
// ─────────────────────────────────────────────
export const LANGUAGES: Language[] = [
  { code: 'ka', label: 'ქარ', full: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'ENG', full: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'РУС', full: 'Русский', flag: '🇷🇺' },
];

// ─────────────────────────────────────────────
// Return ტიპი
// ─────────────────────────────────────────────
interface UseLanguageReturn {
  /** მიმდინარე ენა */
  locale: Locale;
  /** ენის შეცვლა */
  setLocale: (locale: Locale) => void;
  /** ყველა ხელმისაწვდომი ენა */
  languages: Language[];
  /** მიმდინარე ენის ობიექტი */
  currentLanguage: Language;
  /** შემოწმება — აქტიურია თუ არა */
  isActive: (code: Locale) => boolean;
  /** შემოწმება — არის თუ არა ვალიდური ენა */
  isValidLocale: (code: string) => code is Locale;
}

// ─────────────────────────────────────────────
// მთავარი hook
// ─────────────────────────────────────────────
export function useLanguage(): UseLanguageReturn {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  // ─── ენის შეცვლა ───
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      // URL-ის პირველი სეგმენტის შეცვლა (/ka/... → /en/...)
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/') || `/${newLocale}`;

      router.push(newPath);
      router.refresh();
    },
    [locale, pathname, router]
  );

  // ─── მიმდინარე ენის ობიექტი ───
  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0],
    [locale]
  );

  // ─── აქტიურია თუ არა ───
  const isActive = useCallback((code: Locale) => code === locale, [locale]);

  // ─── ვალიდური ენა ───
  const isValidLocale = useCallback(
    (code: string): code is Locale =>
      LANGUAGES.some((l) => l.code === code),
    []
  );

  return {
    locale,
    setLocale,
    languages: LANGUAGES,
    currentLanguage,
    isActive,
    isValidLocale,
  };
}

export default useLanguage;