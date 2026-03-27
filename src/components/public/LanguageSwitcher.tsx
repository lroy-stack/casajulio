'use client';

import { useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
] as const;

type Locale = typeof LOCALES[number]['code'];

interface LanguageSwitcherProps {
  readonly variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <div className="flex items-center font-sans text-[11px] tracking-widest uppercase select-none">
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center">
          <Link
            href={pathname}
            locale={code}
            className={cn(
              'px-1 py-0.5 rounded transition-colors duration-150',
              code === locale
                ? 'text-terracota font-bold'
                : variant === 'light'
                  ? 'text-crema-light/55 hover:text-crema-light'
                  : 'text-carbon/45 hover:text-carbon'
            )}
            aria-current={code === locale ? 'true' : undefined}
          >
            {label}
          </Link>
          {i < LOCALES.length - 1 && (
            <span
              className={cn(
                'text-[9px] mx-0.5',
                variant === 'light' ? 'text-crema-light/25' : 'text-carbon/20'
              )}
              aria-hidden="true"
            >
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
