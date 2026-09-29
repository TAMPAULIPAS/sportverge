'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useTransition } from 'react';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'ka', label: 'ქარ', full: 'ქართული' },
  { code: 'en', label: 'ENG', full: 'English' },
  { code: 'ru', label: 'РУС', full: 'Русский' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === locale) return;

    startTransition(() => {
      // pathname შეიცავს /ka/... ან /en/... — ვცვლით პირველ სეგმენტს
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/') || `/${newLocale}`;
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span className="font-mono">
          {languages.find((l) => l.code === locale)?.label || 'KA'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-edge rounded-xl shadow-2xl overflow-hidden z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  lang.code === locale
                    ? 'text-lime bg-surface-hover'
                    : 'text-text hover:bg-surface-hover'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted w-8">
                    {lang.label}
                  </span>
                  <span>{lang.full}</span>
                </span>
                {lang.code === locale && <Check size={16} className="text-lime" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
