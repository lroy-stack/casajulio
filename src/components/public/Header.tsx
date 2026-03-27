'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { LanguageSwitcher } from '@/components/public/LanguageSwitcher';

const PHONE_NUMBER = '+34 971 71 06 70';

const NAV_KEYS = [
  { key: 'inicio', href: '/' },
  { key: 'carta', href: '/carta' },
  { key: 'reservar', href: '/#reservas' },
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300 ${
      scrolled
        ? 'bg-crema-light/90 backdrop-blur-md shadow-sm border-b border-border'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`font-display text-2xl tracking-wide transition-colors duration-300 ${
            scrolled ? 'text-carbon' : 'text-crema-light'
          }`}
        >
          Casa Julio
        </Link>

        <nav className="flex items-center gap-7">
          {NAV_KEYS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className={`text-sm font-sans tracking-wide transition-colors duration-300 hover:text-terracota ${
                scrolled ? 'text-carbon' : 'text-crema-light'
              }`}
            >
              {t(key)}
            </Link>
          ))}

          <LanguageSwitcher variant={scrolled ? 'dark' : 'light'} />

          <a
            href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
            className={`flex items-center gap-1.5 text-sm font-sans tracking-wide transition-colors duration-300 hover:text-terracota ${
              scrolled ? 'text-carbon' : 'text-crema-light'
            }`}
          >
            <Phone size={14} aria-hidden="true" />
            <span>{PHONE_NUMBER}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
