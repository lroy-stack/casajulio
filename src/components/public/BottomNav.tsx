'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, UtensilsCrossed, CalendarCheck, Phone } from 'lucide-react';
import { LanguageSwitcher } from '@/components/public/LanguageSwitcher';

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: t('inicio'), href: '/', icon: Home },
    { label: t('carta'), href: '/carta', icon: UtensilsCrossed },
    { label: t('reservar'), href: '/#reservas', icon: CalendarCheck },
    { label: t('contacto'), href: '/#contacto', icon: Phone },
  ] as const;

  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-crema-light border-t border-border"
      aria-label="Navegación móvil"
    >
      <ul className="flex items-stretch h-14">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={label} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 h-full w-full transition-colors duration-200 ${
                  active ? 'text-terracota' : 'text-carbon/50 hover:text-carbon/80'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
                <span className={`text-[9px] font-sans tracking-wide ${active ? 'font-semibold' : 'font-normal'}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-center py-1 border-t border-border/40">
        <LanguageSwitcher variant="dark" />
      </div>
    </nav>
  );
}
