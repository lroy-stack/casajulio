import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTripAdvisor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="8" cy="14" r="3" />
      <circle cx="16" cy="14" r="3" />
      <path d="M3 9c2-2 5-3 9-3s7 1 9 3" />
      <path d="M12 6v2" />
    </svg>
  );
}

export default async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');

  const year = new Date().getFullYear();

  const QUICK_LINKS = [
    { label: tNav('inicio'), href: '/' },
    { label: tNav('carta'), href: '/carta' },
    { label: tNav('reservar'), href: '/#reservas' },
  ];

  const LEGAL_LINKS = [
    { label: t('privacidad'), href: '/politica-privacidad' },
    { label: t('aviso'), href: '/aviso-legal' },
  ];

  const SOCIAL_LINKS = [
    { label: 'Instagram', href: 'https://instagram.com/casajuliopalma', icon: IconInstagram },
    { label: 'Facebook', href: 'https://facebook.com/casajuliopalma', icon: IconFacebook },
    { label: 'TripAdvisor', href: 'https://tripadvisor.com', icon: IconTripAdvisor },
  ];

  return (
    <footer className="bg-carbon text-crema-light">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="md:max-w-xs">
            <span className="font-display text-3xl text-crema-light tracking-wide">Casa Julio</span>
            <p className="mt-3 font-sans text-sm leading-relaxed text-crema-light/50">
              {t('descripcion')}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t('navegacion')}>
            <p className="font-sans text-xs text-crema-light/35 uppercase tracking-widest mb-3">
              {t('navegacion')}
            </p>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="font-sans text-sm text-crema-light/50 hover:text-crema-light transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal + Social */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-sans text-xs text-crema-light/35 uppercase tracking-widest mb-3">{t('legal')}</p>
              <ul className="space-y-2">
                {LEGAL_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="font-sans text-sm text-crema-light/50 hover:text-crema-light transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-sans text-xs text-crema-light/35 uppercase tracking-widest mb-3">{t('siguenos')}</p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} de Casa Julio`}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-crema-light/20 text-crema-light/50 hover:border-crema-light/50 hover:text-crema-light transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-crema-light/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-xs text-crema-light/30">
            {t('copyright', { year })}
          </p>
          <p className="font-sans text-xs text-crema-light/20">{t('ubicacion')}</p>
        </div>
      </div>
    </footer>
  );
}
