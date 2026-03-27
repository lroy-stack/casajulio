'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/public/LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-crema shadow-sm border-b border-border' : 'bg-transparent'
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

        <nav className="hidden md:flex items-center gap-7">
          {[
            { key: 'inicio', href: '/' },
            { key: 'carta', href: '/carta' },
            { key: 'reservar', href: '/#reservas' },
          ].map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className={`text-sm font-sans tracking-wide transition-colors duration-300 hover:text-terracota ${
                scrolled ? 'text-carbon' : 'text-crema-light'
              }`}
            >
              {t(key as 'inicio' | 'carta' | 'reservar')}
            </Link>
          ))}

          <LanguageSwitcher variant={scrolled ? 'dark' : 'light'} />

          <Link
            href="/admin"
            className={`text-xs font-sans tracking-wider uppercase transition-colors duration-300 hover:text-terracota opacity-50 hover:opacity-100 ${
              scrolled ? 'text-carbon' : 'text-crema-light'
            }`}
          >
            {t('admin')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
